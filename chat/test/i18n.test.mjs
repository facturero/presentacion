// Los tres diccionarios (es, en, fr) tienen que decir lo mismo: mismas claves, mismas listas y los mismos {marcadores}.
// Sin esto, un texto nuevo en español que se olvida traducir sale vacío (o en español) en /en/ y /fr/ y nadie lo nota hasta que lo ve un cliente.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const load = (lang) => JSON.parse(readFileSync(new URL(`../../src/i18n/${lang}.json`, import.meta.url), "utf8"));
const dicts = { es: load("es"), en: load("en"), fr: load("fr") };

/** Todas las hojas de un árbol como «ruta → valor». Las listas se recorren por posición. */
function hojas(tree, prefix = "", out = new Map()) {
  if (typeof tree === "string") out.set(prefix, tree);
  else if (Array.isArray(tree)) tree.forEach((v, i) => hojas(v, `${prefix}[${i}]`, out));
  else if (tree && typeof tree === "object") for (const [k, v] of Object.entries(tree)) hojas(v, prefix ? `${prefix}.${k}` : k, out);
  else out.set(prefix, String(tree));
  return out;
}

const es = hojas(dicts.es);
const marcadores = (t) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

for (const lang of ["en", "fr"]) {
  describe(`diccionario ${lang} frente al español`, () => {
    const d = hojas(dicts[lang]);

    test("tiene exactamente las mismas claves y las mismas posiciones en las listas", () => {
      const faltan = [...es.keys()].filter((k) => !d.has(k));
      const sobran = [...d.keys()].filter((k) => !es.has(k));
      assert.deepEqual(faltan, [], `faltan en ${lang}: ${faltan.slice(0, 8).join(", ")}`);
      assert.deepEqual(sobran, [], `sobran en ${lang}: ${sobran.slice(0, 8).join(", ")}`);
    });

    test("ningún texto está vacío", () => {
      const vacios = [...d].filter(([, v]) => !v.trim()).map(([k]) => k);
      assert.deepEqual(vacios, []);
    });

    test("conserva los {marcadores} de cada texto", () => {
      const mal = [...es].filter(([k, v]) => d.has(k) && marcadores(v) !== marcadores(d.get(k))).map(([k]) => k);
      assert.deepEqual(mal, [], `marcadores distintos en: ${mal.join(", ")}`);
    });

    test("conserva lo que NO se traduce: enlaces, rutas, nombres y números", () => {
      // Dominios y rutas que cada texto del español menciona deben aparecer también en la traducción.
      const patron = /\b(?:crm\.noahsolution\.com(?:\/\w+)?|archive\.ubuntu\.com\/ubuntu|launchpad\.net|balenaEtcher|Rufus|Smart App Control|SHA-256|\.exe|\.iso|\.deb)\b/g;
      const perdidos = [];
      for (const [k, v] of es) {
        for (const m of v.match(patron) ?? []) if (d.has(k) && !d.get(k).includes(m)) perdidos.push(`${k}: ${m}`);
      }
      assert.deepEqual(perdidos, []);
    });

    test("no quedó el texto en español sin traducir (salvo nombres propios y cifras)", () => {
      const iguales = [...es]
        .filter(([k, v]) => v.length > 25 && d.get(k) === v)
        .map(([k]) => k);
      assert.deepEqual(iguales, [], `sin traducir en ${lang}: ${iguales.slice(0, 8).join(", ")}`);
    });
  });
}

describe("las páginas existen en cada idioma", () => {
  test("cada idioma tiene su página principal y la de POS Kiosko", () => {
    const pages = new URL("../../src/pages/", import.meta.url);
    for (const lang of ["en", "fr"]) {
      const files = readdirSync(new URL(`${lang}/`, pages));
      assert.ok(files.includes("index.astro") && files.includes("pos-kiosko.astro"), `faltan páginas en /${lang}/`);
    }
  });
});
