'use client';

import React, { useState } from 'react';
import { ERPProvider } from '@/context/erp-context';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { NotificationToast } from '@/components/layout/NotificationToast';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ERPProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex">
        {/* Sidebar */}
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Contenido Principal */}
        <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
          <Navbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Notificaciones globales */}
        <NotificationToast />
      </div>
    </ERPProvider>
  );
}
