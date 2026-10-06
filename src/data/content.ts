// Todo el texto de la landing vive aquí: se edita sin tocar los componentes.

export const site = {
  name: "noahsolutions",
  product: "POS KIOSKO",
  crmUrl: "https://crm.noahsolution.com",
  // TODO: confirmar este correo (es una suposición a partir del dominio) antes de publicar.
  contactEmail: "contacto@noahsolution.com",
  title: "CRM y POS Kiosko con facturación electrónica para Ecuador | noahsolutions",
  description:
    "Un CRM con facturación electrónica del SRI y una caja POS kiosko que sigue vendiendo sin internet y se sincroniza sola. Clientes, productos, inventario, empleados y permisos en un solo lugar.",
};

export const nav = [
  { href: "#crm", label: "CRM" },
  { href: "#pos", label: "POS Kiosko" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#preguntas", label: "Preguntas" },
];

export const hero = {
  title: "Vende, factura y controla tu negocio desde un solo lugar",
  lead: "Un CRM con facturación electrónica para Ecuador y una caja POS kiosko que sigue vendiendo aunque se caiga el internet.",
  badges: ["Facturas y notas de crédito del SRI", "Cada cajero con su acceso", "Se actualiza sola"],
};

export const strip = [
  { title: "Sin internet, sigue vendiendo", text: "La caja guarda las ventas y las sube cuando vuelve la red." },
  { title: "Todo sincronizado", text: "Clientes, productos y usuarios llegan a la caja en segundos." },
  { title: "Se actualiza sola", text: "Sin interrumpir ventas ni llamar a un técnico." },
  { title: "Permisos por rol", text: "Cada persona ve y hace solo lo que le corresponde." },
];

// Rutas SVG de 24x24 (trazo). Cada ícono es una sola ruta.
export const crmFeatures = [
  { icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", title: "Clientes y contactos", text: "Fichas con contactos y direcciones, listas para facturar y para usarse en la caja." },
  { icon: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3.3 7.5L12 12.5l8.7-5M12 22V12.5", title: "Productos e inventario", text: "Catálogo con categorías, unidades de medida e imágenes. Lo que cambias aquí se ve en la caja." },
  { icon: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zM14 3v6h6M8 13h8M8 17h5", title: "Facturación electrónica", text: "Facturas, notas de crédito y RIDE para Ecuador, con los datos de tu establecimiento y punto de emisión." },
  { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4", title: "Roles y permisos", text: "Administrador, Vendedor, Contador o los roles que tú crees. Quitas un permiso y el acceso se cierra al instante." },
  { icon: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6", title: "Establecimientos", text: "Varias sucursales y puntos de emisión; cada empleado queda asignado a donde trabaja." },
  { icon: "M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", title: "Bitácora de auditoría", text: "Quién creó, cambió o desactivó qué, y cuándo. Para revisar sin adivinar." },
  { icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0", title: "Avisos en tiempo real", text: "La campana te avisa de lo que pasa en tu negocio, sin recargar la página." },
  { icon: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 17l.7 1.8L21.5 19.5l-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7L19 17z", title: "Asistente de IA", text: "Pregunta en lenguaje normal y consulta tu información sin buscar en menús." },
];

export const posPoints = [
  { title: "Un equipo dedicado", text: "Se instala desde una memoria USB y arranca directo en la pantalla de ventas, sin escritorio ni distracciones." },
  { title: "Sigue vendiendo sin internet", text: "Si se cae la red, los cajeros que ya iniciaron sesión siguen cobrando. Las ventas se envían cuando vuelve." },
  { title: "Se mantiene sincronizada con el CRM", text: "Productos, clientes y usuarios llegan en segundos, y también si la caja estuvo apagada varios días." },
  { title: "Se actualiza sin molestar", text: "Descarga las mejoras sola y las aplica al cerrar la caja o cuando la pantalla está ociosa." },
  { title: "Acceso solo para quien debe cobrar", text: "Cada persona entra con su código. Si le quitas el permiso desde el CRM, la caja le cierra la sesión." },
  { title: "Con tu marca", text: "Colores y logotipo propios. También existe una versión de escritorio para Windows." },
];

export const steps = [
  { title: "Configura tu negocio en el CRM", text: "Carga tus productos y clientes, invita a tu equipo y asigna sus roles y establecimientos." },
  { title: "Empareja la caja con un código", text: "En la caja escribes un código de 6 dígitos generado en el CRM. En segundos descarga tu catálogo y tus usuarios." },
  { title: "Vende y deja que todo se sincronice", text: "Cobras en la caja y el CRM se entera. Lo que cambies en el CRM aparece en la caja sin tocar nada." },
];

export const faqs = [
  { q: "¿Necesito internet para vender?", a: "No para cobrar. La caja guarda las ventas en el equipo y las envía al CRM cuando vuelve la conexión. Para sincronizar cambios nuevos del CRM sí necesita red." },
  { q: "¿La facturación electrónica es del SRI?", a: "El CRM genera facturas electrónicas, notas de crédito y su RIDE para Ecuador. Escríbenos y te explicamos cómo se activa con tu RUC y tu certificado de firma." },
  { q: "¿Qué equipo necesito para la caja?", a: "Un computador pequeño con pantalla (por ejemplo un mini PC). La caja se instala desde una memoria USB y se vuelve un equipo dedicado a vender." },
  { q: "¿Y si prefiero usar Windows?", a: "Hay una versión de escritorio para Windows con las mismas pantallas y la misma sincronización con el CRM." },
  { q: "¿Mis datos se mezclan con los de otras empresas?", a: "No. Cada organización ve únicamente sus clientes, productos, empleados y facturas." },
  { q: "¿Puedo usarlo en inglés o francés?", a: "El CRM está disponible en español, inglés y francés." },
];
