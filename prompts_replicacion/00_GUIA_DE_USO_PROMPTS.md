# 🧭 Guía de Replicación Paso a Paso del Proyecto Nexus ERP

Esta carpeta contiene la secuencia exacta de **8 Prompts Maestros Modulares** para reconstruir o replicar este sistema ERP + CRM + Inventario Multi-tenant desde cero en cualquier otro computador o asistente de IA, sin omitir ninguna funcionalidad.

---

## 📑 Orden de Ejecución de los Prompts

| # | Archivo | Contenido / Alcance |
|---|---|---|
| **01** | `01_STACK_Y_INICIALIZACION.md` | Configuración de Next.js (App Router), TypeScript, Tailwind CSS, paquetes (Recharts, Supabase, XLSX, Barcode Scanner). |
| **02** | `02_SUPABASE_POSTGRESQL_RLS.md` | Esquema de base de datos PostgreSQL, políticas RLS, Procedimiento RPC `procesar_venta_pos` y triggers. |
| **03** | `03_ARQUITECTURA_Y_CONTEXTO_GLOBAL.md` | Tipos TypeScript, utilidades de moneda en Pesos Chilenos (CLP), generador de SKU correlativo y Contexto Global reactivo. |
| **04** | `04_POS_ESCANER_CAMARA_Y_KARDEX.md` | Terminal Punto de Venta (POS), escáner de código de barras para PC/Celular, bloqueo de stock cero y boletas. |
| **05** | `05_CATALOGO_INVENTARIO_POLITICAS_ROP.md` | Catálogo de productos, creación rápida de categorías, políticas cuantitativas ($ROP$, $SS$, $Q^*$) y Kardex. |
| **06** | `06_CRM_CLIENTES_Y_PROVEEDORES.md` | Módulo CRM con vista 360° del cliente (ticket medio, compras totales) y gestión de proveedores. |
| **07** | `07_ANALITICA_ABC_XYZ_TOP10_Y_PARETO.md` | Gráfica diaria de Top 10 productos (10 colores), gráfica de rentabilidad Pareto 80/20 con descarga Excel y Matriz ABC-XYZ. |
| **08** | `08_REPORTES_PDF_Y_SUSCRIPCIONES_SAAS.md` | Reporte ejecutivo descargable en PDF (Semanal/Mensual) con diagnóstico de fortalezas y módulo de suscripciones SaaS. |

---

## 💡 Instrucciones para el Desarrollador o la IA:
1. Copia y ejecuta los prompts en el orden numérico indicado (del 01 al 08).
2. No avances al siguiente prompt hasta que el anterior haya compilado y verificado sus tipos correctamente.
