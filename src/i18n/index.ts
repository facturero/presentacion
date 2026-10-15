// Idiomas de la landing. El español es el idioma por defecto y NO lleva prefijo (`/`, `/pos-kiosko/`): las direcciones que ya
// existen no cambian. El inglés y el francés cuelgan de `/en/` y `/fr/`. Todo el texto vive en es.json, en.json y fr.json
// con exactamente las mismas claves (una prueba lo comprueba); lo que no es texto (enlaces, versiones, iconos) vive en data/.
import es from "./es.json";
import en from "./en.json";
import fr from "./fr.json";

export const locales = ["es", "en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export type Dict = typeof es;
const dicts: Record<Locale, Dict> = { es, en, fr };

export const localeNames: Record<Locale, string> = { es: "Español", en: "English", fr: "Français" };
/** Para `og:locale`. */
export const ogLocale: Record<Locale, string> = { es: "es_EC", en: "en_US", fr: "fr_FR" };
/** Para `Intl` (formato de números). */
export const intlLocale: Record<Locale, string> = { es: "es-EC", en: "en-US", fr: "fr-FR" };

/** Dirección pública de la web: las `hreflang` y `og:url` deben ser absolutas. */
export const SITE_URL = "https://www.noahsolution.com";

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getDict(locale: Locale): Dict {
  return dicts[locale];
}

/** `localePath("en", "/pos-kiosko/")` → `/en/pos-kiosko/`; el español queda igual. Admite anclas: `/#preguntas`. */
export function localePath(locale: Locale, path: string): string {
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

/** Quita el prefijo de idioma de una ruta: `/fr/pos-kiosko/` → `/pos-kiosko/`. */
export function stripLocale(pathname: string): string {
  for (const l of locales) {
    if (l === defaultLocale) continue;
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

/** La misma página en otro idioma. */
export function switchLocalePath(pathname: string, to: Locale): string {
  return localePath(to, stripLocale(pathname));
}

/** Sustituye `{marcadores}` de un texto del diccionario. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}
