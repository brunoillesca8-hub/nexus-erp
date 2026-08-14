'use client';

import React from 'react';
import { useERP } from '@/context/erp-context';
import { Store, Building2, ShieldCheck, Menu, Bell, Sparkles, LogOut, User } from 'lucide-react';
import { RolUsuario } from '@/types/database.types';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const { empresa, sucursales, sucursalActiva, setSucursalActiva, rolActual, setRolActual, isOnlineSupabase } = useERP();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-[#384656] text-white px-4 sm:px-6 shadow-md transition-all">
      {/* Lado izquierdo: Botón menú móvil + Logo Tienda + Nombre + RUT */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100/10 border border-white/20 text-2xl shadow-inner select-none">
            🏪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white line-clamp-1">
                NEXUS ERP - {empresa.nombre}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/10 text-slate-200 border border-white/15">
                <Sparkles className="w-3 h-3 text-emerald-400" /> {sucursalActiva.nombre}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Tienda R.U.T. {empresa.rut_identificador || '76.123.456-7'}
            </p>
          </div>
        </div>
      </div>

      {/* Lado derecho: Selector de Rol / Usuario + Botón Cerrar Sesión */}
      <div className="flex items-center gap-3">
        {/* Selector de Rol RBAC */}
        <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-slate-200">
          <span className="text-slate-300 font-medium">Usuario:</span>
          <select
            value={rolActual}
            onChange={(e) => setRolActual(e.target.value as RolUsuario)}
            aria-label="Seleccionar rol"
            className="bg-transparent font-bold text-white outline-none cursor-pointer"
          >
            <option value="ADMIN" className="text-slate-900 font-bold">ADMIN</option>
            <option value="VENDEDOR" className="text-slate-900">VENDEDOR</option>
            <option value="INVENTARIO" className="text-slate-900">INVENTARIO</option>
            <option value="ANALISTA" className="text-slate-900">ANALISTA</option>
          </select>
        </div>

        {/* Botón Cerrar Sesión Estilo Screenshot */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
}
