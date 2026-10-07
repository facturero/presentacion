// Se genera en el build como dist/knowledge.json. El servicio de chat lo carga al arrancar. NO es contenido público:
// el Dockerfile lo mueve fuera de la carpeta que sirve nginx.
import { buildKnowledge } from "../data/knowledge";
import { site } from "../data/content";

export const GET = () =>
  new Response(JSON.stringify({ contactEmail: site.contactEmail, text: buildKnowledge() }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
