// Lista de módulos EN VIVO para la página /plugins/: se lee del catálogo de plugins del sistema (el mismo que usa el CRM), así que lo que
// se active, se cierre o se añada allí se refleja en la landing sin volver a compilarla.
//
// El servicio de chat la sirve en `GET /api/plugins?lang=es|en|fr` porque vive en el mismo pod que el nginx de la landing y su `fetch`
// resuelve el nombre del catálogo en CADA petición (nginx lo haría una sola vez al arrancar y se caería si el nombre no existe).
// Es solo lectura de un listado público: no viaja nada del visitante.
//
// Se guarda en memoria por idioma durante unos minutos (cientos de visitas no son cientos de consultas al catálogo) y, si el catálogo
// no contesta, se sirve la última lista buena aunque esté vencida; sin ninguna, el navegador usa la copia que lleva la propia página.

const STATE_OF = { incluido: "included", disponible: "ready", comprado: "ready", desactivado: "ready" };

/** Lo que la landing necesita de cada módulo. El precio es lo que el catálogo ya publica (USD al mes, sin IVA); NO viajan imágenes ni identificadores internos. */
export function normalizeCatalog(list) {
  if (!Array.isArray(list)) throw new Error("el catálogo no devolvió una lista");
  return list
    .filter((p) => p && typeof p.code === "string" && p.isActive !== false && p.isPublic !== false)
    .map((p) => ({
      code: p.code,
      name: String(p.name ?? p.code),
      category: String(p.category ?? ""),
      description: String(p.description ?? ""),
      // Todo lo que no es «incluido» ni «disponible» (en construcción, o un estado nuevo) se trata como «pronto»: nunca se anuncia algo que no se puede usar.
      state: p.isCore ? "included" : (STATE_OF[p.display_status] ?? "soon"),
      // Un precio que no es un entero válido no se inventa: queda en `null` y la página no lo muestra.
      priceCents: Number.isInteger(p.priceCents) && p.priceCents >= 0 ? p.priceCents : null,
      currency: typeof p.currency === "string" && p.currency ? p.currency : "USD",
      dependsOn: (Array.isArray(p.depends_on) ? p.depends_on : []).filter((d) => d && typeof d.code === "string").map((d) => ({ code: d.code, name: String(d.name ?? d.code) })),
    }));
}

/**
 * Una lectura con caché por idioma. `fetchImpl` y `now` se inyectan para probarlo sin red ni relojes.
 *  - `ttlMs`: cuánto vale una lista antes de volver a pedirla.
 *  - `staleMs`: hasta cuándo se sirve una lista VENCIDA si el catálogo no contesta.
 */
export function createPluginsFeed({ url, ttlMs = 300_000, staleMs = 86_400_000, timeoutMs = 5_000, fetchImpl = fetch, now = Date.now, log = () => {} }) {
  const cache = new Map(); // lang → { at, data }
  const pending = new Map(); // lang → Promise (varias visitas a la vez comparten UNA consulta)

  async function load(lang) {
    const res = await fetchImpl(url, { headers: { "accept-language": lang, accept: "application/json" }, signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`el catálogo respondió ${res.status}`);
    const data = normalizeCatalog(await res.json());
    cache.set(lang, { at: now(), data });
    return data;
  }

  return {
    /** `{ data, stale }` o lanza si no hay nada que servir. */
    async get(lang) {
      const hit = cache.get(lang);
      if (hit && now() - hit.at < ttlMs) return { data: hit.data, stale: false };
      if (!pending.has(lang)) pending.set(lang, load(lang).finally(() => pending.delete(lang)));
      try {
        return { data: await pending.get(lang), stale: false };
      } catch (err) {
        log(`[plugins] no se pudo leer el catálogo: ${err?.message ?? err}`);
        if (hit && now() - hit.at < staleMs) return { data: hit.data, stale: true };
        throw err;
      }
    },
  };
}
