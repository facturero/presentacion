// Lo que NO es texto de la página de POS Kiosko (caja web, instalada en Windows o en un equipo dedicado): versiones, tamaños,
// enlaces y qué descarga está lista. Los textos en cada idioma viven en src/i18n/*.json y se unen con `posContent(lang)`.
// Para publicar una versión nueva del .exe, cambia `version` y `file` aquí.
// Las descargas salen de los Releases de GitHub (facturero/pos); el instalador de Windows se sube al mismo Release del kiosco.

import { site } from "./content";
import { fill, getDict, intlLocale, type Locale } from "../i18n";

const RELEASES = "https://github.com/facturero/pos/releases";

// La caja web es una pantalla del propio CRM (ruta /pos): no se descarga nada y siempre abre la última versión.
export const webPos = { href: `${site.crmUrl}/pos` };

export const windows = {
  version: "0.3.12",
  file: "POS-Desktop-Setup-0.3.12.exe",
  sizeMb: 205,
};

// ISO del equipo dedicado. Se publica en Cloudflare R2 (GitHub no admite archivos de más de 2 GiB y esta pesa ~3,8 GiB).
// Para ACTIVARLA en la página: sube el archivo al bucket y pon `published: true` (ver README, «Publicar la ISO»).
export const iso = {
  published: true,
  file: "pos-kiosko-instalador-2026-10-07.iso",
  base: "https://download.noahsolution.com/pos-kiosko",
  sizeGb: 3.8,
  sha256: "80d2bb44b392218f25f0e79aae0fb40e379ade1edabf6560d9e61316cb74922f",
};
const isoUrl = `${iso.base}/${iso.file}`;

/** «3,8 GB» o «3.8 GB» según el idioma. */
const gb = (lang: Locale) => `${new Intl.NumberFormat(intlLocale[lang], { maximumFractionDigits: 1 }).format(iso.sizeGb)} GB`;
const mb = (lang: Locale) => `${new Intl.NumberFormat(intlLocale[lang]).format(windows.sizeMb)} MB`;

/** Tamaños ya formateados (los usa también el conocimiento del asistente). */
export const sizes = (lang: Locale) => ({ windows: mb(lang), iso: gb(lang) });

export function posContent(lang: Locale) {
  const p = getDict(lang).pos;
  const dl = p.downloads;
  const s = sizes(lang);

  const downloads = [
    {
      id: "web",
      badge: getDict(lang).ui.available,
      ready: true,
      title: dl.items.web.title,
      text: dl.items.web.text,
      meta: dl.items.web.meta,
      href: webPos.href,
      cta: dl.items.web.cta,
    },
    {
      id: "windows",
      badge: getDict(lang).ui.available,
      ready: true,
      title: dl.items.windows.title,
      text: dl.items.windows.text,
      meta: fill(dl.version, { version: windows.version, size: s.windows }),
      href: `${RELEASES}/download/v${windows.version}/${windows.file}`,
      cta: dl.items.windows.cta,
      more: { href: RELEASES, label: dl.items.windows.more },
    },
    {
      id: "iso",
      badge: iso.published ? getDict(lang).ui.available : getDict(lang).ui.comingSoon,
      ready: iso.published,
      title: dl.items.iso.title,
      text: dl.items.iso.text,
      meta: fill(dl.isoMeta, { size: s.iso }),
      href: isoUrl,
      cta: iso.published ? dl.items.iso.cta : dl.items.iso.ctaAsk,
      more: iso.published ? { href: `${isoUrl}.sha256`, label: dl.items.iso.more } : undefined,
      sha256: iso.sha256,
    },
    {
      id: "deb",
      badge: getDict(lang).ui.comingSoon,
      ready: false,
      title: dl.items.deb.title,
      text: dl.items.deb.text,
      meta: dl.items.deb.meta,
      cta: dl.items.deb.cta,
    },
  ];

  return {
    meta: p.meta,
    hero: p.hero,
    what: p.what,
    downloadsCopy: dl,
    // Aviso de marcas de la imagen (.iso). Va visible junto a las descargas y el asistente lo conoce. La imagen es una versión
    // modificada de Ubuntu Server: Canonical permite redistribuirla, pero no que se presente como Ubuntu ni como respaldada por
    // ellos. La imagen no usa el nombre ni el logo de Ubuntu en sus pantallas; este texto cubre la atribución.
    isoLegal: dl.isoLegal,
    downloads,
    highlights: p.highlights,
    guideCopy: p.guide,
    guide: p.guide.sections,
    faqCopy: p.faq,
    posFaqs: p.faq.items,
    cta: p.cta,
  };
}
