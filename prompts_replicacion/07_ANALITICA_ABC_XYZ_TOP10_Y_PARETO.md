# Prompt 07: Inteligencia de Negocio, Top 10 Diario, Rentabilidad Pareto 80/20 y Matriz ABC-XYZ

```text
Actúa como un Especialista en Business Intelligence y Análisis de Datos para Retail.

Quiero implementar los módulos de analítica avanzada del ERP con Recharts y biblioteca XLSX:

REQUERIMIENTOS:
1. Gráfica Diaria de Top 10 Productos en src/app/analitica/top-productos/page.tsx:
   - Gráfico de Líneas Multilínea con Recharts mostrando la demanda diaria (últimos 7 días) de los 10 productos más vendidos.
   - Utilizar 10 colores distintos y llamativos (azul, esmeralda, ámbar, violeta, rojo, cyan, rosa, lima, índigo, teal) con leyenda clara.
   - Sincronización en tiempo real: al registrar una venta en el POS, las unidades vendidas de hoy se incrementan inmediatamente en la gráfica.
   - Grid de tarjetas inferiores resumiendo el estado y stock actual de los 10 productos estrella.

2. Rentabilidad Pareto 80/20 y Descarga Excel en src/app/analitica/rentabilidad/page.tsx:
   - Gráfico de barras de utilidad unitaria en CLP mostrando ÚNICAMENTE el 20% de los productos que generan el 80% de las ventas (los más rentables), evitando saturar el gráfico con cientos de barras.
   - Debajo del gráfico, mostrar una tabla con el 100% de los productos del catálogo con su Costo Unitario, Precio Venta Unitario, Ganancia Unitaria y Margen Bruto %.
   - Botón "Descargar Excel (.xlsx)" usando la librería xlsx para exportar la planilla completa de rentabilidad.

3. Matriz Analítica ABC - XYZ en src/app/analitica/matriz-abc-xyz/page.tsx:
   - Segmentación ABC por Principio de Pareto económico (A: 80%, B: 15%, C: 5% del valor acumulado de ventas).
   - Segmentación XYZ por variabilidad de la demanda según Coeficiente de Variación (CV = desviación / promedio):
     * X: Demanda estable (CV <= 0.3)
     * Y: Demanda moderada (0.3 < CV <= 0.6)
     * Z: Demanda muy fluctuante / errática (CV > 0.6)
   - Cuadrante interactivo 3x3 (AX, AY, AZ, BX, BY, BZ, CX, CY, CZ) con filtro al hacer clic y recomendaciones automáticas de abastecimiento (JIT, Lotes económicos, liquidación de inventario CZ).

4. Horarios y Días Pico en src/app/analitica/horarios/page.tsx:
   - Gráfico de distribución de ventas por franja horaria (09:00 a 22:00 hrs) para identificar horas pico (18:00 - 20:00) y turnos de reposición.

Genera las pantallas de analítica e inteligencia de negocio.
```
