# Prompt 08: Reportes Ejecutivos PDF y Módulo de Suscripciones SaaS

```text
Actúa como un Diseñador de Producto y Desarrollador Full-Stack para SaaS.

Quiero implementar los módulos finales del ERP:
1. Generador de Reportes Ejecutivos Descargables en PDF (/analitica/reportes)
2. Módulo de Suscripciones & Planes SaaS (/suscripcion)
3. Configuración y Personalización del Negocio (/configuracion)
4. Layout con Navbar responsivo, Selector de Rol RBAC, Notificaciones Toast y Sidebar completo.

REQUERIMIENTOS:
1. Reportes Ejecutivos PDF en src/app/analitica/reportes/page.tsx:
   - Pestaña para alternar entre "Reporte Semanal" y "Reporte Mensual".
   - Encabezado con datos del negocio, fecha y folio.
   - Resumen financiero: Facturación total, Utilidad bruta en CLP, Margen promedio % y Ticket medio.
   - Gráfico de desempeño en el período (día por día o semana por semana).
   - Diagnóstico Inteligente de Negocio Automatizado:
     * 🟢 Aspectos Destacados & Fortalezas: Top productos más rentables, crecimiento del ticket medio y categorías de rotación continua.
     * 🔴 Oportunidades de Mejora & Alertas: Conteo de productos bajo ROP (alerta de reposición), horas valle para promociones y control de inventario CZ.
   - Botón "Descargar / Imprimir PDF" con formato limpio A4 optimizado (@media print).

2. Módulo de Suscripciones SaaS en src/app/suscripcion/page.tsx:
   - 3 Planes de Precios configurados para Chile:
     * Plan Emprendedor: $29.900 CLP/mes ($299.000 CLP/año).
     * Plan Profesional & Analítica: $49.900 CLP/mes ($499.000 CLP/año) con insignia de "Recomendado".
     * Plan Cadena & Multi-Sucursal: $79.900 CLP/mes ($799.000 CLP/año).
   - Selector interactivo de Pago Mensual vs Pago Anual (con badge de "2 Meses Gratis").
   - Tarjeta de Estado de la Suscripción actual con días restantes y fecha de renovación.
   - Modal de pasarela de pago simulada compatible con Webpay Plus y tarjetas de crédito/débito.

3. Configuración en src/app/configuracion/page.tsx:
   - Formulario de datos de la empresa (Razón social, RUT, Tasa de IVA 19%, Teléfono, Email, Dirección).
   - Sección para renombrar el Local Comercial Principal (con botón de guardar y actualización inmediata).
   - Importador masivo de catálogo CSV con previsualización de datos y validación antes de insertar.

4. Componentes de Layout en src/components/layout/:
   - Navbar.tsx: Selector de rol RBAC (ADMIN, VENDEDOR, INVENTARIO, ANALISTA), nombre del local activo e indicador de Supabase Online.
   - Sidebar.tsx: Menú estructurado en Operaciones, Inventario, CRM, Inteligencia de Negocio y Sistema.
   - NotificationToast.tsx: Notificaciones flotantes animadas de éxito, error e información.

Genera los módulos de reportes, suscripciones y configuración para completar el ERP al 100%.
```
