// Los módulos que muestra la página /plugins/: qué NO es texto (código del catálogo, área, estado y de qué depende cada uno).
// El nombre y lo que hace cada módulo, en los tres idiomas, viven en `plugins.items.<id>` de src/i18n/*.json, y el nombre de cada
// área en `plugins.categories.<área>`.
//
// REGLA: solo se anuncia como «ready» (Disponible) lo que el catálogo de plugins marca `hecho`
// (backend/plugin-catalog-service/seed/plugins-dependencias.json). «included» = viene en toda cuenta y no se puede quitar
// (`included: true` del catálogo). Lo demás es «soon» (Pronto). Al terminar un módulo, se cambia aquí `state`.
// La conciliación bancaria y el flujo de caja NO se listan aparte: ya vienen dentro de «Cuentas por cobrar y por pagar».
// Las dependencias salen del catálogo y se limitan a los módulos que se muestran aquí.

export type PluginState = "included" | "ready" | "soon";

export const pluginAreas = [
  "finance",
  "sales",
  "pos",
  "inventory",
  "purchasing",
  "restaurant",
  "bi",
  "hr",
  "production",
  "projects",
  "comm",
  "ecommerce",
  "admin"
] as const;
export type PluginArea = (typeof pluginAreas)[number];

export interface PluginMeta {
  id: string;
  /** Código en el catálogo de plugins del sistema. */
  code: string;
  area: PluginArea;
  state: PluginState;
  /** Ids de los módulos que este necesita (se agregan solos al armar la lista). */
  deps: string[];
}

export const plugins: PluginMeta[] = [
  { id: "electronicCertificate", code: "finance.electronic_certificate", area: "finance", state: "included", deps: [] },
  { id: "electronicInvoicing", code: "finance.electronic_invoicing", area: "finance", state: "ready", deps: ["catalogProducts", "contacts", "establishments", "electronicCertificate"] },
  { id: "accountsReceivablePayable", code: "finance.accounts_receivable_payable", area: "finance", state: "ready", deps: ["electronicInvoicing", "generalLedger"] },
  { id: "generalLedger", code: "finance.general_ledger", area: "finance", state: "ready", deps: [] },
  { id: "financialReports", code: "finance.financial_reports", area: "finance", state: "soon", deps: ["generalLedger"] },
  { id: "budgets", code: "finance.budgets", area: "finance", state: "soon", deps: ["generalLedger"] },
  { id: "fixedAssets", code: "finance.fixed_assets", area: "finance", state: "soon", deps: ["generalLedger"] },
  { id: "contacts", code: "crm.contacts", area: "sales", state: "included", deps: [] },
  { id: "leadsPipeline", code: "crm.leads_pipeline", area: "sales", state: "soon", deps: ["contacts"] },
  { id: "interactionHistory", code: "crm.interaction_history", area: "sales", state: "soon", deps: ["contacts"] },
  { id: "supportTickets", code: "crm.support_tickets", area: "sales", state: "soon", deps: ["contacts"] },
  { id: "marketingAutomation", code: "crm.marketing_automation", area: "sales", state: "soon", deps: ["contacts"] },
  { id: "quotes", code: "crm.quotes", area: "sales", state: "soon", deps: ["leadsPipeline", "catalogProducts"] },
  { id: "surveys", code: "crm.surveys", area: "sales", state: "soon", deps: ["supportTickets"] },
  { id: "customerPortal", code: "crm.customer_portal", area: "sales", state: "soon", deps: ["supportTickets", "quotes"] },
  { id: "posCore", code: "pos.core", area: "pos", state: "ready", deps: ["catalogProducts"] },
  { id: "paymentMethods", code: "pos.payment_methods", area: "pos", state: "included", deps: ["posCore"] },
  { id: "offlineSync", code: "pos.offline_sync", area: "pos", state: "included", deps: ["posCore"] },
  { id: "catalogProducts", code: "infra.catalog_products", area: "inventory", state: "included", deps: [] },
  { id: "warehouses", code: "inventory.warehouses", area: "inventory", state: "ready", deps: ["catalogProducts"] },
  { id: "suppliers", code: "inventory.suppliers", area: "inventory", state: "ready", deps: [] },
  { id: "kardex", code: "inventory.kardex", area: "inventory", state: "ready", deps: ["warehouses"] },
  { id: "warehouseTransfers", code: "inventory.warehouse_transfers", area: "inventory", state: "soon", deps: ["warehouses"] },
  { id: "lotTracking", code: "inventory.lot_tracking", area: "inventory", state: "soon", deps: ["kardex"] },
  { id: "reorderAlerts", code: "inventory.reorder_alerts", area: "inventory", state: "soon", deps: ["kardex"] },
  { id: "purchaseOrders", code: "purchasing.purchase_orders", area: "purchasing", state: "ready", deps: ["suppliers", "warehouses"] },
  { id: "requests", code: "purchasing.requests", area: "purchasing", state: "soon", deps: ["warehouses"] },
  { id: "quoteComparison", code: "purchasing.quote_comparison", area: "purchasing", state: "soon", deps: ["requests", "suppliers"] },
  { id: "supplierEvaluation", code: "purchasing.supplier_evaluation", area: "purchasing", state: "soon", deps: ["suppliers"] },
  { id: "floorplan", code: "restaurant.floorplan", area: "restaurant", state: "ready", deps: ["establishments"] },
  { id: "reservations", code: "restaurant.reservations", area: "restaurant", state: "soon", deps: ["floorplan"] },
  { id: "dashboards", code: "bi.dashboards", area: "bi", state: "soon", deps: ["generalLedger", "kardex", "leadsPipeline"] },
  { id: "kpis", code: "bi.kpis", area: "bi", state: "soon", deps: ["dashboards"] },
  { id: "exports", code: "bi.exports", area: "bi", state: "soon", deps: ["dashboards"] },
  { id: "predictiveAnalytics", code: "bi.predictive_analytics", area: "bi", state: "soon", deps: ["dashboards"] },
  { id: "employees", code: "hr.employees", area: "hr", state: "soon", deps: [] },
  { id: "attendance", code: "hr.attendance", area: "hr", state: "soon", deps: ["employees"] },
  { id: "leaveManagement", code: "hr.leave_management", area: "hr", state: "soon", deps: ["employees"] },
  { id: "performanceReview", code: "hr.performance_review", area: "hr", state: "soon", deps: ["employees"] },
  { id: "recruitment", code: "hr.recruitment", area: "hr", state: "soon", deps: ["employees"] },
  { id: "payroll", code: "hr.payroll", area: "hr", state: "soon", deps: ["employees", "attendance", "generalLedger"] },
  { id: "bom", code: "production.bom", area: "production", state: "soon", deps: ["catalogProducts"] },
  { id: "orders", code: "production.orders", area: "production", state: "soon", deps: ["bom", "kardex"] },
  { id: "qualityControl", code: "production.quality_control", area: "production", state: "soon", deps: ["orders"] },
  { id: "maintenance", code: "production.maintenance", area: "production", state: "soon", deps: ["orders"] },
  { id: "mrp", code: "production.mrp", area: "production", state: "soon", deps: ["bom", "kardex", "purchaseOrders"] },
  { id: "tasksKanban", code: "projects.tasks_kanban", area: "projects", state: "soon", deps: [] },
  { id: "timeTracking", code: "projects.time_tracking", area: "projects", state: "soon", deps: ["tasksKanban"] },
  { id: "resourceAllocation", code: "projects.resource_allocation", area: "projects", state: "soon", deps: ["tasksKanban", "employees"] },
  { id: "projectBilling", code: "projects.project_billing", area: "projects", state: "soon", deps: ["timeTracking", "electronicInvoicing"] },
  { id: "notifications", code: "comm.notifications", area: "comm", state: "included", deps: [] },
  { id: "sharedDocuments", code: "comm.shared_documents", area: "comm", state: "included", deps: [] },
  { id: "internalChat", code: "comm.internal_chat", area: "comm", state: "soon", deps: [] },
  { id: "sharedCalendar", code: "comm.shared_calendar", area: "comm", state: "soon", deps: [] },
  { id: "onlineCatalog", code: "ecommerce.online_catalog", area: "ecommerce", state: "soon", deps: ["catalogProducts"] },
  { id: "cart", code: "ecommerce.cart", area: "ecommerce", state: "soon", deps: ["onlineCatalog"] },
  { id: "paymentGateways", code: "ecommerce.payment_gateways", area: "ecommerce", state: "soon", deps: ["cart", "electronicInvoicing"] },
  { id: "shipping", code: "ecommerce.shipping", area: "ecommerce", state: "soon", deps: ["cart"] },
  { id: "auditLog", code: "admin.audit_log", area: "admin", state: "ready", deps: [] },
  { id: "orgSettings", code: "admin.org_settings", area: "admin", state: "included", deps: [] },
  { id: "establishments", code: "org.establishments", area: "admin", state: "included", deps: [] },
  { id: "apiWebhooks", code: "admin.api_webhooks", area: "admin", state: "soon", deps: [] },
  { id: "usersRoles", code: "admin.users_roles", area: "admin", state: "included", deps: [] },
  { id: "permissions", code: "admin.permissions", area: "admin", state: "included", deps: [] },
  { id: "multitenant", code: "admin.multitenant", area: "admin", state: "included", deps: [] },
  { id: "taxCatalog", code: "infra.tax_catalog", area: "admin", state: "included", deps: [] },
];

/**
 * Qué área de la página le toca a un módulo según el prefijo de su código en el catálogo. Un prefijo que no está aquí (un módulo de un área
 * nueva) aparece igual, en un grupo con el nombre de categoría que traiga el catálogo.
 */
export const areaOfPrefix: Record<string, PluginArea> = {
  finance: "finance", crm: "sales", pos: "pos", inventory: "inventory", infra: "inventory", purchasing: "purchasing", restaurant: "restaurant",
  bi: "bi", hr: "hr", production: "production", projects: "projects", comm: "comm", ecommerce: "ecommerce", admin: "admin", org: "admin",
};

/**
 * Módulos del catálogo que la landing NO muestra (la lista es en vivo y trae todo lo público):
 *  - `infra.gateway`: pieza técnica interna, no una función que el cliente reconozca.
 *  - conciliación bancaria y flujo de caja: ya vienen DENTRO de «Cuentas por cobrar y por pagar», así que listarlos aparte como «Pronto»
 *    contradiría lo que el sistema ya hace. Quitar de aquí cuando el catálogo los pode.
 */
export const hiddenCodes = ["infra.gateway", "finance.bank_reconciliation", "finance.cash_flow"] as const;

/**
 * IVA que se suma al total de «Cuánto costaría», en puntos básicos (1500 = 15 %). Es el mismo valor que el catálogo de plugins
 * (`VAT_BPS` de plugin-catalog-service): si cambia allá, hay que cambiarlo aquí. Los precios de cada módulo NO se copian: se leen en vivo del catálogo.
 */
export const vatBps = 1500;
