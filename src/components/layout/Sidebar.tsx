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
  FileText,
  CreditCard,
  Building2,
  FolderTree
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
        { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['SUPERADMIN', 'ADMIN', 'VENDEDOR', 'INVENTARIO', 'ANALISTA'] },
        { name: 'POS', href: '/ventas/nueva', icon: ShoppingCart, roles: ['SUPERADMIN', 'ADMIN', 'VENDEDOR'] },
        { name: 'Ventas', href: '/ventas', icon: History, roles: ['SUPERADMIN', 'ADMIN', 'VENDEDOR', 'ANALISTA'] },
      ],
    },
    {
      group: 'Inventario',
      items: [
        { name: 'Catálogo', href: '/productos', icon: Package, roles: ['SUPERADMIN', 'ADMIN', 'INVENTARIO', 'ANALISTA'] },
        { name: 'Kardex', href: '/inventario', icon: Boxes, roles: ['SUPERADMIN', 'ADMIN', 'INVENTARIO'] },
        { name: 'Proveedores', href: '/proveedores', icon: Truck, roles: ['SUPERADMIN', 'ADMIN', 'INVENTARIO'] },
        { name: 'Clientes CRM', href: '/clientes', icon: Users, roles: ['SUPERADMIN', 'ADMIN', 'VENDEDOR'] },
      ],
    },
    {
      group: 'Informes',
      items: [
        { name: 'Ejecutivos', href: '/analitica/reportes', icon: FileText, roles: ['SUPERADMIN', 'ADMIN', 'ANALISTA'] },
        { name: 'Top', href: '/analitica/top-productos', icon: TrendingUp, roles: ['SUPERADMIN', 'ADMIN', 'ANALISTA', 'VENDEDOR'] },
        { name: 'ABC-XYZ', href: '/analitica/matriz-abc-xyz', icon: Layers, roles: ['SUPERADMIN', 'ADMIN', 'ANALISTA'] },
        { name: 'Rentabilidad', href: '/analitica/rentabilidad', icon: BarChart3, roles: ['SUPERADMIN', 'ADMIN', 'ANALISTA'] },
        { name: 'Horarios', href: '/analitica/horarios', icon: Clock, roles: ['SUPERADMIN', 'ADMIN', 'ANALISTA'] },
      ],
    },
    {
      group: 'Configuración',
      items: [
        { name: 'Configuración', href: '/configuracion', icon: Settings, roles: ['SUPERADMIN', 'ADMIN'] },
        { name: 'Suscripción & Planes', href: '/suscripcion', icon: CreditCard, roles: ['SUPERADMIN', 'ADMIN'] },
      ],
    },
  ];

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar contenedor */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-[#f8fafc] px-3.5 py-4 transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-3 lg:hidden border-b border-slate-200 mb-2">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Menú Principal</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-5 text-xs">
          {navigation.map((group) => {
            const filteredItems = group.items.filter(item => item.roles.includes(rolActual));
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.group} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  {group.group}
                </p>
                <div className="space-y-0.5 mt-1">
                  {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => onClose()}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-colors ${
                          isActive
                            ? 'bg-slate-200/90 text-slate-950 font-bold shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                        <span className="text-xs">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
