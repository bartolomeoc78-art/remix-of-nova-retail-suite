# Remix of Nova Retail Suite

ACTÚA COMO: Arquitecto de software (nivel senior), Consultor contable-fiscal en España, Diseñador UX/UI premium, y Product Manager.

OBJETIVO: Construir una aplicación web profesional (desktop-first, mobile-friendly) llamada “NovaSystem”, para la gestión integral + contabilidad completa (PGC) de una tienda minorista, con conexión directa al e-commerce (hecho en Lovable, desplegado en Cloudflare, repo en GitHub) para sincronización automática de inventario, pedidos y clientes.

PRIORIDAD ABSOLUTA:

1) Producto sorprendente a nivel experto: robusto, auditable, escalable, UX premium.

2) Contabilidad completa con Plan General Contable (PGC) y asientos automáticos. e informe de mercadeo y análisis de estadísticas, como el pdf que te envio.

3) Integración fiable con e-commerce Lovable + Cloudflare + GitHub (sin complejidad innecesaria).

4) Reportes fiscales e informes listos para gestoría y control interno.

========================

A) CONTEXTO ESPAÑA (Valladolid) – REGLAS CONTABLES Y FISCALES

========================

- Soportar IVA por línea y documento: 4%, 10%, 21% (ampliable). Guardar base imponible, cuota, total, desglose por tipo.

- Facturación española: series, numeración correlativa por serie, facturas rectificativas (abonos) con referencia a la original.

- Libros y modelos:

  - Libro IVA repercutido (emitidas), Libro IVA soportado (recibidas)

  - Modelo 303 (trimestral) y 390 (anual) como reportes (no presentar, solo generar).

  - Modelo 347 (si aplica) reporte por tercero.

- Reglas de integridad:

  - No permitir borrar documentos contables “confirmados”; solo anular/rectificar y dejar trazabilidad.

  - Auditoría completa (quién, cuándo, qué cambió).

- Inventario con valoración: PMP o FIFO (configurable al inicio y bloqueado para consistencia).

- Sector retail/alimentación: lotes y caducidad opcional por producto.

========================

B) MÓDULOS OBLIGATORIOS (FUNCIONALES, COMPLETOS)

========================

1) DASHBOARD EJECUTIVO

- KPIs: ventas hoy/mes, margen bruto y neto, COGS, stock crítico, rotación, caja del día, saldo bancos, cuentas por cobrar/pagar, IVA estimado del trimestre, top productos, top categorías, merma.

- Alertas inteligentes:

  - Stock bajo mínimo

  - Lotes próximos a caducar

  - Facturas proveedor vencidas

  - Descuadres de caja

  - Margen anómalo (producto vendiendo bajo coste)

  - Variaciones fuertes de demanda

2) PRODUCTOS / CATÁLOGO

- CRUD: SKU/código de barras, nombre, marca, categorías, proveedor principal, unidad, precio venta, IVA venta, coste (último + promedio), stock mínimo, ubicación, activo/inactivo.

- Modo “lotes/caducidad” por producto (toggle).

- Histórico de cambios (precio, coste, IVA).

- Etiquetas: eco, sin gluten, vegano (opcional para informes).

3) INVENTARIO (NÚCLEO)

- Movimientos automáticos por ventas, compras, devoluciones y e-commerce.

- Ajustes manuales (merma, rotura, caducidad, recuento): motivo obligatorio + usuario + nota.

- Recuento cíclico + inventario total:

  - Crear sesión → contar → comparar → aprobar → generar ajustes y asientos contables si procede.

- Valoración:

  - Informe de existencias por fecha (PMP/FIFO) y coste total stock.

  - COGS automático por período.

- Trazabilidad por lote (si activo): entradas, salidas, caducidad.

4) TPV / VENTAS (RÁPIDO)

- Interfaz ultrarrápida con lector código de barras, búsqueda por nombre/SKU.

- Carrito: cantidades, descuentos por línea o ticket, impuestos, total, redondeos.

- Pagos: efectivo, tarjeta, Bizum, transferencia, mixto.

- Ticket PDF + registro.

- Devoluciones: parcial/total → abono/rectificativa + retorno a stock + asiento contable.

- Ventas a cliente final o cliente empresa.

5) CLIENTES (B2C/B2B)

- Datos fiscales (NIF/CIF), dirección, email, teléfono.

- Histórico: compras, devoluciones, facturas.

- Cuentas por cobrar (si crédito): vencimientos, estado, recordatorios.

6) FACTURACIÓN

- Facturas emitidas con series y numeración automática.

- Facturas simplificadas (ticket) vs factura completa.

- Rectificativas (abonos) con trazabilidad.

- PDFs profesionales con diseño corporativo.

- Export: CSV/Excel y PDFs.

7) PROVEEDORES & COMPRAS

- Proveedores: NIF, condiciones, plazo pago, email, IBAN opcional.

- Flujo: pedido → recepción (albarán) → factura → pago.

- Recepción: entrada stock por lote/caducidad si aplica.

- Cuentas por pagar: vencimientos, estado, agenda de pagos.

- Registro de incidencias: faltantes, daños.

8) CAJA & BANCOS

- Sesión caja: apertura (fondo), ventas, retiradas, gastos de caja, cierre.

- Arqueo: esperado vs contado, descuadre, explicación obligatoria si hay diferencia.

- Bancos: movimientos manuales o importados CSV (extracto).

- Conciliación bancaria:

  - Match sugerido con ventas, pagos a proveedores, gastos.

- Comisiones TPV y liquidaciones registradas.

9) GASTOS

- Gastos con categorías contables:

  - alquiler, suministros, marketing, gestoría, seguros, mantenimiento, software, etc.

- IVA soportado, método de pago, adjuntos (factura/recibo).

========================

C) CONTABILIDAD COMPLETA (PGC) + ASIENTOS AUTOMÁTICOS (OBLIGATORIO)

========================

OBJETIVO: Generar contabilidad real con Plan General Contable para pymes en España.

1) PLAN CONTABLE (PGC) – IMPLEMENTACIÓN

- Tabla de cuentas contables (código, nombre, tipo, naturaleza, activa).

- Plantillas de cuentas por defecto (editable):

  - 700 Ventas mercaderías

  - 600 Compras mercaderías

  - 472 HP IVA soportado

  - 477 HP IVA repercutido

  - 570 Caja

  - 572 Bancos

  - 400 Proveedores

  - 430 Clientes

  - 629 Otros servicios / marketing / etc.

  - 621 Arrendamientos

  - 628 Suministros

  - 640 Sueldos (si aplica)

  - 681 Amortización

  - 281 Amortización acumulada

  - 300/310 Existencias (según configuración)

- Permitir:

  - Edición del plan contable

  - Mapear categorías de producto/gasto a cuentas contables

  - Mapeo de métodos de pago a cuentas (Caja/Banco/TPV)

2) ASIENTOS AUTOMÁTICOS (Motor contable)

- Generar “Journal Entries” automáticos con asiento doble y balanceado:

  A) Venta TPV:

   - Debe: 570 Caja / 572 Banco / cuenta TPV (según medio de cobro)

   - Haber: 700 Ventas (base)

   - Haber: 477 IVA repercutido (cuota)

   - (Opcional avanzado) registrar COGS:

     - Debe: 610 Variación de existencias / o 600 COGS (según enfoque)

     - Haber: 300 Existencias (salida coste)

  B) Devolución / rectificativa:

   - Inversión del asiento + ajuste stock + IVA

  C) Compra proveedor:

   - Debe: 600 Compras (base)

   - Debe: 472 IVA soportado

   - Haber: 400 Proveedores (total)

   - (Si se paga al momento):

     - Debe: 400 Proveedores

     - Haber: 572 Bancos / 570 Caja

  D) Gastos:

   - Debe: cuenta gasto (621/628/629…)

   - Debe: 472 IVA soportado (si aplica)

   - Haber: 572/570

  E) Pagos a proveedores:

   - Debe: 400

   - Haber: 572/570

  F) Cobros de clientes (si crédito):

   - Debe: 572/570

   - Haber: 430

- Estados de asientos:

  - Borrador → Confirmado → Bloqueado

  - Cualquier corrección crea “asiento de ajuste”, nunca borrar.

3) LIBRO DIARIO, MAYOR, BALANCE Y P&G

- Libro Diario con filtros por fecha, cuenta, documento origen.

- Libro Mayor por cuenta con saldos.

- Balance de situación básico (Activo/Pasivo/Patrimonio) basado en cuentas.

- Pérdidas y Ganancias:

  - Ventas, COGS, margen, gastos, resultado.

- Export “para gestoría”:

  - CSV/Excel de Diario, Mayor, IVA, facturas, gastos.

4) CIERRE MENSUAL / TRIMESTRAL

- Checklist de cierre:

  - conciliación caja y banco

  - facturas pendientes

  - variación existencias (si aplica)

  - resumen IVA

- Reporte 303 y 390 con totales por tipo.

- Reporte 347 por tercero si supera umbral.

========================

D) INTEGRACIÓN E-COMMERCE (Lovable + Cloudflare + GitHub) – SIMPLE Y FIABLE

========================

REQUISITO: El e-commerce debe sincronizar inventario y pedidos automáticamente con EcoCore.

DISEÑO MÁS SENCILLO (OBLIGATORIO):

1) Crear un “Sync Service” dentro del mismo proyecto:

- Un endpoint seguro tipo webhook:

  - POST /api/sync/order-created

  - POST /api/sync/order-updated

  - POST /api/sync/stock-updated

  - POST /api/sync/product-updated

- Autenticación por:

  - API Key + firma HMAC (simple y profesional)

  - Rate limiting y logs

2) En el e-commerce (Lovable) añadir triggers:

- Cuando se crea un pedido:

  - envía webhook a NovaSystem con: cliente, líneas, precios, IVA, método de pago, envío, descuentos, fecha.

- Cuando se cancela/reembolsa:

  - envía evento correspondiente.

- Cuando cambia el stock (por venta online o ajuste):

  - notificar a NovaSystem.

- Cuando NovaSystem actualiza stock (por ventas físicas o compras):

  - NovaSystem envía webhook de vuelta al e-commerce (bidireccional). (Todo lo que diga EcoCore en realidad quiere decir: Nova System)

3) Mapeo de productos:

- Ambos sistemas comparten el mismo identificador:

  - SKU o ID interno (obligatorio)

- Si falta un producto en NovaSystem:

  - crear automáticamente en borrador y alertar.

- Si hay conflicto de stock:

  - regla: NovaSystem es “source of truth” y e-commerce se ajusta.

4) Sincronización de stock (reglas):

- Stock en NovaSystem siempre actualizado por TPV/Inventario.

- E-commerce solo refleja stock disponible.

- Actualización:

  - inmediata por webhook

  - fallback: job programado cada X minutos que reconcilia.

5) Implementación técnica en Cloudflare:

- Usar Cloudflare Workers/Functions (o equivalente) para enviar webhooks desde e-commerce.

- Mantener secretos en variables de entorno.

- Logs visibles y exportables.

========================

E) SEGURIDAD / ROLES / AUDITORÍA (OBLIGATORIO)

========================

- Roles: Admin, Manager, Cajero, Inventario, Contable, Auditor (solo lectura).

- Permisos granulares:

  - TPV, Ajustes inventario, Cierre caja, Contabilidad, Proveedores, Reportes.

- AuditLog para acciones críticas:

  - ajustes stock, cierres de caja, cambios de IVA/precio/coste, confirmación de asientos, anulaciones, sincronizaciones e-commerce.

- Copias de seguridad y export de datos.

========================

F) UX/UI PREMIUM (PROMPTS DE DISEÑO – OBLIGATORIO)

========================

DISEÑO: moderno, premium, minimalista, estilo SaaS profesional.

- Tipografía limpia, jerarquía clara, spacing perfecto.

- Tablas con filtros, búsqueda, chips de estado, acciones rápidas.

- Dashboard con tarjetas KPI y gráficos simples elegantes.

- Paleta:

  - Fondo claro neutro + modo oscuro opcional

  - Acentos morado/azul estilo Nova

- Microinteracciones:

  - loaders elegantes, toasts discretos, confirmaciones claras.

- Accesibilidad:

  - contraste, tamaños, navegación teclado.

- Componentes:

  - sidebar + topbar, breadcrumbs, modales, drawer para detalles, teclado en TPV.

- Pantallas deben sentirse “Apple + Stripe + Linear”: limpias, premium, rápidas.

PROMPT VISUAL INTERNO (para guiar UI):

“Construye una interfaz premium tipo SaaS (Linear/Stripe), minimalista, con tarjetas KPI, tablas con filtros, y flujos ultrarrápidos. Usa un estilo moderno con acentos morado/azul inspirados en Nova, mucho espacio en blanco, y tipografía elegante. El TPV debe ser extremadamente rápido y usable con teclado y lector de barras.”

========================

G) ENTIDADES / MODELO DE DATOS (OBLIGATORIO)

========================

- Product, Category, Brand

- Supplier, PurchaseOrder, PurchaseReceipt, SupplierInvoice, SupplierPayment

- Customer, Sale, SaleLine, Refund

- InvoiceIssued, InvoiceLine, CreditNote

- InventoryLot, InventoryMovement, StockCountSession, StockCountLine

- CashSession, CashMovement

- BankAccount, BankMovement, ReconciliationMatch

- Expense, Attachment

- TaxRate

- AccountingAccount (PGC), JournalEntry, JournalEntryLine, LedgerView

- User, Role, Permission, AuditLog

- EcommerceSyncEvent (logs de integración)

========================

H) REGLAS Y CALIDAD (OBLIGATORIO)

========================

- No placeholders: todo funcional.

- Validaciones en formularios.

- Paginación para grandes volúmenes (20.000+ movimientos).

- Export CSV/Excel/PDF.

- Manejo de errores y estados vacíos.

- Logs de sincronización e-commerce con reintentos.

- Documentación interna (README dentro de la app):

  - Cómo hacer una venta, devolución, compra, cierre caja, IVA trimestral, conciliación, y export para gestoría.

========================

ENTREGABLE FINAL

========================

Construye la app completa con navegación, base de datos/modelo, lógica, UI premium, reportes fiscales, contabilidad PGC con asientos automáticos, y la integración bidireccional con el e-commerce Lovable (Cloudflare + GitHub y supabase si es necesario) usando webhooks seguros (API key + HMAC), con logs y reconciliación de stock. PROMPT DEFINITIVO PARA GOOGLE AI STUDIO (VERSIÓN “NOVA SYSTEM” — TODO OBLIGATORIO)

Actúa como: Arquitecto de producto + Analista funcional + Diseñador UX + Ingeniero full-stack senior + QA lead.

Objetivo: Diseñar y generar una aplicación web profesional (usable en móvil y PC) llamada “NovaSystem” para la gestión integral de una tienda minorista ecológica (Ecoland) en Valladolid, España. Debe estar lista para producción, ser segura, auditable, rápida y “sin placeholders”: todas las pantallas funcionales.

IMPORTANTE (REGLAS)

1) No asumas una plataforma específica (BD, hosting, email, e-commerce, etc.). Elige una arquitectura estándar y explícala internamente en el diseño técnico, pero NO obligues a una marca concreta.

2) No inventes datos de proveedores (precios, certificaciones, plazos) si no están en el sistema. Distingue siempre entre “hechos” (datos existentes) y “suposiciones” (inferencias).

3) Cumple normativa y buenas prácticas en España: facturación, IVA, rectificativas, numeración correlativa, trazabilidad, auditoría. No es asesoría legal cerrada: incluye avisos y sugiere consultar gestoría si hay dudas.

4) Seguridad obligatoria: roles y permisos granulares; no se puede borrar contabilidad confirmada, solo rectificar/anular con trazabilidad.

5) Rendimiento: hasta 20.000 movimientos con paginación, filtros e índices.

6) La app debe poder instalarse como acceso directo (PWA): icono, manifest, service worker, offline básico (consultas esenciales), actualizaciones.

IDENTIDAD / BRANDING

- Nombre: NovaSystem.

- El usuario podrá personalizar: nombre de empresa, dirección del negocio (obligatoria para recomendaciones), logo propio (cargar y usar en UI y PDFs).

- Por defecto, incluir un logo minimalista creado por ti para NovaSystem (en SVG y PNG) representando “operaciones + inventario + eco” de forma moderna.

- UI premium minimalista, limpia, sin fatiga visual. Modo oscuro opcional.

- En panel de proveedores/inventario: stock / mínimo / pedir deben mostrarse en colores distintos basados en emocionalidad (suave, calmado, no agresivo) con accesibilidad (contraste suficiente).

========================================================

A) MÓDULOS OBLIGATORIOS (PANTALLAS + LÓGICA)

========================================================

A1) Dashboard (Inicio)

KPIs:

- Ventas hoy / semana / mes

- Margen bruto

- Stock crítico (bajo mínimo)

- Caja del día y descuadres

- IVA estimado del trimestre (4/10/21)

- Top productos (ventas y margen)

- Rotación (7/30/90)

- Alertas: caducidades, slow-moving, facturas proveedor vencidas, pedidos retrasados

Acciones rápidas:

- “Nueva venta (TPV)”

- “Crear pedido proveedor”

- “Registrar recepción”

- “Exportar PDF: Informe/Estudio”

- “Abrir Eco-Coach (selector de modo)”

A2) Productos & Catálogo

CRUD completo con:

- SKU y código de barras (EAN)

- Nombre, marca, categoría, proveedor principal

- Precio venta, coste, IVA por producto (4/10/21) + tipo impuesto en ficha y en factura

- Unidad (g/ml/uds), variantes (opcional)

- Stock actual, stock mínimo, stock objetivo, punto de reorden, cantidad sugerida

- Ubicación (pasillo/estante)

- Lotes/caducidad: toggle por producto

- Historial de cambios: precio/coste/IVA (auditoría)

Import/Export:

- Importar productos desde CSV (plantilla descargable)

- Exportar catálogo a CSV/Excel

Imágenes:

- Soporte de imagen por producto.

A3) Inventario

- Movimientos automáticos por compras/ventas/devoluciones.

- Ajustes manuales: motivo obligatorio + usuario + auditoría (merma, rotura, caducidad, recuento).

- Recuento de inventario: sesión → conteo → comparación → aprobación → ajustes generados.

- Valoración de existencias: método seleccionable (PMP o FIFO) consistente.

- Reporte de existencias por fecha + coste total stock.

A4) TPV / Ventas (rápido) + Escáner

Requisito crítico:

- Interfaz TPV preparada para conectar un escáner de códigos de barras tipo cajero (HID/USB). Debe aceptar input por foco en campo “scan” (el escáner emula teclado).

Funciones:

- Buscar por nombre/SKU/código barras.

- Carrito: cantidades, descuentos por línea o ticket, impuestos por línea, total.

- Métodos de pago: efectivo, tarjeta, Bizum, transferencia, mixto.

- Registrar hora exacta de la venta.

- Ticket PDF (factura simplificada) imprimible/descargable.

- Si se añade cliente (opcional): emitir factura completa.

Devoluciones:

- total o parcial, generando rectificativa/abono y reingreso a stock.

- Nunca borrar ventas confirmadas; solo rectificar.

A5) Clientes (B2C/B2B)

- Alta de cliente con datos opcionales (nombre, email, teléfono, NIF/CIF, dirección fiscal).

- No obligatorio para vender.

- Historial: compras, facturas, devoluciones.

- (Opcional si se vende a crédito) cuentas por cobrar.

A6) Facturación (España)

- Series y numeración correlativa por serie.

- Facturas emitidas: PDF descargable, envío por email si se configura.

- Rectificativas: con referencia a original y trazabilidad.

- Facturas simplificadas (tickets) vs factura completa.

- Facturas deben incluir:

  - Desglose IVA 4/10/21 por línea y por total (base imponible, cuota, total)

  - Forma de pago

  - Datos del emisor (empresa, NIF, dirección) configurables

  - Datos del cliente si aplica

- Panel de facturas: filtro por fecha, cliente, método de pago, estado. Botón “Descargar PDF”.

A7) Proveedores & Compras (con 2 tipos de proveedor + alertas)

Pantalla “Proveedores” con:

- Alta proveedor: nombre, email, web, redes, NIF, dirección, condiciones (MOQ, portes, forma de pago, plazo).

- Campo “tipo de proveedor”:

  TIPO 1 (Manual): solo alertas de bajo stock de productos asociados.

  TIPO 2 (Auto-email): además, genera automáticamente texto de pedido (email) para enviar.

- Alertas de bajo stock deben funcionar para TODOS los proveedores.

- Pedidos de compra: borrador → enviado → EN CAMINO (icono camión) → recibido → facturado.

- Estados visibles en UI con iconografía: Pendiente / En Camino / Entregado.

- Recepción:

  - Entrada a stock (y lote/caducidad si aplica)

  - Permitir recepción parcial

  - Ajuste de coste si proveedor cambia cantidades/precio; todo queda auditado.

- Facturas proveedor:

  - Registrar facturas recibidas (IVA soportado por tipo)

  - Vencimiento y estado de pago

  - Cuentas por pagar con agenda y alertas

Compras automáticas por web (si el proveedor tiene tienda online):

- Implementar un “Agente de compra” que:

  - navegue a la web del proveedor,

  - añada productos al carrito con cantidades recomendadas,

  - deje el carrito listo para que el usuario finalice en pasarela de pago (NO realizar el pago automáticamente).

- Debe registrar evidencias: URL, items, capturas o registro de acciones, y log auditable.

A8) Caja & Bancos

- Caja diaria: apertura (fondo), ingresos, retiradas, gastos de caja, cierre.

- Arqueo: esperado vs contado, descuadre, comentario obligatorio si hay diferencia.

- Bancos: registrar movimientos y conciliar (manual/semiautomático).

- Comisiones TPV: registrar y reportar.

- Reporte de caja diario/mensual.

A9) Gastos

- Registro de gastos: categoría (alquiler, suministros, marketing…), IVA soportado, método pago.

- Adjuntos (subir factura/recibo).

A10) Informes (actualiza cada 12 horas) + Exportación PDF “Último Nivel”

Crear en menú: “Informes”.

- Dashboard contable y estadístico actualizado cada 12 horas (job programado).

Debe incluir:

- Ventas por periodo (día/semana/mes/trimestre/año)

- Ventas por categoría, marca, producto (Top 15)

- Métodos de pago (pie chart)

- Margen bruto y margen por categoría/producto

- COGS y resultado (P&L simplificada)

- Rotación de inventario y stock inmovilizado

- Caducidades próximas y merma

- Proveedores: concentración y rendimiento

- IVA: libro de IVA repercutido/soportado por periodo

- Informes para modelos: 303 (trimestral), 390 (anual), 347 (si aplica), libros de IVA (emitidas/recibidas)

- Export “para gestoría”: CSV/Excel (facturas emitidas/recibidas, gastos, resumen mensual)

PDF Profesional (OBLIGATORIO):

- Botón “Exportar PDF” (selección de periodo).

- El PDF debe generar un “Estudio de Mercado / Informe Profesional” basado en datos actuales del sistema (no inventar):

  1) Portada con KPIs principales + logo empresa

  2) Índice

  3) Resumen ejecutivo (hallazgos + recomendaciones)

  4) Análisis de ventas (gráficas de barras y tendencia)

  5) Distribución por categorías (gráfico circular; si 3D no es posible, simular estilo “premium”)

  6) Métodos de pago (pie)

  7) Top productos + margen comparativo

  8) Productos críticos: bajo stock / caducidad / slow-moving

  9) Proveedores: scoring, condiciones, riesgos

  10) Financiero: IVA (4/10/21), caja, margen, rotación

  11) Recomendaciones estratégicas: qué pedir más, qué promocionar, qué sustituir, qué añadir

  12) Plan de acción priorizado (7-14 días / 30-60 / 90)

- Debe verse “último nivel”: tipografía consistente, tablas limpias, gráficas nítidas, colores corporativos, y PDFs de facturas/tickets coherentes.

========================================================

B) RECOMENDACIONES Y HÁBITOS DE CONSUMO (OBLIGATORIO)

========================================================

El sistema debe analizar comportamiento de compra y generar recomendaciones:

B1) Segmentación de clientes (RFM + hábitos)

- Recurrentes, ocasionales, dormidos (60/90d), alto valor (LTV),

- Sensibles a precio (compran con promociones),

- Preferencias (vegano, sin gluten, objetivos: energía/digestión/proteína),

- Canal (web/tienda) y método (envío/recogida).

B2) Recomendaciones para ventas (cross-sell/upsell)

- “Repetir compra” basado en historial

- “Quienes compran X también compran Y”

- Sustituciones inteligentes si falta stock (misma categoría/eco-tags/compatibilidades)

- Packs por objetivo (energía/digestión/proteína) con margen objetivo

- Recordatorios de reposición (productos recurrentes)

B3) Recomendaciones operativas (compras)

- Qué pedir más/menos: usando ventas 7/30/90, tendencia, lead time real, stock disponible, objetivo de cobertura, múltiplos MOQ, caducidad y margen.

- Alertas y sugerencias de precio (mantener margen objetivo).

========================================================

C) INTELIGENCIA DE PROVEEDORES (OBLIGATORIO)

========================================================

C1) Scoring interno de proveedores (0–100)

Dimensiones y ponderación (configurable):

1) Precio y margen (20)

2) Fiabilidad logística y plazos (20)

3) Calidad + certificaciones + trazabilidad (15)

4) Catálogo y disponibilidad (10)

5) Condiciones comerciales (MOQ, pagos, descuentos) (15)

6) Servicio y resolución incidencias (10)

7) Flexibilidad (devoluciones, urgencias) (5)

8) Riesgo de dependencia (5)

Salida:

- Tabla por proveedor con score total + por dimensión

- Fortalezas, debilidades, riesgos, acciones recomendadas

- Señales rojas: roturas de stock, plazos inconsistentes, MOQ alto, subidas de coste, falta de fichas técnicas/certificados, mala gestión incidencias, dependencia >60%.

C2) Recomendación de proveedores alternativos con IA (investigación en internet)

En “Proveedores” debe existir:

- Sección “Proveedores recomendados (IA)”:

  - La IA investiga fuentes públicas (webs, catálogos, redes, distribuidores) y propone proveedores alternativos por categoría.

  - No inventar datos: si no se pueden verificar, marcar como “pendiente de confirmación” y pedir información mínima.

  - Mostrar: nombre, score estimado, razones, riesgos, links (web y redes).

  - Si mejora margen sin perder calidad, destacarlo con resumen del porqué.

- Se debe usar la dirección del negocio (Valladolid) para priorizar cercanía/logística cuando sea relevante.

========================================================

D) ALERTAS Y REGLAS ESPECIALES (OBLIGATORIO)

========================================================

- Bajo stock: stock_on_hand <= stock_min.

- Pedido retrasado: enviado y no recibido en X días.

- Caducidad: 60/30/15 días.

- Margen bajo: margin < umbral.

- Slow-moving:

  - 180 días después de recepción, si NO se vende >=50% del total recibido en esa ventana, generar alerta para rematar/promocionar (bundle, pack, descuento).

- Todo con Centro de Acción: lista priorizada + botón para ejecutar acción (crear pedido, generar promo, crear pack, etc.).

========================================================

E) ASISTENTES (OBLIGATORIO) — 3 MODOS CON ICONO DISTINTO

========================================================

En la app debe haber un selector de asistente (cada uno con icono distinto):

E1) Eco-Coach NovaSystem (Operaciones)

- Responde sobre funcionamiento del sistema y ejecuta acciones dentro de la app (tool-calling).

- Puede: crear pedidos, registrar recepciones, generar promos, crear packs, ajustar mínimos, exportar informes, etc.

- Acciones críticas requieren confirmación (resumen -> confirmar -> ejecutar).

- Todo queda auditado.

E2) ECO-OPS (Compras y proveedores) — System Prompt (usar este texto como base)

Eres ECO-OPS, el asistente de operaciones y compras de Ecoland (tienda ecológica en Valladolid, España).

Tu misión es auditar proveedores actuales, comparar alternativas y proponer mejoras con criterios profesionales y medibles.

Prioridad: reducir riesgo (roturas), mejorar margen y mantener calidad ecológica (certificaciones y trazabilidad).

Reglas: no inventar datos; distinguir hechos vs suposiciones; recomendaciones basadas en datos del sistema + lógica comercial + (si navegación activa) fuentes verificables.

Modelo scoring 0-100 con ponderaciones. Detectar señales rojas. Entregar Quick wins + plan negociación + plan diversificación + pedido piloto + plantillas de email.

Primera interacción: solicitar máximo 5 datos si faltan (categorías, proveedores actuales, plazos, MOQ/envío, prioridad).

Mostrar panel con estadísticas, gráficos, y tabla Proveedor | Categorías | Marcas | Plazo | MOQ | Envío | Pago | Descuento | Incidencias | Observaciones.

E3) Eco-Coach Fiscal (Hacienda España) — Panel fiscal + acciones

- Experto fiscal España para autónomos/tienda minorista:

  - Panel fiscal: IVA repercutido/soportado, próximos vencimientos (alertas por color), ventas por método pago.

  - Calendario fiscal (año vigente) con modelos: 303, 390, 130, 111, 190, 100 (y 347 si aplica).

  - Generadores de informes/exportables para gestoría:

    - Libro IVA emitidas/recibidas

    - Resumen 303/390 (sin presentar a Hacienda, solo calcular y exportar)

  - Calculadoras (IVA/IRPF/retenciones) y FAQ.

- Puede ejecutar acciones dentro de la app:

  - “Generar informe 303 del Q1”

  - “Exportar libros IVA del mes”

  - “Marcar presentado”

- Debe incluir avisos de no asesoría legal cerrada y recomendar gestoría si crítico.

========================================================

F) ESTADOS, COLORES Y UX DETALLADA (OBLIGATORIO)

========================================================

- En compras/pedidos: estados visibles:

  - Pendiente (draft)

  - Enviado

  - En Camino (icono camión)

  - Entregado/Recibido

  - Facturado

- En panel de inventario/proveedores:

  - stock actual / mínimo / pedido sugerido con colores emocionales suaves y consistentes.

- Búsqueda global en toda la app.

- Tablas: filtros, export, paginación, columnas configurables.

- Formularios con validación clara, mensajes y estados vacíos cuidados.

- No “placeholders” ni pantallas incompletas.

========================================================

G) PERMISOS Y AUDITORÍA (OBLIGATORIO)

========================================================

Roles: Admin, Manager, Cajero, Inventario, Contable.

Reglas:

- No borrar documentos contables confirmados. Solo anular/rectificar.

- Ajustes de stock requieren motivo + usuario.

- Cierres de caja: solo corrección con ajuste auditado.

Auditoría:

- Log de acciones críticas (crear/editar/borrar permitido, cierres, ajustes, cambios IVA/precio/coste, acciones de asistentes).

========================================================

H) DATOS DEMO Y PRUEBAS (OBLIGATORIO)

========================================================

- Crear al menos 100 productos ficticios + historial de ventas de 1 mes para probar todas las funcionalidades.

- Luego ejecutar un plan de QA automático/manual:

  - TPV con escaneo

  - ticket y factura PDF

  - devoluciones y rectificativas

  - compras: pedido → enviado → en camino → recibido → stock

  - lotes/caducidad y alertas

  - informes y PDF profesional

  - scoring proveedores y recomendaciones

  - asistente Eco-Coach (acciones con confirmación)

  - panel fiscal y export para gestoría

- Registrar resultados de prueba y corregir fallos.

========================================================

I) ENTREGABLES

========================================================

1) App completa NovaSystem con navegación, modelo de datos, lógica, UI y reportes.

2) PWA instalable (icono, manifest, service worker).

3) PDFs: ticket, factura, proveedor, informe/estudio profesional.

4) Paneles: Proveedores (2 tipos + scoring + recomendados), Informes (12h refresh), Fiscal, Dashboard.

5) Asistentes con 3 modos e iconos distintos, capaces de ejecutar acciones en la app con permisos + auditoría.

6) README interno en la app: “Cómo usar NovaSystem” (venta, compra, recepción, cierre de caja, IVA, informes).

NOTAS FINALES

- Si algo requiere datos mínimos (certificaciones, costes, condiciones proveedor), solicita esos datos en UI y marca pendientes.

- En recomendaciones externas, incluir links verificables y explicar limitaciones si no se puede verificar.

- Prioridad absoluta: robustez, trazabilidad, automatización y experiencia de usuario rápida.

FIN DEL PROMPT.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/52077617-d030-4175-bba7-537150fcdb5d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
