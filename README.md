# Presentación — CRM y POS Kiosko

Landing de una sola página para quien busca el CRM. **Astro + Tailwind CSS 4**, sin base de datos ni backend: se compila a HTML y CSS estáticos (≈64 KB) y se sube a cualquier hosting.

```bash
cd presentacion
npm install
npm run dev       # http://localhost:4321
npm run build     # genera dist/ (esto es lo que se publica)
npm run preview   # sirve dist/ para revisarlo antes de subir
```

## Dónde se edita cada cosa

| Qué | Dónde |
|---|---|
| **Todos los textos** (titular, funciones, puntos del POS, pasos, preguntas, correo de contacto, URL del CRM) | `src/data/content.ts` |
| Estructura y orden de las secciones | `src/pages/index.astro` |
| Menú superior | `src/components/Nav.astro` |
| Maquetas del CRM y de la caja (dibujadas con HTML/Tailwind, datos de ejemplo) | `src/components/CrmMock.astro`, `PosMock.astro` |
| Color de marca (el azul del POS) y tipografía base | `src/styles.css` (`@theme`) |

El modo oscuro sigue al sistema (`dark:` de Tailwind); no hay selector manual.

## Despliegue (k3s, igual que el frontend del CRM)

Un push a `master` dispara `.github/workflows/deploy.yaml`: construye la imagen (`Dockerfile`: compila con Node 22 y sirve con nginx), la sube a `ghcr.io/<org>/<repo>/presentacion:<sha>` y el runner del servidor aplica `k8s/` (Deployment, Service e Ingress de Traefik para `www.noahsolution.com`).

**Hay dos pasos manuales, una sola vez:**

1. **Túnel de Cloudflare** (se configura en el dashboard, no en disco): Zero Trust → Networks → Tunnels → el túnel del CRM → *Public Hostname* → añadir `www` + `noahsolution.com` → servicio `HTTP` `localhost:80` (Traefik). Cloudflare crea el DNS solo.
2. **Imagen en ghcr**: si el pod queda en `ImagePullBackOff`, el paquete `presentacion` nació privado; en GitHub → Packages → presentacion → Settings, ponlo público (los demás servicios no usan `imagePullSecrets`).

Para revisar: `kubectl rollout status deployment presentacion` y `curl -I https://www.noahsolution.com`.

## Antes de publicar

- **Confirmar el correo de contacto** (`contactEmail` en `content.ts`): es una suposición a partir del dominio. El formulario no envía nada por sí mismo: abre el programa de correo del visitante con el mensaje armado (`mailto:`). Si se quiere un envío real, hay que añadir un servicio de formularios o un endpoint.
- **Revisar las afirmaciones** con lo que de verdad se puede prometer hoy, sobre todo la facturación electrónica del SRI: el texto dice que el CRM genera facturas, notas de crédito y RIDE y que la activación depende del RUC y del certificado de firma de cada cliente.
- Las maquetas llevan datos inventados («Cliente de ejemplo», precios de cafetería) y lo dicen en pantalla. No hay capturas reales.
- Falta, si se quiere: imagen para compartir en redes (`og:image`), analítica y dominio propio.
