// Pruebas de la lista de módulos en vivo (chat/plugins.mjs y GET /api/plugins). Sin red: el catálogo se simula.
import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { normalizeCatalog, createPluginsFeed } from "../plugins.mjs";
import { createApp } from "../server.mjs";

const abiertos = [];
after(() => { for (const s of abiertos) { s.closeAllConnections?.(); s.close(); } });

const mod = (code, over = {}) => ({
  id: `id-${code}`, code, name: `Nombre ${code}`, category: "Ventas", description: "Descripción.", imageUrl: null, buildStatus: "disponible",
  priceCents: 999, currency: "USD", isActive: true, isCore: false, isPublic: true, createdForOrganizationId: null, basedOnPluginId: null,
  display_status: "disponible", is_exclusive: false, depends_on: [], ...over,
});

describe("normalizeCatalog", () => {
  test("solo deja lo que la landing necesita: no viajan precios, imágenes ni ids internos", () => {
    const [p] = normalizeCatalog([mod("crm.contacts", { depends_on: [{ code: "x.y", name: "Y", autoActivate: true }] })]);
    assert.deepEqual(Object.keys(p).sort(), ["category", "code", "dependsOn", "description", "name", "state"]);
    assert.deepEqual(p.dependsOn, [{ code: "x.y", name: "Y" }]);
  });

  test("el estado: núcleo → incluido; disponible → disponible; en construcción o desconocido → pronto (nunca se anuncia lo que no se puede usar)", () => {
    const r = normalizeCatalog([
      mod("a", { isCore: true, display_status: "incluido" }),
      mod("b"),
      mod("c", { display_status: "en_construccion", buildStatus: "en_construccion" }),
      mod("d", { display_status: "algo_nuevo" }),
      mod("e", { display_status: undefined }),
    ]);
    assert.deepEqual(r.map((p) => p.state), ["included", "ready", "soon", "soon", "soon"]);
  });

  test("un módulo inactivo o no público no sale", () => {
    const r = normalizeCatalog([mod("a"), mod("b", { isActive: false }), mod("c", { isPublic: false })]);
    assert.deepEqual(r.map((p) => p.code), ["a"]);
  });

  test("lo que no es una lista, o trae basura, no se acepta o se descarta", () => {
    assert.throws(() => normalizeCatalog({ error: "x" }));
    assert.throws(() => normalizeCatalog(null));
    assert.deepEqual(normalizeCatalog([null, 3, {}, mod("ok")]).map((p) => p.code), ["ok"]);
  });
});

/** Un `fetch` falso que cuenta las llamadas y puede fallar. */
function fakeFetch(respuestas) {
  const llamadas = [];
  const impl = async (url, opts) => {
    llamadas.push({ url, lang: opts.headers["accept-language"] });
    const r = typeof respuestas === "function" ? respuestas(llamadas.length) : respuestas;
    if (r instanceof Error) throw r;
    return { ok: r.ok ?? true, status: r.status ?? 200, json: async () => r.body };
  };
  return { impl, llamadas };
}

describe("createPluginsFeed", () => {
  test("pide el catálogo en el idioma pedido y lo guarda: dos visitas seguidas son UNA consulta", async () => {
    const f = fakeFetch({ body: [mod("a")] });
    let t = 0;
    const feed = createPluginsFeed({ url: "http://catalogo/plugins", fetchImpl: f.impl, now: () => t });
    const a = await feed.get("en");
    const b = await feed.get("en");
    assert.equal(f.llamadas.length, 1);
    assert.equal(f.llamadas[0].lang, "en");
    assert.deepEqual(a.data, b.data);
    await feed.get("fr"); // otro idioma = otra consulta
    assert.equal(f.llamadas.length, 2);
  });

  test("pasado el tiempo vuelve a preguntar: un módulo que cambia en el catálogo se ve sin recompilar", async () => {
    let estado = "disponible";
    const f = fakeFetch(() => ({ body: [mod("a", { display_status: estado })] }));
    let t = 0;
    const feed = createPluginsFeed({ url: "u", ttlMs: 1000, fetchImpl: f.impl, now: () => t });
    assert.equal((await feed.get("es")).data[0].state, "ready");
    estado = "en_construccion"; // se cerró el módulo
    t = 500;
    assert.equal((await feed.get("es")).data[0].state, "ready"); // aún vale lo guardado
    t = 1500;
    assert.equal((await feed.get("es")).data[0].state, "soon"); // ya se enteró
  });

  test("visitas simultáneas comparten una sola consulta", async () => {
    const f = fakeFetch({ body: [mod("a")] });
    const feed = createPluginsFeed({ url: "u", fetchImpl: f.impl });
    await Promise.all([feed.get("es"), feed.get("es"), feed.get("es")]);
    assert.equal(f.llamadas.length, 1);
  });

  test("si el catálogo no contesta, sirve la última lista buena (marcada como vencida); sin ninguna, lanza", async () => {
    let falla = false;
    const f = fakeFetch(() => (falla ? new Error("caído") : { body: [mod("a")] }));
    let t = 0;
    const feed = createPluginsFeed({ url: "u", ttlMs: 1000, staleMs: 10_000, fetchImpl: f.impl, now: () => t });
    await assert.rejects(createPluginsFeed({ url: "u", fetchImpl: fakeFetch(new Error("caído")).impl }).get("es"));
    await feed.get("es");
    falla = true;
    t = 2000;
    const r = await feed.get("es");
    assert.equal(r.stale, true);
    assert.equal(r.data[0].code, "a");
    t = 20_000; // demasiado vieja para servirla
    await assert.rejects(feed.get("es"));
  });

  test("una respuesta de error o rota cuenta como fallo, no como lista vacía", async () => {
    await assert.rejects(createPluginsFeed({ url: "u", fetchImpl: fakeFetch({ ok: false, status: 500, body: [] }).impl }).get("es"));
    await assert.rejects(createPluginsFeed({ url: "u", fetchImpl: fakeFetch({ body: { message: "no" } }).impl }).get("es"));
  });
});

async function arrancar(config) {
  const app = createApp({ knowledge: "K", contactEmail: "a@b.c", provider: "openai-compat", baseUrl: "http://x", model: "m", timeoutMs: 1000, maxTokens: 10, maxOutputChars: 100, perMinute: 100, perDay: 100, log: () => {}, ...config });
  abiertos.push(app);
  await new Promise((ok) => app.listen(0, "127.0.0.1", ok));
  const base = `http://127.0.0.1:${app.address().port}`;
  const get = (path) => new Promise((resolve, reject) => http.get(base + path, (res) => { let b = ""; res.on("data", (c) => (b += c)); res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, json: JSON.parse(b) })); }).on("error", reject));
  return { get };
}

describe("GET /api/plugins", () => {
  test("devuelve la lista del idioma pedido (uno desconocido es español) con un minuto de caché", async () => {
    const f = fakeFetch({ body: [mod("a")] });
    const app = await arrancar({ pluginsFeed: createPluginsFeed({ url: "u", fetchImpl: f.impl }) });
    const r = await app.get("/api/plugins?lang=fr");
    assert.equal(r.status, 200);
    assert.deepEqual(r.json.plugins.map((p) => p.code), ["a"]);
    assert.equal(r.json.stale, false);
    assert.match(r.headers["cache-control"], /max-age=60/);
    assert.equal(f.llamadas[0].lang, "fr");
    await app.get("/api/plugins?lang=klingon");
    assert.equal(f.llamadas[1].lang, "es");
  });

  test("si el catálogo está caído y no hay copia, responde 502 con un mensaje amable (sin detalles internos)", async () => {
    const app = await arrancar({ pluginsFeed: createPluginsFeed({ url: "u", fetchImpl: fakeFetch(new Error("ECONNREFUSED 10.0.0.5")).impl }) });
    const r = await app.get("/api/plugins");
    assert.equal(r.status, 502);
    assert.doesNotMatch(JSON.stringify(r.json), /ECONNREFUSED|10\.0\.0/);
  });

  test("sin catálogo configurado no existe (404): la página usa su copia", async () => {
    const app = await arrancar({});
    assert.equal((await app.get("/api/plugins")).status, 404);
  });
});
