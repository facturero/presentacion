// Lo que NO es texto de la página principal: enlaces, iconos, qué módulo está listo y cuál es esencial para cada tipo de negocio.
// Los textos (en español, inglés y francés) viven en src/i18n/*.json y se unen aquí con `content(lang)`.
// Regla: lo que no existe todavía se marca como «Pronto» (ready: false). No se promete nada que el catálogo no tenga.
import { getDict, localePath, type Locale } from "../i18n";

export const site = {
  name: "noahsolutions",
  product: "POS Kiosko",
  crmUrl: "https://crm.noahsolution.com",
  // `?mode=register` abre directamente "Crear cuenta" en el CRM (si el CRM aún no lo soporta, abre el acceso normal).
  trialUrl: "https://crm.noahsolution.com/login?mode=register",
  // TODO: confirmar este correo (es una suposición a partir del dominio) antes de publicar.
  contactEmail: "contacto@noahsolution.com",
};

// icon: ruta SVG de 24x24 (trazo). `key` enlaza con home.areas.<key> de los diccionarios.
const areaMeta = [
  { key: "clients", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { key: "inventory", icon: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3.3 7.5L12 12.5l8.7-5M12 22V12.5" },
  { key: "invoicing", icon: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zM14 3v6h6M8 13h8M8 17h5" },
  { key: "pos", icon: "M3 9h18M5 9V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M9 14h6", href: "/pos-kiosko/" },
  { key: "branches", icon: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" },
  { key: "security", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" },
] as const;

// Cada módulo marca si ya está disponible (ready) o llega pronto. Los códigos coinciden con el catálogo de plugins.
// El nombre sale de home.modules.<id>.
type Mod = { id: string; ready: boolean; essential: boolean };
const m = (id: string, ready: boolean, essential = false): Mod => ({ id, ready, essential });

const profileModules: Record<string, Mod[]> = {
  tienda: [
    m("catalog", true, true), m("clients", true, true), m("invoicing", true, true),
    m("pos", true, true), m("cashbox", true, true), m("payments", true, true),
    m("kardex", true), m("discounts", true),
    m("restock", false), m("dashboards", false),
  ],
  farmacia: [
    m("catalog", true, true), m("clients", true, true), m("invoicing", true, true),
    m("pos", true, true), m("cashbox", true, true), m("payments", true, true),
    m("kardex", true, true), m("lots", false, true),
    m("restock", false), m("suppliers", false), m("purchaseOrders", false), m("dashboards", false),
  ],
  restaurante: [
    m("catalog", true, true), m("invoicing", true, true), m("pos", true, true),
    m("cashbox", true, true), m("payments", true, true),
    m("discounts", true), m("kardex", true),
    m("recipes", false), m("attendance", false),
  ],
  servicios: [
    m("clients", true, true), m("invoicing", true, true),
    m("quotes", false, true), m("tasks", false, true),
    m("hours", false), m("projectBilling", false), m("opportunities", false), m("sharedDocs", true),
  ],
  distribuidora: [
    m("catalog", true, true), m("clients", true, true), m("invoicing", true, true),
    m("warehouses", true, true), m("kardex", true, true),
    m("purchaseOrders", false), m("suppliers", false), m("transfers", false),
    m("quotes", false), m("receivables", false),
  ],
  otro: [m("catalog", true, true), m("clients", true, true), m("invoicing", true, true)],
};

/** Todo el contenido de la página principal en el idioma pedido, con la misma forma que usan los componentes. */
export function content(lang: Locale) {
  const d = getDict(lang);
  const h = d.home;
  return {
    site: { ...site, title: h.meta.title, description: h.meta.description },
    nav: [
      { href: localePath(lang, "/#que-incluye"), label: d.nav.features },
      { href: localePath(lang, "/plugins/"), label: d.nav.plugins },
      { href: localePath(lang, "/#tu-negocio"), label: d.nav.forYou },
      { href: localePath(lang, "/pos-kiosko/"), label: d.nav.pos },
      { href: localePath(lang, "/#preguntas"), label: d.nav.faq },
    ],
    hero: h.hero,
    benefits: h.benefits,
    areas: areaMeta.map((a) => {
      const t = h.areas[a.key] as { title: string; text: string; cta?: string };
      return {
        icon: a.icon,
        title: t.title,
        text: t.text,
        ...("href" in a ? { href: localePath(lang, a.href), cta: t.cta } : {}),
      };
    }),
    profiles: Object.entries(profileModules).map(([id, mods]) => {
      const t = h.profiles[id as keyof typeof h.profiles];
      return {
        id,
        label: t.label,
        blurb: t.blurb,
        modules: mods.map((x) => ({ ...x, name: h.modules[x.id as keyof typeof h.modules] })),
      };
    }),
    roadmap: h.roadmap,
    steps: h.steps.items,
    faqs: h.faq.items,
  };
}
