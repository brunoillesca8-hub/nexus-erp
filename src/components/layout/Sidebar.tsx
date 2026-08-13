'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Boxes, 
  Users, 
  Truck, 
  BarChart3, 
  Settings, 
  History, 
  Layers, 
  Clock, 
  TrendingUp, 
  X,
  PlusCircle
} from 'lucide-react';
import { useERP } from '@/context/erp-context';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { rolActual } = useERP();

  const navigation = [
    {
      group: 'Operaciones',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'VENDEDOR', 'INVENTARIO', 'ANALISTA'] },
        { name: 'Punto de Venta (POS)', href: '/ventas/nueva', icon: ShoppingCart, highlight: true, roles: ['ADMIN', 'VENDEDOR'] },
        { name: 'Historial de Ventas', href: '/ventas', icon: History, roles: ['ADMIN', 'VENDEDOR', 'ANALISTA'] },
      ],
    },
    {
      group: 'Inventario & Catálogo',
      items: [
        { name: 'Catálogo de Productos', href: '/productos', icon: Package, roles: ['ADMIN', 'VENDEDOR', 'INVENTARIO', 'ANALISTA'] },
        { name: 'Stock & Kardex', href: '/inventario', icon: Boxes, roles: ['ADMIN', 'INVENTARIO', 'ANALISTA'] },
        { name: 'Proveedores', href: '/proveedores', icon: Truck, roles: ['ADMIN', 'INVENTARIO'] },
      ],
    },
    {
      group: 'Relaciones (CRM)',
      items: [
        { name: 'Clientes & Compras', href: '/clientes', icon: Users, roles: ['ADMIN', 'VENDEDOR', 'ANALISTA'] },
      ],
    },
    {
      group: 'Inteligencia de Negocio',
      items: [
        { name: 'Matriz ABC - XYZ', href: '/analitica/matriz-abc-xyz', icon: Layers, roles: ['ADMIN', 'ANALISTA'] },
        { name: 'Rentabilidad & Márgenes', href: '/analitica/rentabilidad', icon: TrendingUp, roles: ['ADMIN', 'ANALISTA'] },
        { name: 'Horarios de Venta', href: '/analitica/horarios', icon: Clock, roles: ['ADMIN', 'ANALISTA'] },
      ],
    },
    {
      group: 'Sistema',
      items: [
        { name: 'Configuración & Empresa', href: '/configuracion', icon: Settings, roles: ['ADMIN'] },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop móvil */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-200 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header del Sidebar */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-white tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white font-extrabold text-lg">
              Ω
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-extrabold text-white">NEXUS ERP</span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">CRM & Analytics</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Botón rápido de Nueva Venta */}
        <div className="p-3">
          <Link
            href="/ventas/nueva"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white text-sm shadow-md shadow-blue-600/30 transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Venta (POS)</span>
          </Link>
        </div>

        {/* Links de Navegación agrupados */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {navigation.map((section, idx) => {
            const filteredItems = section.items.filter(item => item.roles.includes(rolActual));
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {section.group}
                </p>
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span>Versión 1.0.0</span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Sistema online" />
          </div>
        </div>
      </aside>
    </>
  );
}
