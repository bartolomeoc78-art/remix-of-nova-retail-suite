

# Plan: Importar Datos Reales de Ecoland

## Resumen

Importaremos los datos reales de tu tienda ecologica **Ecoland** (antes "Miguel Angel Velasco Sanz") desde los 3 PDFs que has subido. La base de datos esta completamente vacia, asi que empezamos desde cero.

## Datos extraidos de los PDFs

| Documento | Contenido | Volumen |
|-----------|-----------|---------|
| ResumenArticulosGeneral | ~530 productos con codigo, nombre, unidades vendidas e importe | Ene 2024 - Feb 2026 |
| ResumenCaja_10_anos | Resumen diario de caja (efectivo + tarjeta por dia) | Ene 2016 - Feb 2026 |
| ResumenTicketsBarra | Tickets individuales con base, IVA 10%, total y forma pago | Ene 2024 - Feb 2026 |

**Totales**: 82.803 unidades vendidas / 329.335,73 EUR (periodo 2024-2026)

---

## Paso 1: Configuracion empresa + tipos IVA + serie facturacion

Una sola migracion SQL que inserta:

- **company_settings**: nombre "Ecoland", C/ Recondo 5, Valladolid, NIF 12224944F
- **tax_rates**: IVA 10% reducido (alimentacion, por defecto) + IVA 21% general
- **invoice_series**: Serie "TB" (tickets barra) tipo simplificada, comenzando en 175497

## Paso 2: Categorias y marcas

Crear **18 categorias** basadas en los rangos de codigo del TPV:

| Rango | Categoria |
|-------|-----------|
| 1xxx | Frutas y Verduras Frescas |
| 2xxx | Aceites, Vinagres y Sales |
| 3xxx | Infusiones, Tes, Cafes y Especias |
| 4xxx | Cereales, Mueslis y Semillas |
| 5xxx | Zumos, Aguas y Bebidas |
| 6xxx | Frutos Secos y Aperitivos |
| 7xxx | Conservas, Sopas y Pates |
| 8xxx | Pastas, Salsas, Dulces y Chocolates |
| 9xxx | Lacteos, Huevos y Bebidas Vegetales |
| 10xxx | Panaderia, Galletas y Harinas |
| 11xxx | Jardineria |
| 12xxx-15xxx | Higiene y Cuidado Personal |
| 18xxx | Carnes Ecologicas |
| 20xxx | Pasta, Arroz y Legumbres |
| 21xxx | Apicultura (Polen y Miel) |
| 22xxx | Limpieza Ecologica |
| 23xxx | Suplementos y Dietetica |
| 24xxx-26xxx | Varios y Bazar |

Crear **~30 marcas** principales: Herbes del Moli, Naturgreen, Ecosana, Biocop, Drasanvi, Granero Integral, Castagno, Natursoy, Weleda, Solyeco, Pan do Mar, Ecoflor, Biogredos, Barnhouse, Gumendi, Paño Nature, Ecomil, etc.

## Paso 3: Productos (~530 productos)

Se insertaran en **varias migraciones** (debido a limites de tamano) los ~530 productos del ResumenArticulosGeneral.pdf con:

- **sku**: codigo del TPV (1001, 2004, 3196, etc.)
- **name**: descripcion exacta del PDF
- **sale_price**: importe / unidades (precio medio real de venta)
- **cost_price**: estimado al 55-65% del precio venta segun categoria (margen tipico tienda ecologica)
- **stock_on_hand**: stock inicial estimado basado en velocidad de venta
- **category_id**: segun rango de codigo
- **brand_id**: detectado automaticamente del nombre del producto
- **tax_rate_id**: 10% para alimentacion (mayoria), 21% para higiene/limpieza/suplementos
- **active**: true
- **unit**: "kg" para productos a granel (1xxx), "uds" para el resto

Se dividiran en 5-6 migraciones de ~100 productos cada una para evitar timeouts.

## Paso 4: Tickets de venta (ultimos 3 meses)

Desde ResumenTicketsBarra.pdf, importar los tickets mas recientes (~500 tickets de Dic 2025 - Feb 2026) como registros en la tabla `sales`:

- **sale_number**: numero del ticket (TB175497, etc.)
- **subtotal**: base imponible
- **tax_total**: importe IVA (siempre ~10%)
- **total**: total del ticket
- **payment_method**: efectivo (forma pago = 1) o tarjeta (forma pago = 2)
- **created_at**: fecha del ticket
- **status**: completada

No se insertaran sale_lines individuales (el PDF no tiene detalle por linea), solo el ticket con su total.

## Paso 5: Sesiones de caja (ultimo ano)

Desde ResumenCaja_10_anos.pdf, crear sesiones de caja diarias para el ultimo ano (~300 dias):

- Cada dia = 1 registro en `cash_sessions` (abierta + cerrada)
- Movimientos en `cash_movements`: efectivo y tarjeta separados
- opening_amount, expected_amount calculado de los totales diarios

## Paso 6: Proveedores principales

Crear ~10 proveedores basados en las marcas mas recurrentes:

- Biocop/Ecosana (distribuidor principal)
- Drasanvi (suplementos)
- Naturgreen/Natursoy (alimentacion vegetal)
- Herbes del Moli (infusiones)
- Paño Nature (frutos secos a granel)
- La Presa / BEEE (lacteos de cabra, Valladolid)
- Crica (leche fresca)
- Biogredos (panaderia)
- Castagno (pasta italiana)
- Solyeco (limpieza)

---

## Resultado esperado

Tras la importacion completa:

- **Dashboard**: graficos de ventas reales, KPIs con datos de 2+ anos
- **Catalogo**: ~530 productos ecologicos reales organizados en 18 categorias
- **Ventas**: ~500 tickets recientes con metodo de pago y totales
- **Caja**: sesiones de caja diarias con datos reales
- **Proveedores**: 10 proveedores principales identificados
- **Asistentes IA**: datos reales para dar recomendaciones utiles
- **Recomendaciones**: scoring de proveedores y analisis de productos con datos reales

## Detalles tecnicos

- Se necesitaran **~10 migraciones SQL** secuenciales dado el volumen de datos
- Los precios del PDF usan formato espanol (punto como separador de miles, coma como decimal) -- se convertiran a numeros
- Se creara un user_id temporal para las ventas (se actualizara cuando el admin se registre)
- Todas las migraciones son idempotentes (usan INSERT con ON CONFLICT o verificaciones)
- El paso 1 tambien configura el plan contable PGC basico para que la contabilidad funcione
