// Todo el texto de la página principal vive aquí: se edita sin tocar los componentes.
// Regla: lo que no existe todavía se marca como «Pronto» (ready: false). No se promete nada que el catálogo no tenga.

export const site = {
  name: "noahsolutions",
  product: "POS Kiosko",
  crmUrl: "https://crm.noahsolution.com",
  // La cuenta se crea desde la pantalla de acceso del CRM ("Crear cuenta").
  trialUrl: "https://crm.noahsolution.com/login",
  // TODO: confirmar este correo (es una suposición a partir del dominio) antes de publicar.
  contactEmail: "contacto@noahsolution.com",
  title: "Sistema para tu negocio: ventas, inventario y facturación electrónica | noahsolutions",
  description:
    "Un solo sistema para vender, facturar y administrar tu negocio en Ecuador. Activa solo los módulos que necesitas: clientes, inventario, facturación electrónica, punto de venta y más. Pruébalo gratis.",
};

export const nav = [
  { href: "/#que-incluye", label: "Qué incluye" },
  { href: "/#tu-negocio", label: "Para tu negocio" },
  { href: "/pos-kiosko/", label: "POS Kiosko" },
  { href: "/#preguntas", label: "Preguntas" },
];

export const hero = {
  title: "Un solo sistema para vender, facturar y administrar tu negocio",
  lead: "Clientes, productos, inventario, facturación electrónica y tu equipo, todo en un mismo lugar. Empiezas con lo esencial y activas más módulos a medida que tu negocio los necesita.",
  badges: ["Funciona desde el navegador", "Facturación electrónica para Ecuador", "Crece contigo, módulo a módulo"],
};

// Tres ideas, en el idioma del cliente.
export const benefits = [
  { title: "Todo en un lugar", text: "Dejas de saltar entre hojas de cálculo, programas de facturación y cuadernos. Tu información queda junta." },
  { title: "Hecho para Ecuador", text: "Emite facturas y notas de crédito electrónicas con tu establecimiento y punto de emisión." },
  { title: "Se adapta a tu negocio", text: "No pagas ni ves lo que no usas. Eliges tu tipo de negocio y te recomendamos los módulos que encajan." },
];

// Lo que ya se puede usar hoy (status "hecho" en el catálogo de plugins), agrupado por lo que le importa al cliente.
// icon: ruta SVG de 24x24 (trazo).
export const areas = [
  {
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    title: "Clientes y contactos",
    text: "Ten a todos tus clientes con sus contactos y direcciones, listos para venderles y facturarles en segundos.",
  },
  {
    icon: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3.3 7.5L12 12.5l8.7-5M12 22V12.5",
    title: "Productos e inventario",
    text: "Catálogo con categorías y unidades, control de existencias (kardex) y varias bodegas si las necesitas.",
  },
  {
    icon: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zM14 3v6h6M8 13h8M8 17h5",
    title: "Facturación electrónica",
    text: "Facturas y notas de crédito electrónicas, con tu certificado de firma, y compatibles con varias monedas.",
  },
  {
    icon: "M3 9h18M5 9V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M9 14h6",
    title: "Punto de venta",
    text: "Cobra en el mostrador con varios métodos de pago, descuentos y promociones, y control de cajas y turnos.",
    href: "/pos-kiosko/",
    cta: "Conocer POS Kiosko",
  },
  {
    icon: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6",
    title: "Sucursales y equipo",
    text: "Varios establecimientos y puntos de emisión. Cada empleado entra con su cuenta y solo ve lo que le corresponde.",
  },
  {
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
    title: "Control y seguridad",
    text: "Roles y permisos a tu medida, y un historial de quién hizo qué y cuándo para revisarlo sin adivinar.",
  },
];

// Cada módulo marca si ya está disponible (ready) o llega pronto. Los códigos coinciden con el catálogo de plugins.
type Mod = { name: string; ready: boolean; essential: boolean };
const m = (name: string, ready: boolean, essential = false): Mod => ({ name, ready, essential });

export const profiles: { id: string; label: string; blurb: string; modules: Mod[] }[] = [
  {
    id: "tienda",
    label: "Tienda / comercio",
    blurb: "Para quien vende al por menor: un mostrador, un catálogo y facturas todo el día.",
    modules: [
      m("Catálogo de productos", true, true), m("Clientes y contactos", true, true), m("Facturación electrónica", true, true),
      m("Punto de venta", true, true), m("Cajas y turnos", true, true), m("Varios métodos de pago", true, true),
      m("Control de inventario (kardex)", true), m("Descuentos y promociones", true),
      m("Alertas de reposición", false), m("Paneles de indicadores", false),
    ],
  },
  {
    id: "farmacia",
    label: "Farmacia",
    blurb: "Control de lotes y fechas de caducidad, además de todo lo de una tienda.",
    modules: [
      m("Catálogo de productos", true, true), m("Clientes y contactos", true, true), m("Facturación electrónica", true, true),
      m("Punto de venta", true, true), m("Cajas y turnos", true, true), m("Varios métodos de pago", true, true),
      m("Control de inventario (kardex)", true, true), m("Lotes y caducidad", false, true),
      m("Alertas de reposición", false), m("Proveedores", false), m("Órdenes de compra", false), m("Paneles de indicadores", false),
    ],
  },
  {
    id: "restaurante",
    label: "Restaurante / cafetería",
    blurb: "Cobro rápido, promociones y, más adelante, recetas y control del personal.",
    modules: [
      m("Catálogo de productos", true, true), m("Facturación electrónica", true, true), m("Punto de venta", true, true),
      m("Cajas y turnos", true, true), m("Varios métodos de pago", true, true),
      m("Descuentos y promociones", true), m("Control de inventario (kardex)", true),
      m("Recetas de producción", false), m("Asistencia del personal", false),
    ],
  },
  {
    id: "servicios",
    label: "Servicios profesionales",
    blurb: "Consultoras, despachos y agencias: clientes, cotizaciones, proyectos y facturación.",
    modules: [
      m("Clientes y contactos", true, true), m("Facturación electrónica", true, true),
      m("Cotizaciones", false, true), m("Tareas y proyectos", false, true),
      m("Control de horas", false), m("Facturación por proyecto", false), m("Oportunidades de venta", false), m("Documentos compartidos", true),
    ],
  },
  {
    id: "distribuidora",
    label: "Distribuidora / mayorista",
    blurb: "Varias bodegas, compras a proveedores y cuentas por cobrar.",
    modules: [
      m("Catálogo de productos", true, true), m("Clientes y contactos", true, true), m("Facturación electrónica", true, true),
      m("Varias bodegas", true, true), m("Control de inventario (kardex)", true, true),
      m("Órdenes de compra", false), m("Proveedores", false), m("Transferencias entre bodegas", false),
      m("Cotizaciones", false), m("Cuentas por cobrar y pagar", false),
    ],
  },
  {
    id: "otro",
    label: "Otro / aún no lo sé",
    blurb: "Empieza con lo básico y activa módulos cuando descubras qué te hace falta.",
    modules: [m("Catálogo de productos", true, true), m("Clientes y contactos", true, true), m("Facturación electrónica", true, true)],
  },
];

// Áreas que todavía no están (status "falta" en el catálogo). Se muestran como camino, no como oferta.
export const roadmap = ["Recursos humanos y nómina", "Producción y recetas", "Proyectos y tareas", "Compras y proveedores", "Reportes y paneles", "Contabilidad", "Tienda en línea"];

export const steps = [
  { title: "Crea tu cuenta gratis", text: "Entras desde el navegador, sin instalar nada. Registras tu empresa en pocos minutos." },
  { title: "Elige tu tipo de negocio", text: "Te recomendamos los módulos que encajan con tu negocio y tú activas los que quieras." },
  { title: "Carga lo tuyo y empieza a vender", text: "Agrega tus productos y clientes, invita a tu equipo y emite tu primera factura." },
];

export const faqs = [
  { q: "¿Qué es exactamente?", a: "Es un sistema de gestión para tu negocio: reúne en un solo lugar tus clientes, productos, inventario, ventas y facturación electrónica. Lo adaptas activando solo los módulos que necesitas." },
  { q: "¿Tengo que instalar algo?", a: "Para empezar no: entras desde el navegador con tu cuenta. Solo si quieres cobrar en un mostrador con una caja dedicada, instalas POS Kiosko, que tiene su propia página." },
  { q: "¿Sirve para mi tipo de negocio?", a: "Hay recomendaciones listas para tienda, farmacia, restaurante, servicios profesionales y distribuidora, y una opción para empezar con lo básico si aún no lo sabes. Lo que no veas hoy aparece como «Pronto»." },
  { q: "¿Cómo funciona la facturación electrónica?", a: "El sistema genera facturas y notas de crédito electrónicas para Ecuador y guarda tu certificado de firma. Para activarla con tu RUC, escríbenos y te acompañamos." },
  { q: "¿Cuánto cuesta?", a: "Puedes crear tu cuenta y probarlo gratis. Si quieres saber cómo seguir después de la prueba, escríbenos." },
  { q: "¿Mis datos se mezclan con los de otras empresas?", a: "No. Cada empresa ve únicamente sus propios clientes, productos, empleados y facturas." },
  { q: "¿Está en mi idioma?", a: "Sí: el sistema está disponible en español, inglés y francés." },
];
