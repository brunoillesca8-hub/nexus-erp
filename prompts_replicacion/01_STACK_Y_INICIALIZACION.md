# Prompt 01: Inicialización del Proyecto y Stack Tecnológico

```text
Actúa como un Desarrollador Full-Stack Senior especializado en Next.js (App Router), TypeScript y Tailwind CSS.

Quiero inicializar la estructura base de una aplicación web empresarial ERP + CRM + Sistema de Inventario Multi-tenant para pequeñas y medianas empresas en Chile.

REQUERIMIENTOS DE INICIALIZACIÓN:
1. Framework: Next.js (App Router) con TypeScript y Tailwind CSS habilitado.
2. Idioma base: Español (lang="es") con soporte para moneda en Pesos Chilenos (CLP) con formato "$15.990" (sin decimales, separador de miles con punto).
3. Dependencias requeridas a instalar:
   - @supabase/supabase-js y @supabase/ssr (conexión a backend y Auth con soporte SSR)
   - lucide-react (iconos modernos)
   - recharts (gráficos interactivos)
   - html5-qrcode (escáner de código de barras para cámara web de PC y celular)
   - clsx y tailwind-merge (utilidad de clases CSS)
   - xlsx y papaparse (importación y exportación de hojas de cálculo CSV y Excel)
   - canvas-confetti y sus @types (feedback visual celebratorio en ventas)

4. Estructura de carpetas modular requerida:
   - src/app/ (rutas y páginas de la aplicación)
   - src/components/ (layout, pos, analytics, shared, ui)
   - src/context/ (contexto global multi-tenant de la aplicación)
   - src/lib/ (supabase client/server, mock data, utils de moneda y fechas)
   - src/services/ (servicios de cálculo matemático de inventario ROP/SS/Q)
   - src/types/ (interfaces TypeScript del esquema de base de datos)
   - supabase/ (esquema SQL y seeds)

5. Configuración de estilos en globals.css:
   - Paleta de colores empresarial SaaS limpia (slate, blue-600, emerald-600, amber-500, rose-600).
   - Estilos especiales de impresión (@media print) para comprobantes y tickets térmicos (#printable-receipt).

6. Configurar las variables de entorno en .env.local y .env.example:
   NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui

Genera los archivos de configuración, dependencias y estilos base para iniciar el proyecto.
```
