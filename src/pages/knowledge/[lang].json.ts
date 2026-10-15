// Se genera en el build como dist/knowledge/es.json, en.json y fr.json. El servicio de chat los carga al arrancar. NO es contenido
// público: el Dockerfile mueve la carpeta fuera de la que sirve nginx.
import { buildKnowledge, knowledgeMarkers } from "../../data/knowledge";
import { site } from "../../data/content";
import { locales, type Locale } from "../../i18n";

export const getStaticPaths = () => locales.map((lang) => ({ params: { lang } }));

export const GET = ({ params }: { params: { lang: Locale } }) =>
  new Response(
    JSON.stringify({ contactEmail: site.contactEmail, text: buildKnowledge(params.lang), ...knowledgeMarkers(params.lang) }),
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  );
