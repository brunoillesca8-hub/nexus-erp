# Prompt 03: Tipos TypeScript, Utilidades CLP y Contexto Global

```text
Actúa como un Desarrollador Frontend Senior de React y TypeScript.

Quiero implementar la capa de tipos, formateadores en Pesos Chilenos (CLP) y el Contexto Global Reactivo (ERPProvider) para el sistema ERP Multi-Tenant.

REQUERIMIENTOS ESPECÍFICOS:
1. Definición de Tipos en src/types/database.types.ts:
   - Exportar interfaces completas para Empresa, Sucursal, UsuarioPerfil, MiembroEmpresa, Categoria, Proveedor, Cliente, Producto, StockSucursal, Venta, DetalleVenta, MovimientoInventario, VentaItem.
   - Enums: RolUsuario, EstadoVenta, MetodoPagoTipo, TipoMovimiento.

2. Utilidades en src/lib/utils.ts:
   - cn(...inputs: ClassValue[]) con clsx y tailwind-merge.
   - formatCLP(amount: number): Retorna string formateado con estilo de moneda chilena sin decimales (ej: 15990 -> "$15.990").
   - formatNumber(val: number): Separador de miles con punto (ej: 1250 -> "1.250").
   - formatPercent(val: number): Formato de porcentaje con coma (ej: 25.5 -> "25,5%").
   - formatDate(dateStr: string): Formato de fecha y hora local chilena.
   - calculateMargin(precioVenta: number, precioCompra: number): Calcula margen porcentual ((Venta - Compra) / Venta) * 100.

3. Contexto Global en src/context/erp-context.tsx:
   - Crear el hook useERP() y el componente proveedor ERPProvider.
   - Estado de Tenant: empresa, sucursalActiva (un solo local principal por defecto, con función actualizarNombreSucursal(nombre) para que el dueño lo personalice).
   - Estado de Catálogo: productos, categorias, proveedores, clientes, ventas, movimientos.
   - Función generarSiguienteSKU(): Analiza los SKUs existentes con patrón /SKU-(\d+)/ y calcula automáticamente el siguiente correlativo (ej: SKU-0001, SKU-0002...).
   - Función agregarCategoria(categoria): Agrega categorías dinámicas en memoria/DB.
   - Función procesarVenta(data):
     * Valida stock > 0 estrictamente antes de procesar. Si stock < cantidad, bloquea la venta con mensaje explicativo.
     * Asigna folio autoincrementable comenzando desde el folio 100.
     * Descuenta stock de productos, registra venta y genera movimiento de Kardex tipo SALIDA_VENTA.
   - Función ajustarStock(productoId, cantidad, motivo, tipo): Para recepciones de mercadería, mermas o ajustes físicos.
   - Persistencia híbrida: sincroniza con Supabase Cloud si hay conexión y con LocalStorage como fallback offline.

Genera los archivos src/types/database.types.ts, src/lib/utils.ts y src/context/erp-context.tsx.
```
