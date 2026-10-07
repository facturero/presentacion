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

- `/` — la plataforma: qué es, qué incluye hoy, módulos por tipo de negocio, cómo empezar y preguntas. Botón principal: **Pruébalo gratis** (lleva a la pantalla de acceso del CRM, donde se pulsa «Crear cuenta»).
- `/pos-kiosko/` — producto aparte: qué es, **descargas** (.exe, .iso, .deb), guía de uso paso a paso y preguntas.

## Dónde se edita cada cosa

| Qué | Dónde |
|---|---|
| Textos de la página principal (titular, áreas, módulos por tipo de negocio, pasos, preguntas, correo, URL del CRM y de la prueba) | `src/data/content.ts` |
| Textos de POS Kiosko: **descargas**, puntos fuertes, guía de uso, preguntas | `src/data/pos.ts` |
| Estructura de cada página | `src/pages/index.astro`, `src/pages/pos-kiosko.astro` |
| Cabecera, pie, banda final, selector de tipo de negocio, maquetas | `src/components/` |
| Color de marca y tipografía base | `src/styles.css` (`@theme`) |

**Regla de contenido:** solo se anuncia como «Disponible» lo que el catálogo de plugins marca como `hecho` (`backend/plugin-catalog-service/seed/plugins-dependencias.json`). Lo demás va como «Pronto» (`ready: false` en `content.ts`). Al terminar un módulo, se cambia ahí.

**Publicar una versión nueva del .exe:** subir el instalador al Release de `facturero/pos` y cambiar `version`, `file` y `size` en `src/data/pos.ts`. Para activar el .iso o el .deb, poner `ready: true` y su `href` en el mismo archivo.

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
- **Qué sabe:** `src/data/knowledge.ts`, armado con los **mismos datos que pintan las páginas** (`content.ts` y `pos.ts`). Si cambias un texto o marcas un módulo como «Pronto», el asistente lo sabe en el siguiente build; no puede prometer lo que la web no promete. Al responder solo viajan las secciones relevantes a la pregunta (el modelo local tiene poco contexto).
- **Modelo:** por defecto el `gemma4:12b` local del cluster (`http://ollama:11434/v1`, sin costo), el mismo del asistente del CRM. Se cambia con variables del contenedor `chat` en `k8s/deployment.yaml` (`LLM_PROVIDER` = `openai-compat` | `anthropic` | `mock`, `LLM_BASE_URL`, `LLM_MODEL`; la clave de Claude, en el secreto opcional `presentacion-llm`).
- **Protecciones:** 6 preguntas por minuto y 60 por día por visitante, 2 conversaciones a la vez, mensajes de hasta 600 caracteres, máx. 400 tokens de respuesta, sin CORS, el servicio solo escucha en `127.0.0.1` del pod, y el log nunca contiene lo que escribe el visitante. El texto del modelo se pinta con nodos del navegador (nunca HTML) y solo enlaza dominios `noahsolution.com` y `github.com`.
- **Probar en local:** `LLM_PROVIDER=mock node chat/server.mjs` (puerto 3000) y `npm run dev` (el proxy de Vite manda `/api` al chat). Pruebas: `npm test` (también corren al construir la imagen; si fallan, no hay imagen).
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
