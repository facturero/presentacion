# Presentación — CRM y POS Kiosko

Landing de una sola página para quien busca el CRM. **Astro + Tailwind CSS 4**, sin base de datos ni backend: se compila a HTML y CSS estáticos (≈64 KB) y se sube a cualquier hosting.

```bash
cd presentacion
npm install
npm run dev       # http://localhost:4321
npm run build     # genera dist/ (esto es lo que se publica)
npm run preview   # sirve dist/ para revisarlo antes de subir
```

## Páginas

- `/` — la plataforma: qué es, qué incluye hoy, módulos por tipo de negocio, cómo empezar y preguntas. Botón principal: **Pruébalo gratis** (abre directamente «Crear cuenta» en el CRM con `?mode=register`).
- `/plugins/` — **todos los módulos del sistema**, agrupados por área, con lo que hace cada uno y su estado (**Incluido**, **Disponible** o **Pronto**), para verlos sin crear cuenta. **La lista se lee EN VIVO del catálogo de plugins del sistema** (ver «Módulos en vivo» abajo): un módulo que se active, se cierre o se añada allí se ve sin recompilar. Filtros por texto, estado y área, y un **armador de lista** en el navegador: se marcan los módulos, los que dependen de otros los arrastran solos y la lista se copia o se manda por correo (se guarda solo en el `localStorage` de quien la arma; no se envía nada).
- `/pos-kiosko/` — producto aparte: qué es, **descargas** (caja web, .exe, .iso, .deb), guía de uso paso a paso y preguntas.

Cada página existe en **tres idiomas**: español (`/`, sin prefijo, así las direcciones de siempre no cambian), inglés (`/en/`) y francés (`/fr/`), los mismos que el CRM. Un selector `ES · EN · FR` en la cabecera lleva a la MISMA página en otro idioma; el `<html lang>`, las `hreflang` y el `canonical` los pone `Layout.astro` para que los buscadores sepan que son traducciones. No hay redirección automática por el idioma del navegador (a un buscador o a quien comparte un enlace no se le debe cambiar de página).

## Idiomas

- **Todo el texto vive en `src/i18n/es.json`, `en.json` y `fr.json`**, con exactamente las mismas claves. Lo que no es texto (enlaces, versiones, iconos, qué módulo está listo) sigue en `src/data/`, una sola vez.
- **Añadir o cambiar un texto:** edítalo en los tres JSON. `npm test` falla si falta una clave, si una traducción quedó vacía o igual al español, o si se perdió un `{marcador}` o un enlace.
- **Añadir un idioma:** crear `src/i18n/<código>.json` (copia de `es.json`), registrarlo en `src/i18n/index.ts` (`locales`, nombres), crear `src/pages/<código>/index.astro` y `pos-kiosko.astro` (son dos líneas) y añadir su `PROMPTS` y `ERRORS` en `chat/core.mjs`.
- **El asistente de IA contesta en el idioma de la página:** el widget manda `lang` y el servicio elige el conocimiento (`dist/knowledge/<idioma>.json`), las reglas y los mensajes de ese idioma. Si falta el idioma, contesta en español.
- Las traducciones al inglés y al francés las revisó una máquina, no una persona del oficio: conviene que alguien que domine cada idioma las lea una vez (sobre todo la guía de POS Kiosko y los textos legales).

## Dónde se edita cada cosa

| Qué | Dónde |
|---|---|
| **Textos** de todo el sitio (titular, áreas, módulos, pasos, preguntas, descargas, guía, asistente), en cada idioma | `src/i18n/es.json`, `en.json`, `fr.json` |
| Correo, URL del CRM y de la prueba; iconos; **qué módulo está listo y cuál es esencial** por tipo de negocio | `src/data/content.ts` |
| **Descargas** de POS Kiosko: versión, tamaño, enlaces, qué está publicado | `src/data/pos.ts` |
| **Módulos** de la página `/plugins/`: código del catálogo, área, estado (`included`/`ready`/`soon`) y dependencias | `src/data/plugins.ts` |
| Nombre y qué hace cada módulo, y el nombre de cada área, en cada idioma | `plugins.items.<id>` y `plugins.categories.<área>` de los JSON |
| Estructura de cada página (la misma para todos los idiomas) | `src/views/Home.astro`, `src/views/PosKiosko.astro` (las páginas de `src/pages/` solo las montan con su idioma) |
| Idiomas: lista, rutas y selector | `src/i18n/index.ts`, `src/components/Nav.astro` |
| Cabecera, pie, banda final, selector de tipo de negocio, maquetas | `src/components/` |
| Color de marca y tipografía base | `src/styles.css` (`@theme`) |

**Módulos en vivo (`/plugins/`):**
- La página trae una COPIA (`src/data/plugins.ts` + los textos de `plugins.items` en los JSON) con la que se pinta de entrada y a la que vuelve si el catálogo no contesta; enseguida el navegador pide `GET /api/plugins?lang=es|en|fr` y repinta con la lista de verdad.
- `/api/plugins` lo sirve el contenedor `chat` del pod (`chat/plugins.mjs`): lee el catálogo en `PLUGIN_CATALOG_URL` (en el cluster, `http://api-gateway-node:8080/plugins`, el listado público que ya usa el CRM), lo guarda 5 minutos en memoria por idioma y, si el catálogo se cae, sirve la última lista buena hasta 24 h. Solo viajan código, nombre, categoría, descripción, estado y dependencias (ni precios ni ids internos). Se resuelve el nombre en cada petición: si el catálogo no existe, no se cae nginx, solo se usa la copia.
- **Estado:** `isCore` → Incluido; `disponible` → Disponible; todo lo demás (en construcción, o un estado nuevo) → Pronto. Nunca se anuncia lo que no se puede usar.
- **Texto comercial:** el catálogo trae descripciones técnicas. Para los módulos que ya tienen texto en `plugins.items` se usa ese (en los tres idiomas); un módulo NUEVO del catálogo aparece igual, con su nombre y la primera frase de su descripción, y en un grupo con el nombre de categoría del catálogo si su prefijo no está en `areaOfPrefix`. Cuando valga la pena, se le escribe su texto: una fila en `plugins.ts` y su `name`/`text` en los tres JSON (`npm test` falla si falta alguno).
- **Lo que se oculta** (`hiddenCodes` en `plugins.ts`): `infra.gateway` (pieza técnica) y la conciliación bancaria y el flujo de caja (ya vienen dentro de «Cuentas por cobrar y por pagar»; quitarlos de la lista cuando el catálogo los pode).
- **El asistente de IA** todavía aprende los módulos al compilar (`knowledge.ts`), no en vivo: su lista puede ir por detrás de la página hasta el siguiente despliegue.
- En desarrollo: `PLUGIN_CATALOG_URL=https://api.noahsolution.com/plugins LLM_PROVIDER=mock node chat/server.mjs` junto con `npm run dev` (el `dev` ya manda `/api` al chat local).

**Regla de contenido:** solo se anuncia como «Disponible» lo que el catálogo de plugins marca como `hecho` (`backend/plugin-catalog-service/seed/plugins-dependencias.json`). Lo demás va como «Pronto» (`ready: false` en `content.ts`; el nombre de cada módulo, en `home.modules` de los JSON). Al terminar un módulo, se cambia ahí.

**Publicar una versión nueva del .exe:** subir el instalador al Release de `facturero/pos` y cambiar `version`, `file` y `size` en `src/data/pos.ts`. Para activar el .iso poner `published: true` en el mismo archivo; el texto de cada descarga está en `pos.downloads.items` de los JSON.

El modo oscuro sigue al sistema (`dark:` de Tailwind); no hay selector manual.

## Despliegue (k3s, igual que el frontend del CRM)

Un push a `master` dispara `.github/workflows/deploy.yaml`: construye la imagen (`Dockerfile`: compila con Node 22 y sirve con nginx), la sube a `ghcr.io/<org>/<repo>/presentacion:<sha>` y el runner del servidor aplica `k8s/` (Deployment, Service e Ingress de Traefik para `www.noahsolution.com`).

**Hay dos pasos manuales, una sola vez:**

1. **Túnel de Cloudflare** (se configura en el dashboard, no en disco): Zero Trust → Networks → Tunnels → el túnel del CRM → *Public Hostname* → añadir `www` + `noahsolution.com` → servicio `HTTP` `localhost:80` (Traefik). Cloudflare crea el DNS solo.
2. **Imagen en ghcr**: si el pod queda en `ImagePullBackOff`, el paquete `presentacion` nació privado; en GitHub → Packages → presentacion → Settings, ponlo público (los demás servicios no usan `imagePullSecrets`).

Para revisar: `kubectl rollout status deployment presentacion` y `curl -I https://www.noahsolution.com`.

## Asistente de IA (botón «Pregúntale a la IA»)

Un chat flotante que **solo contesta dudas** del producto. No usa base de datos, no guarda conversaciones, no tiene herramientas y no hace nada fuera de la conversación; lo único que hace hacia afuera es pedirle texto al modelo.

- **Dónde está:** `chat/` (servicio Node sin dependencias) y `src/components/ChatWidget.astro` (el botón y el panel). Corre como **segundo contenedor del mismo pod** (misma imagen que nginx); nginx le reenvía `/api/` (`nginx.conf`). No hay ingress ni túnel nuevos.
- **Qué sabe:** `src/data/knowledge.ts`, armado (una vez por idioma) con los **mismos datos que pintan las páginas** (`content.ts`, `pos.ts` y los JSON de `src/i18n/`). Si cambias un texto o marcas un módulo como «Pronto», el asistente lo sabe en el siguiente build; no puede prometer lo que la web no promete. Al responder solo viajan las secciones relevantes a la pregunta (el modelo local tiene poco contexto).
- **Modelo:** por defecto el `gemma4:12b` local del cluster (`http://ollama:11434/v1`, sin costo), el mismo del asistente del CRM. Se cambia con variables del contenedor `chat` en `k8s/deployment.yaml` (`LLM_PROVIDER` = `openai-compat` | `anthropic` | `mock`, `LLM_BASE_URL`, `LLM_MODEL`; la clave de Claude, en el secreto opcional `presentacion-llm`).
- **Protecciones:** 6 preguntas por minuto y 60 por día por visitante, 2 conversaciones a la vez, mensajes de hasta 600 caracteres, máx. 400 tokens de respuesta, sin CORS, el servicio solo escucha en `127.0.0.1` del pod, y el log nunca contiene lo que escribe el visitante. El texto del modelo se pinta con nodos del navegador (nunca HTML) y solo enlaza dominios `noahsolution.com` y `github.com`.
- **Probar en local:** `LLM_PROVIDER=mock node chat/server.mjs` (puerto 3000) y `npm run dev` (el proxy de Vite manda `/api` al chat). Pruebas: `npm test` (también corren al construir la imagen; si fallan, no hay imagen).
- **Dónde está el modelo:** Ollama NO corre en el cluster. El Service `ollama` (definido en `backend/assistant-service/k8s/ollama-external.yaml`) apunta a un equipo de la red, hoy `192.168.100.128:11434`. Si el chat muestra «No pude responder», revisa que ese equipo esté encendido y que Ollama escuche en `0.0.0.0` (`curl http://192.168.100.128:11434/api/tags`). El servicio manda `reasoning_effort: "none"` porque `gemma4` piensa antes de contestar y, sin eso, ese razonamiento consume los tokens y la respuesta sale vacía.
- **Si el modelo no responde** (Ollama apagado o frío): el visitante ve «No pude responder ahora mismo…» y puede escribirnos. Un modelo en frío puede tardar; el servicio manda latidos para que Cloudflare no corte la conexión (límite ~100 s).

## Publicar la ISO de POS Kiosko (Cloudflare R2)

La ISO pesa ~3,8 GiB y GitHub Releases no admite archivos de más de 2 GiB, así que se aloja en Cloudflare R2 (sin cobro de descarga). Se construye **en modo público**: sin servidor SSH, sin cuenta con sudo y sin clave del técnico (`os/iso/build-iso-docker.sh` sin `--ssh-key`).

1. **Una vez:** Cloudflare → R2 → crear un bucket (el nuestro se llama `download`; el nombre no importa, pero hay que usar el mismo en el comando). En *Settings → Custom Domains* del bucket añadir `download.noahsolution.com`: ese dominio es el que ve el público. En *Manage R2 API Tokens* crear un token con permiso de escritura sobre ese bucket y guardar el *Account ID*, el *Access Key ID* y el *Secret*.
2. **Subir** (desde Git Bash; las variables solo viven en esa terminal). No hace falta instalar nada: usa la imagen oficial de `rclone` en Docker.

```bash
export R2_BUCKET=download   # el nombre EXACTO de tu bucket
read -rp "Account ID: " R2_ACCOUNT_ID; read -rp "Access Key ID: " R2_KEY; read -rsp "Secret Access Key: " R2_SECRET; echo; export R2_ACCOUNT_ID R2_KEY R2_SECRET
cd /c/Users/sansh/facturero-iso/publica
for par in facturero-pos-autoinstall.iso:pos-kiosko-instalador-2026-10-07.iso pos-kiosko-instalador-2026-10-07.iso.sha256:pos-kiosko-instalador-2026-10-07.iso.sha256; do
  origen="${par%%:*}"; destino="${par##*:}"
  MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd -W):/data:ro" \
    -e RCLONE_CONFIG_R2_TYPE=s3 -e RCLONE_CONFIG_R2_PROVIDER=Cloudflare \
    -e RCLONE_CONFIG_R2_ACCESS_KEY_ID=$R2_KEY -e RCLONE_CONFIG_R2_SECRET_ACCESS_KEY=$R2_SECRET \
    -e RCLONE_CONFIG_R2_ENDPOINT=https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com \
    rclone/rclone copyto "/data/$origen" "r2:$R2_BUCKET/pos-kiosko/$destino" --s3-no-check-bucket --s3-chunk-size 64M --progress
done
```

3. **Comprobar** que el enlace baja el archivo completo (debe imprimir `4084727808`):
   `curl -sIL https://download.noahsolution.com/pos-kiosko/pos-kiosko-instalador-2026-10-07.iso | grep -i content-length`
4. **Activar en la página:** en `src/data/pos.ts`, `iso.published: true`; commit y push. Si se sube otra ISO, cambiar también `file`, `size` y `sha256`.

## Antes de publicar

- **Confirmar el correo de contacto** (`contactEmail` en `content.ts`): es una suposición a partir del dominio. Se usa en los enlaces «Escríbenos» y «Pedir acceso» (`mailto:`); no hay formulario.
- **Definir las condiciones de la prueba gratis.** La página dice «Pruébalo gratis» y «puedes probarlo gratis», pero no menciona duración ni límites, porque no están definidos en ningún sitio.
- **El instalador de Windows no está firmado.** La guía explica el aviso de Windows y el bloqueo de Smart App Control, pero para promocionarlo conviene firmarlo.
- Las maquetas llevan datos inventados («Cliente de ejemplo», precios de cafetería) y lo dicen en pantalla. No hay capturas reales.
- Falta, si se quiere: imagen para compartir en redes (`og:image`), analítica y redirigir `noahsolution.com` a `www`.
