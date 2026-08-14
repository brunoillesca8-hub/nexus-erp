# Prompt 05: Catálogo, Políticas Cuantitativas de Inventario (ROP, Q, SS) y Kardex

```text
Actúa como un Ingeniero Industrial y Desarrollador Full-Stack experto en Gestión de Inventarios.

Quiero implementar el módulo de Catálogo de Productos (/productos), el Servicio de Políticas Cuantitativas de Inventario (ROP, EOQ/Q, SS) y la pantalla de Stock & Kardex (/inventario).

REQUERIMIENTOS:
1. Servicio de Políticas de Inventario en src/services/inventory-policy.service.ts:
   - Calcular matemáticamente para cada SKU:
     * Demanda promedio diaria (d) y su desviación estándar (sigma_d).
     * Stock de Seguridad (SS) = Z * sigma_d * sqrt(Lead_Time) con 95% de nivel de servicio (Z = 1.65).
     * Punto de Reorden (ROP) = (d * Lead_Time) + SS.
     * Lote Económico de Pedido (EOQ / Q*) = sqrt((2 * Demanda_Anual * Costo_Pedir_S) / Costo_Mantenimiento_H).
     * Estado del inventario: 'CRITICO_REORDENAR' (si stock <= SS), 'EN_STOCK_SEGURIDAD' (si stock <= ROP), 'OPTIMO', 'SOBRESTOCK'.
     * Unidades sugeridas a pedir al proveedor (Q*).

2. Catálogo de Productos en src/app/productos/page.tsx:
   - CRUD completo de productos con SKU autoincrementable automático (relleno al abrir el modal con generarSiguienteSKU()).
   - Botón inline [+ Nueva Categoría] para crear categorías al instante sin salir del formulario.
   - Campos de precio claros: "Precio de Compra Costo Unitario (CLP)" y "Precio de Venta Público Unitario (CLP)".
   - Cálculo en vivo del Margen Bruto Unitario % y Ganancia en CLP antes de guardar.
   - Campos de Stock Inicial y Stock Máximo Inicial.
   - Filtros por categoría, búsqueda rápida y filtro "Solo Stock Bajo".
   - Botón de Exportar Catálogo a CSV.

3. Gestión de Inventario & Kardex en src/app/inventario/page.tsx:
   - 3 Pestañas interactivas:
     * Pestaña 1 (Stock Actual): Existencias actuales por SKU con semáforo de estado (Óptimo, Stock Bajo, Sin Existencias).
     * Pestaña 2 (Políticas ROP, Q & SS): Tabla con las fórmulas matemáticas cuantitativas activas, mostrando Demanda diaria, SS, ROP, Q* y badge de alerta "¡PEDIR Q UNIDADES!".
     * Pestaña 3 (Kardex Histórico Inmutable): Trazabilidad de entradas, salidas por venta, ajustes de stock y mermas por daño con fecha, hora y motivo.
   - Modal de "Ajuste / Entrada de Stock" para registrar recepciones de mercadería de proveedores o mermas.

Genera el servicio de inventario, el catálogo de productos y la pantalla de inventario/kardex.
```
