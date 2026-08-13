import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Nexus ERP | Sistema de Gestión Empresarial & CRM',
  description: 'ERP + CRM + Inventario Multi-tenant con analítica avanzada ABC/XYZ y punto de venta inteligente.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full antialiased bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
