// Textos de la página de POS Kiosko. Para publicar una versión nueva del .exe, cambia `version` y `file` aquí.
// Las descargas salen de los Releases de GitHub (facturero/pos); el instalador de Windows se sube al mismo Release del kiosco.

const RELEASES = "https://github.com/facturero/pos/releases";

export const windows = {
  version: "0.3.12",
  file: "POS-Desktop-Setup-0.3.12.exe",
  size: "205 MB",
};

// ISO del equipo dedicado. Se publica en Cloudflare R2 (GitHub no admite archivos de más de 2 GiB y esta pesa ~3,8 GiB).
// Para ACTIVARLA en la página: sube el archivo al bucket y pon `published: true` (ver README, «Publicar la ISO»).
export const iso = {
  published: false,
  file: "pos-kiosko-instalador-2026-10-07.iso",
  base: "https://descargas.noahsolution.com/pos-kiosko",
  size: "3,8 GB",
  sha256: "80d2bb44b392218f25f0e79aae0fb40e379ade1edabf6560d9e61316cb74922f",
};
const isoUrl = `${iso.base}/${iso.file}`;

export const downloads = [
  {
    id: "windows",
    badge: "Disponible",
    ready: true,
    title: "Windows (.exe)",
    text: "Para usar POS Kiosko en un computador con Windows 10 u 11, como cualquier otra aplicación. Se instala con un clic y se abre al iniciar sesión.",
    meta: `Versión ${windows.version} · ${windows.size}`,
    href: `${RELEASES}/download/v${windows.version}/${windows.file}`,
    cta: "Descargar para Windows",
    more: { href: RELEASES, label: "Ver todas las versiones" },
  },
  {
    id: "iso",
    badge: iso.published ? "Disponible" : "Próximamente",
    ready: iso.published,
    title: "Equipo dedicado (.iso)",
    text: "Para convertir un mini PC en una caja que solo vende: se graba en una memoria USB y arranca directo en la pantalla de ventas. Borra el disco del equipo.",
    meta: `Imagen de instalación · ${iso.size} · equipo de 64 bits`,
    href: isoUrl,
    cta: iso.published ? "Descargar la imagen (.iso)" : "Pedir acceso",
    more: iso.published ? { href: `${isoUrl}.sha256`, label: "Archivo de verificación (SHA-256)" } : undefined,
    sha256: iso.sha256,
  },
  {
    id: "deb",
    badge: "Próximamente",
    ready: false,
    title: "Linux (.deb)",
    text: "Paquete para instalar POS Kiosko en un Linux basado en Debian o Ubuntu que ya tengas.",
    meta: "Paquete .deb",
    cta: "Avísame cuando esté",
  },
];

export const highlights = [
  { title: "Se conecta a tu CRM", text: "Tus productos, clientes y cajeros se cargan desde el CRM. Lo que cambias allí aparece en la caja sin tocar nada." },
  { title: "Sigue vendiendo sin internet", text: "Si se cae la red, los cajeros que ya iniciaron sesión siguen cobrando. Las ventas se envían al CRM cuando vuelve la conexión." },
  { title: "Cada cajero con su acceso", text: "Entra solo quien tiene permiso para usar la caja. Si se lo quitas desde el CRM, la caja le cierra la sesión." },
  { title: "Se actualiza sola", text: "Descarga las mejoras por su cuenta y las aplica cuando cierras la caja o la pantalla está en reposo. Nunca en medio de una venta." },
  { title: "Con tu marca", text: "Puedes darle el color y el logotipo de tu negocio desde el CRM." },
  { title: "Para el mostrador", text: "Pantalla simple y rápida: buscas el producto, lo agregas y cobras con el método de pago que corresponda." },
];

// Guía de uso. Cada paso tiene un título y una lista de acciones concretas.
export const guide = [
  {
    id: "antes",
    title: "Antes de empezar",
    intro: "Necesitas tener lista tu cuenta del CRM. Si aún no la tienes, créala gratis desde la página principal.",
    steps: [
      "En el CRM, crea tu establecimiento y un punto de emisión de tipo POS (el nombre de la caja).",
      "Carga tus productos y, si quieres, tus clientes. Se cargarán solos en la caja.",
      "Invita a tus cajeros desde Empleados y dales un rol que incluya el permiso «Entrar a la caja POS y cobrar». Los roles Administrador, Supervisor y Vendedor ya lo traen.",
    ],
  },
  {
    id: "instalar",
    title: "Instalar la aplicación",
    intro: "Elige la descarga que corresponda a tu equipo (arriba).",
    steps: [
      "Windows: ejecuta el instalador. Se instala en tu usuario, sin pedir permisos de administrador, y se abre al terminar.",
      "Si Windows muestra «Windows protegió su PC», pulsa «Más información» y luego «Ejecutar de todas formas».",
      "Si tu Windows 11 tiene activada la protección Smart App Control, bloquea instaladores que aún no están firmados y no ofrece esa opción. Escríbenos y te ayudamos a instalarlo.",
    ],
  },
  {
    id: "equipo-dedicado",
    title: "Instalar en un equipo dedicado (.iso)",
    intro: "Para un computador que solo se usará como caja. ATENCIÓN: la instalación borra todo el disco del equipo.",
    steps: [
      "Descarga la imagen (.iso) y grábala en una memoria USB de 8 GB o más con un programa como balenaEtcher o Rufus.",
      "Conecta el equipo a internet por cable de red: la instalación descarga la aplicación y no avanza sin conexión.",
      "Arranca el equipo desde la memoria USB (suele ser con F12, F11 o Esc al encender). Aparece «Instalar POS KIOSKO» y empieza sola a los 5 segundos. Si el USB se puso en un equipo por error, retíralo antes de que termine la cuenta.",
      "Espera sin tocar nada: se instala, se reinicia y abre la pantalla de ventas. Retira la memoria USB al reiniciar.",
      "Sigue con «Emparejar la caja con tu CRM». Esta caja se mantiene actualizada sola.",
    ],
  },
  {
    id: "emparejar",
    title: "Emparejar la caja con tu CRM",
    intro: "Se hace una sola vez por caja. Une la aplicación con el punto de emisión que creaste.",
    steps: [
      "En el CRM, entra a Establecimientos y abre tu punto de emisión de tipo POS: verás un código de 6 dígitos que cambia cada cierto tiempo.",
      "En la caja, en la pantalla «Configurar este POS», escribe ese código y confirma.",
      "En unos segundos la caja descarga tu catálogo y tus cajeros, y pasa a la pantalla de inicio de sesión.",
      "Si escribiste un código equivocado, usa «Volver a ingresarlo» para empezar de nuevo.",
    ],
  },
  {
    id: "entrar",
    title: "Iniciar sesión",
    intro: "Cada persona entra con su propio usuario.",
    steps: [
      "Usuario: el código de 7 caracteres de la persona. Lo ves en su ficha, en Empleados del CRM.",
      "Contraseña: la que eligió al aceptar la invitación por correo.",
      "Si alguien no puede entrar, revisa que su rol tenga el permiso de usar la caja y que haya aceptado su invitación.",
    ],
  },
  {
    id: "vender",
    title: "Cobrar una venta",
    intro: "El flujo es el mismo para todos los cajeros.",
    steps: [
      "Al empezar el turno, la caja te pide el monto inicial en efectivo.",
      "Busca el producto por nombre, código o código de barras, o elígelo de la lista, y agrégalo a la venta. Repite para cada producto.",
      "Si la venta es para un cliente, búscalo por nombre, RUC o correo.",
      "Elige el método de pago (por ejemplo, efectivo o tarjeta) y pulsa «Cobrar».",
      "Puedes consultar las ventas anteriores en el Historial de ventas. Al terminar el turno, cierra la caja contando el efectivo.",
    ],
  },
  {
    id: "problemas",
    title: "Si algo no sale como esperabas",
    intro: "Los casos más comunes.",
    steps: [
      "Sin internet: sigue vendiendo con normalidad. Verás el estado en la barra inferior y las ventas se envían solas al volver la conexión.",
      "«Sesión vencida: vuelve a emparejar la caja» en la barra inferior: la caja perdió su conexión con el CRM (por ejemplo, tras muchos días apagada). Genera un código nuevo en Establecimientos y empareja de nuevo.",
      "No aparece un producto nuevo: espera unos segundos; si lo creaste hace poco, la caja lo recibe en su siguiente sincronización.",
      "Cambiar de CRM o de punto de emisión: desvincula la caja desde Establecimientos en el CRM y empareja de nuevo con un código nuevo.",
    ],
  },
];

export const posFaqs = [
  { q: "¿Necesito el CRM para usar POS Kiosko?", a: "Sí. POS Kiosko es la caja de tu CRM: toma de allí tus productos, clientes y cajeros, y le envía las ventas. Crea tu cuenta gratis desde la página principal." },
  { q: "¿Puedo tener varias cajas?", a: "Sí. Creas un punto de emisión por cada caja y la emparejas con su propio código." },
  { q: "¿Qué pasa con las ventas si se va el internet?", a: "Se guardan en la caja y se envían al CRM cuando vuelve la conexión. Mientras tanto, la caja sigue cobrando." },
  { q: "¿Y si se daña el computador de la caja?", a: "Instalas la aplicación en otro equipo y lo emparejas con un código nuevo. Tus productos, clientes y cajeros vuelven a cargarse desde el CRM." },
];
