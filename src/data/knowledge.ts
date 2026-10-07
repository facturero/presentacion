// Lo que el asistente de la página "sabe". Se arma con los MISMOS datos que pintan las páginas (content.ts y pos.ts):
// así el asistente no puede prometer nada que la web no prometa, y lo marcado «Pronto» sigue siendo «Pronto».
// Se publica en el build como knowledge.json y SOLO lo lee el servicio de chat (la imagen web lo borra de dist/).
import { site, hero, benefits, areas, profiles, roadmap, steps, faqs } from "./content";
import { iso, windows, downloads, highlights, guide, posFaqs } from "./pos";

const lines = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

export function buildKnowledge(): string {
  const parts: string[] = [];

  parts.push(`# Datos de contacto y enlaces
- Empresa: ${site.name}
- Crear cuenta y probar gratis: ${site.trialUrl} (en esa pantalla se pulsa «Crear cuenta»)
- Iniciar sesión en el sistema: ${site.crmUrl}
- Página de POS Kiosko (descargas y guía): https://www.noahsolution.com/pos-kiosko/
- Correo de contacto: ${site.contactEmail}`);

  parts.push(`# Qué es el sistema
${hero.title}. ${hero.lead}
${lines(hero.badges)}
${lines(benefits.map((b) => `${b.title}: ${b.text}`))}`);

  parts.push(`# Qué incluye hoy
${lines(areas.map((a) => `${a.title}: ${a.text}`))}`);

  // Una línea por tipo de negocio y solo nombres: este texto se recorta por relevancia y el modelo local tiene poco contexto.
  parts.push(`# Módulos recomendados por tipo de negocio
Los módulos se activan por separado. «Disponibles» ya se pueden usar; «Pronto» todavía NO existen.
${profiles
  .map((p) => {
    const ya = p.modules.filter((m) => m.ready).map((m) => m.name);
    const pronto = p.modules.filter((m) => !m.ready).map((m) => m.name);
    return `- ${p.label} (${p.blurb}) Disponibles: ${ya.join(", ")}.${pronto.length ? ` Pronto: ${pronto.join(", ")}.` : ""}`;
  })
  .join("\n")}
Áreas en camino (todavía no existen): ${roadmap.join("; ")}.`);

  parts.push(`# Cómo empezar
${lines(steps.map((s, i) => `Paso ${i + 1}: ${s.title}. ${s.text}`))}`);

  parts.push(`# Preguntas frecuentes del sistema
${faqs.map((f) => `P: ${f.q}\nR: ${f.a}`).join("\n")}`);

  parts.push(`# POS Kiosko (la caja del mostrador)
POS Kiosko es la caja que se conecta al sistema. Necesita una cuenta del sistema para funcionar.
${lines(highlights.map((h) => `${h.title}: ${h.text}`))}`);

  parts.push(`# Descargas de POS Kiosko (en https://www.noahsolution.com/pos-kiosko/)
${lines(
  downloads.map(
    (d) =>
      `${d.title}: ${d.ready ? "DISPONIBLE" : "PRÓXIMAMENTE (aún no se puede descargar)"}. ${d.text} ${d.meta}.${d.ready && "href" in d ? ` Enlace: ${d.href}` : ""}`,
  ),
)}
Windows: versión ${windows.version} (${windows.size}). La imagen para equipo dedicado pesa ${iso.size}${iso.published ? "" : " y aún no está disponible"}.`);

  // Cada paso de la guía es su propia sección: así solo viaja el que se pregunta (instalar, emparejar, entrar, vender…).
  for (const g of guide) {
    parts.push(`# Guía de POS Kiosko: ${g.title}\n${g.intro}\n${lines(g.steps)}`);
  }

  parts.push(`# Preguntas frecuentes de POS Kiosko
${posFaqs.map((f) => `P: ${f.q}\nR: ${f.a}`).join("\n")}`);

  return parts.join("\n\n");
}
