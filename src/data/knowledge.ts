// Lo que el asistente de la página "sabe", UNA VEZ POR IDIOMA. Se arma con los MISMOS datos que pintan las páginas (content.ts, pos.ts
// y los diccionarios de i18n): así el asistente no puede prometer nada que la web no prometa, y lo marcado «Pronto» sigue
// siendo «Pronto» en cada idioma. Se publica en el build como knowledge/<idioma>.json y SOLO lo lee el servicio de chat
// (la imagen web lo borra de dist/).
import { content, site } from "./content";
import { iso, posContent, sizes, windows } from "./pos";
import { getDict, localePath, SITE_URL, type Locale } from "../i18n";
import { pluginAreas, plugins } from "./plugins";

const lines = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

// Títulos de sección y etiquetas sueltas, por idioma. Los títulos empiezan por «# »: el servicio de chat parte el texto en esas
// secciones y manda solo las que tienen que ver con la pregunta (ver chat/core.mjs). `contact` y `overview` son las dos que
// el servicio trata de forma especial (siempre viaja el contacto; si nada coincide, viaja el resumen).
const L = {
  es: {
    contact: "Datos de contacto y enlaces",
    company: "Empresa",
    trial: "Crear cuenta y probar gratis",
    trialNote: "abre directamente la pantalla para crear la cuenta",
    login: "Iniciar sesión en el sistema",
    posPage: "Página de POS Kiosko (descargas y guía)",
    email: "Correo de contacto",
    what: "Qué es el sistema",
    included: "Qué incluye hoy",
    modules: "Módulos recomendados por tipo de negocio",
    modulesIntro: "Los módulos se activan por separado. «Disponibles» ya se pueden usar; «Pronto» todavía NO existen.",
    available: "Disponibles",
    soon: "Pronto",
    roadmap: "Áreas en camino (todavía no existen)",
    start: "Cómo empezar",
    step: "Paso",
    faq: "Preguntas frecuentes del sistema",
    q: "P",
    a: "R",
    pos: "POS Kiosko (la caja del mostrador)",
    posIntro: "POS Kiosko es la caja que se conecta al sistema. Necesita una cuenta del sistema para funcionar.",
    downloads: "Descargas de POS Kiosko",
    availableCaps: "DISPONIBLE",
    soonCaps: "PRÓXIMAMENTE (aún no se puede descargar)",
    link: "Enlace",
    windowsLine: (v: string, size: string) => `Windows: versión ${v} (${size}).`,
    isoLine: (size: string, published: boolean) => `La imagen para equipo dedicado pesa ${size}${published ? "" : " y aún no está disponible"}.`,
    guide: "Guía de POS Kiosko",
    posFaq: "Preguntas frecuentes de POS Kiosko",
    pluginsTitle: "Lista completa de módulos del sistema",
    pluginsIntro: "Se puede ver sin crear cuenta en {url}. «Incluido» viene en toda cuenta; «Disponible» ya funciona; «Pronto» todavía NO existe. Cada empresa arma su propia lista activando solo los que necesita; los que dependen de otros los arrastran.",
    pluginIncluded: "Incluido",
    pluginReady: "Disponible",
    pluginSoon: "Pronto",
  },
  en: {
    contact: "Contact details and links",
    company: "Company",
    trial: "Create an account and try it free",
    trialNote: "it opens the account creation screen directly",
    login: "Log in to the system",
    posPage: "POS Kiosko page (downloads and guide)",
    email: "Contact email",
    what: "What the system is",
    included: "What is included today",
    modules: "Recommended modules by type of business",
    modulesIntro: "Modules are turned on separately. “Available” ones can be used now; “Coming soon” ones do NOT exist yet.",
    available: "Available",
    soon: "Coming soon",
    roadmap: "Areas on the way (they do not exist yet)",
    start: "How to start",
    step: "Step",
    faq: "System frequently asked questions",
    q: "Q",
    a: "A",
    pos: "POS Kiosko (the counter register)",
    posIntro: "POS Kiosko is the register that connects to the system. It needs a system account to work.",
    downloads: "POS Kiosko downloads",
    availableCaps: "AVAILABLE",
    soonCaps: "COMING SOON (it cannot be downloaded yet)",
    link: "Link",
    windowsLine: (v: string, size: string) => `Windows: version ${v} (${size}).`,
    isoLine: (size: string, published: boolean) => `The image for a dedicated computer weighs ${size}${published ? "" : " and is not available yet"}.`,
    guide: "POS Kiosko guide",
    posFaq: "POS Kiosko frequently asked questions",
    pluginsTitle: "Full list of system modules",
    pluginsIntro: "It can be seen without creating an account at {url}. \"Included\" comes with every account; \"Available\" already works; \"Soon\" does NOT exist yet. Each company builds its own list by switching on only what it needs; modules that depend on others pull them in.",
    pluginIncluded: "Included",
    pluginReady: "Available",
    pluginSoon: "Soon",
  },
  fr: {
    contact: "Coordonnées et liens",
    company: "Entreprise",
    trial: "Créer un compte et essayer gratuitement",
    trialNote: "ouvre directement l'écran de création de compte",
    login: "Se connecter au système",
    posPage: "Page de POS Kiosko (téléchargements et guide)",
    email: "E-mail de contact",
    what: "Ce qu'est le système",
    included: "Ce qui est inclus aujourd'hui",
    modules: "Modules recommandés par type d'activité",
    modulesIntro: "Les modules s'activent séparément. « Disponibles » peuvent déjà être utilisés ; « Bientôt » n'existent PAS encore.",
    available: "Disponibles",
    soon: "Bientôt",
    roadmap: "Domaines en chemin (ils n'existent pas encore)",
    start: "Comment commencer",
    step: "Étape",
    faq: "Questions fréquentes du système",
    q: "Q",
    a: "R",
    pos: "POS Kiosko (la caisse du comptoir)",
    posIntro: "POS Kiosko est la caisse qui se connecte au système. Elle a besoin d'un compte du système pour fonctionner.",
    downloads: "Téléchargements de POS Kiosko",
    availableCaps: "DISPONIBLE",
    soonCaps: "BIENTÔT (pas encore téléchargeable)",
    link: "Lien",
    windowsLine: (v: string, size: string) => `Windows : version ${v} (${size}).`,
    isoLine: (size: string, published: boolean) => `L'image pour ordinateur dédié pèse ${size}${published ? "" : " et n'est pas encore disponible"}.`,
    guide: "Guide de POS Kiosko",
    posFaq: "Questions fréquentes de POS Kiosko",
    pluginsTitle: "Liste complète des modules du système",
    pluginsIntro: "Elle est consultable sans créer de compte sur {url}. « Inclus » est présent dans tout compte ; « Disponible » fonctionne déjà ; « Bientôt » n'existe PAS encore. Chaque entreprise compose sa propre liste en activant seulement ce dont elle a besoin ; les modules qui dépendent d'autres les entraînent.",
    pluginIncluded: "Inclus",
    pluginReady: "Disponible",
    pluginSoon: "Bientôt",
  },
} as const;

/** Los dos títulos que el servicio de chat trata de forma especial, para poder reconocerlos sin repetir los textos allí. */
export function knowledgeMarkers(lang: Locale) {
  const l = L[lang];
  return { contactTitle: l.contact, fallbackTitles: [l.what, l.included] };
}

export function buildKnowledge(lang: Locale): string {
  const l = L[lang];
  const c = content(lang);
  const p = posContent(lang);
  const sz = sizes(lang);
  const parts: string[] = [];

  parts.push(`# ${l.contact}
- ${l.company}: ${site.name}
- ${l.trial}: ${site.trialUrl} (${l.trialNote})
- ${l.login}: ${site.crmUrl}
- ${l.posPage}: ${SITE_URL}${localePath(lang, "/pos-kiosko/")}
- ${l.email}: ${site.contactEmail}`);

  parts.push(`# ${l.what}
${c.hero.title}. ${c.hero.lead}
${lines(c.hero.badges)}
${lines(c.benefits.map((b) => `${b.title}: ${b.text}`))}`);

  parts.push(`# ${l.included}
${lines(c.areas.map((a) => `${a.title}: ${a.text}`))}`);

  // Una línea por tipo de negocio y solo nombres: este texto se recorta por relevancia y el modelo local tiene poco contexto.
  parts.push(`# ${l.modules}
${l.modulesIntro}
${c.profiles
  .map((pr) => {
    const ya = pr.modules.filter((m) => m.ready).map((m) => m.name);
    const pronto = pr.modules.filter((m) => !m.ready).map((m) => m.name);
    return `- ${pr.label} (${pr.blurb}) ${l.available}: ${ya.join(", ")}.${pronto.length ? ` ${l.soon}: ${pronto.join(", ")}.` : ""}`;
  })
  .join("\n")}
${l.roadmap}: ${c.roadmap.join("; ")}.`);

  // Todos los módulos, una línea por área y SOLO con nombre y estado: el asistente no puede prometer lo que la lista marca como «Pronto».
  const pluginDict = getDict(lang).plugins;
  const pluginItems = pluginDict.items as Record<string, { name: string; text: string }>;
  const stateLabel = { included: l.pluginIncluded, ready: l.pluginReady, soon: l.pluginSoon } as const;
  parts.push(`# ${l.pluginsTitle}
${l.pluginsIntro.replace("{url}", `${SITE_URL}${localePath(lang, "/plugins/")}`)}
${pluginAreas
  .map((area) => {
    const names = plugins.filter((p) => p.area === area).map((p) => `${pluginItems[p.id].name} [${stateLabel[p.state]}]`);
    return `- ${(pluginDict.categories as Record<string, string>)[area]}: ${names.join("; ")}.`;
  })
  .join("\n")}`);

  parts.push(`# ${l.start}
${lines(c.steps.map((s, i) => `${l.step} ${i + 1}: ${s.title}. ${s.text}`))}`);

  parts.push(`# ${l.faq}
${c.faqs.map((f) => `${l.q}: ${f.q}\n${l.a}: ${f.a}`).join("\n")}`);

  parts.push(`# ${l.pos}
${l.posIntro}
${lines(p.highlights.map((h) => `${h.title}: ${h.text}`))}`);

  parts.push(`# ${l.downloads} (${SITE_URL}${localePath(lang, "/pos-kiosko/")})
${lines(
  p.downloads.map(
    (d) =>
      `${d.title}: ${d.ready ? l.availableCaps : l.soonCaps}. ${d.text} ${d.meta}.${d.ready && "href" in d ? ` ${l.link}: ${d.href}` : ""}`,
  ),
)}
${l.windowsLine(windows.version, sz.windows)} ${l.isoLine(sz.iso, iso.published)}
${p.isoLegal}`);

  // Cada paso de la guía es su propia sección: así solo viaja el que se pregunta (instalar, emparejar, entrar, vender…).
  for (const g of getDict(lang).pos.guide.sections) {
    parts.push(`# ${l.guide}: ${g.title}\n${g.intro}\n${lines(g.steps)}`);
  }

  parts.push(`# ${l.posFaq}
${p.posFaqs.map((f) => `${l.q}: ${f.q}\n${l.a}: ${f.a}`).join("\n")}`);

  return parts.join("\n\n");
}
