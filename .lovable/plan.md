

# 🚀 NovaSystem — Plan de Implementación (Arquitectura Independiente)

## Arquitectura de Despliegue
- **Frontend**: React (Vite) → repositorio GitHub → deploy en **Cloudflare Pages**
- **Backend/BD**: **Supabase** (PostgreSQL, Auth, Edge Functions, Storage, RLS) — tu cuenta propia
- **Sincronización E-commerce**: Cloudflare Workers + webhooks hacia Supabase Edge Functions
- **Lovable**: solo entorno de desarrollo. El código vive en GitHub y no depende de Lovable en producción.

### ⚠️ Requisito Previo: Conexión Supabase
Antes de la Fase 1, conectaremos tu cuenta de Supabase para crear tablas, RLS, edge functions y storage directamente en tu instancia.

---

## Diseño Visual: Limpio tipo Google
- Interfaz **liviana a la vista**: fondos blancos/grises muy claros, tipografía Inter/system, sin saturación
- Paleta inspirada en **Google Material + acentos Nova** (azul/morado suave solo para acciones y estados)
- Espaciado generoso, tarjetas con sombras sutiles, bordes casi invisibles
- Iconografía Lucide (línea fina), sin ruido visual
- Modo oscuro opcional con grises neutros
- TPV: interfaz minimalista ultrarrápida, contraste alto solo donde importa

---

## FASE 1 — Cimientos: Layout, Base de Datos y Catálogo

### 1.1 Layout Premium y Navegación
- Sidebar colapsable + topbar con breadcrumbs y búsqueda global
- Logo NovaSystem SVG minimalista
- Configuración empresa: nombre, dirección (Valladolid), NIF, logo personalizable (Supabase Storage)

### 1.2 Base de Datos Completa en Supabase
- Todas las entidades: Products, Categories, Brands, Suppliers, Customers, Sales, SaleLines, Refunds, Invoices, CreditNotes, InventoryMovements, InventoryLots, StockCountSessions, CashSessions, CashMovements, BankAccounts, BankMovements, Expenses, Attachments, TaxRates, AccountingAccounts (PGC), JournalEntries, JournalEntryLines, EcommerceSyncEvents, AuditLog
- Roles en tabla separada (user_roles) con enum: admin, manager, cajero, inventario, contable, auditor
- RLS con función `has_role()` security definer en todas las tablas
- Supabase Auth (email + contraseña)
- Supabase Storage: imágenes productos, adjuntos gastos, logos

### 1.3 Productos y Catálogo
- CRUD: SKU, EAN, nombre, marca, categoría, proveedor, precios, IVA (4/10/21), coste, stock mínimo, ubicación
- Toggle lotes/caducidad por producto
- Historial de cambios auditado
- Etiquetas (eco, sin gluten, vegano)
- Imagen por producto
- Import/Export CSV

### 1.4 Datos Demo
- 100+ productos con categorías, marcas, proveedores
- Historial de ventas simulado de 1 mes

---

## FASE 2 — Operaciones Core: TPV, Inventario, Clientes

### 2.1 TPV / Punto de Venta
- Interfaz ultrarrápida para escáner código barras (HID/USB, foco en campo scan)
- Búsqueda por nombre/SKU/EAN
- Carrito: cantidades, descuentos línea/ticket, IVA por línea, totales
- Pagos: efectivo, tarjeta, Bizum, transferencia, mixto
- Ticket PDF (factura simplificada)
- Devoluciones parcial/total → rectificativa + retorno stock + asiento contable

### 2.2 Inventario
- Movimientos automáticos por ventas/compras/devoluciones/e-commerce
- Ajustes manuales: motivo obligatorio + usuario + auditoría
- Recuento cíclico: sesión → conteo → comparación → aprobación → ajustes
- Valoración PMP/FIFO configurable
- Trazabilidad por lote, informe existencias por fecha

### 2.3 Clientes (B2C/B2B)
- Datos fiscales (NIF/CIF), no obligatorio para vender
- Histórico compras/facturas/devoluciones
- Cuentas por cobrar si crédito

---

## FASE 3 — Facturación y Proveedores

### 3.1 Facturación Española
- Series y numeración correlativa automática
- Simplificadas vs completas, rectificativas con referencia a original
- Desglose IVA 4/10/21, datos emisor configurables
- PDF profesional corporativo
- Export CSV/Excel/PDF

### 3.2 Proveedores y Compras
- Dos tipos: Manual (alertas) y Auto-email (genera texto pedido)
- Flujo: Pedido → Enviado → En Camino (🚛) → Recibido → Facturado
- Recepción parcial + lotes/caducidad
- Facturas proveedor con IVA soportado, vencimiento, estado pago
- Cuentas por pagar con agenda y alertas
- Registro incidencias

---

## FASE 4 — Caja, Bancos y Gastos

### 4.1 Caja Diaria
- Apertura, ingresos, retiradas, gastos, cierre
- Arqueo: esperado vs contado, descuadre con explicación obligatoria
- Comisiones TPV, reporte diario/mensual

### 4.2 Bancos
- Movimientos manuales o importados CSV
- Conciliación bancaria con match sugerido

### 4.3 Gastos
- Categorías contables, IVA soportado, método pago
- Adjuntos en Supabase Storage

---

## FASE 5 — Contabilidad PGC Completa

### 5.1 Plan Contable PGC Pymes
- Tabla cuentas contables en Supabase con cuentas predefinidas (700, 600, 472, 477, 570, 572, 400, 430, 621, 628, 629, etc.)
- Mapeo categorías → cuentas, métodos pago → cuentas

### 5.2 Motor de Asientos Automáticos (Edge Function)
- Asientos dobles balanceados para: ventas, devoluciones, compras, gastos, pagos, cobros
- COGS automático
- Estados: Borrador → Confirmado → Bloqueado (nunca borrar, solo ajuste)

### 5.3 Libros y Reportes
- Libro Diario, Mayor, Balance de Situación, P&G
- Export CSV/Excel para gestoría

### 5.4 Cierre y Fiscalidad
- Checklist cierre mensual/trimestral
- Libros IVA repercutido/soportado
- Reportes Modelo 303, 390, 347

---

## FASE 6 — Dashboard Ejecutivo e Informes

### 6.1 Dashboard KPIs
- Ventas hoy/semana/mes, margen bruto/neto, COGS, stock crítico, rotación, caja, saldo bancos, cuentas cobrar/pagar, IVA trimestral, top productos/categorías, merma
- Alertas inteligentes: stock bajo, caducidades, facturas vencidas, descuadres, margen anómalo, variaciones demanda
- Acciones rápidas: Nueva venta, Crear pedido, Registrar recepción, Exportar PDF, Abrir asistente

### 6.2 Módulo Informes (refresh cada 12h)
- Ventas por periodo/categoría/marca/producto, métodos pago, márgenes, rotación, proveedores

### 6.3 PDF Profesional "Estudio de Mercado"
- Formato inspirado en los PDFs proporcionados: portada, índice, resumen ejecutivo, análisis ventas (gráficas), distribución categorías, top productos, financiero, recomendaciones estratégicas, plan acción (7-14 / 30-60 / 90 días)

---

## FASE 7 — Integración E-Commerce Bidireccional

### 7.1 Sync Service (Edge Functions Supabase)
- Webhooks seguros: API Key + HMAC + rate limiting
- Endpoints: order-created, order-updated, stock-updated, product-updated
- Logs con reintentos

### 7.2 Sincronización
- NovaSystem = source of truth para stock
- Mapeo por SKU compartido
- Bidireccional: e-commerce → Supabase y Supabase → e-commerce
- Job reconciliación como fallback

---

## FASE 8 — Inteligencia, Asistentes y Recomendaciones

### 8.1 Scoring Proveedores (0-100)
- 8 dimensiones ponderadas, señales rojas, fortalezas/debilidades
- Proveedores recomendados por IA (investigación web, prioridad cercanía Valladolid)

### 8.2 Recomendaciones Negocio
- Segmentación clientes RFM, cross-sell/upsell, sustituciones inteligentes
- Alertas slow-moving (180 días), Centro de Acción con botones ejecutables
- Recomendaciones operativas de compra

### 8.3 Tres Asistentes IA (iconos distintos)
- **Eco-Coach NovaSystem**: operaciones, tool-calling (crear pedidos, recepciones, promos, packs)
- **ECO-OPS**: auditoría proveedores, scoring, planes negociación, plantillas email
- **Eco-Coach Fiscal**: panel fiscal, calendario modelos 303/390/130/111, calculadoras IVA/IRPF, exportar libros IVA

---

## FASE 9 — Seguridad, Auditoría, PWA y Deploy

### 9.1 Roles y Permisos (RLS Supabase)
- user_roles con `has_role()` security definer
- Admin, Manager, Cajero, Inventario, Contable, Auditor (solo lectura)
- Permisos granulares por módulo

### 9.2 Auditoría Completa
- AuditLog con triggers automáticos en Supabase
- No borrado de documentos confirmados, solo rectificar/anular

### 9.3 PWA
- Manifest, service worker, offline básico, icono instalable

### 9.4 Despliegue Independiente
- Frontend en Cloudflare Pages desde GitHub
- Backend 100% en tu Supabase
- Variables de entorno en Cloudflare
- Sin dependencia de Lovable en producción

### 9.5 README Interno
- Documentación en la app: venta, devolución, compra, cierre caja, IVA, informes, export gestoría

