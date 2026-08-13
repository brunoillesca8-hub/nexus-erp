'use client';

import React from 'react';
import { useERP } from '@/context/erp-context';
import { Store, Building2, ShieldCheck, Menu, Bell, Sparkles } from 'lucide-react';
import { RolUsuario } from '@/types/database.types';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const { empresa, sucursales, sucursalActiva, setSucursalActiva, rolActual, setRolActual, isOnlineSupabase } = useERP();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur transition-all">
      {/* Lado izquierdo: Botón menú móvil + Empresa */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm shadow-blue-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 line-clamp-1">{empresa.nombre}</h1>
              <span className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                isOnlineSupabase 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                <Sparkles className="w-3 h-3" /> {isOnlineSupabase ? 'Supabase Online' : 'Multi-tenant'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{empresa.rut_identificador || 'RUT no registrado'}</p>
          </div>
        </div>
      </div>

      {/* Lado derecho: Selector de Sucursal, Selector de Rol & Perfil */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Selector de Sucursal Activa */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-700">
          <Store className="h-4 w-4 text-slate-500" />
          <select
            value={sucursalActiva.id}
            onChange={(e) => {
              const suc = sucursales.find(s => s.id === e.target.value);
              if (suc) setSucursalActiva(suc);
            }}
            aria-label="Seleccionar sucursal"
            className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
          >
            {sucursales.map(s => (
              <option key={s.id} value={s.id}>
                {s.nombre} {s.es_principal ? '(Principal)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Simulador de Roles RBAC */}
        <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="text-slate-500 font-medium">Rol:</span>
          <select
            value={rolActual}
            onChange={(e) => setRolActual(e.target.value as RolUsuario)}
            aria-label="Seleccionar rol de usuario"
            className="bg-transparent font-semibold text-slate-900 outline-none cursor-pointer"
          >
            <option value="ADMIN">ADMIN (Acceso Total)</option>
            <option value="VENDEDOR">VENDEDOR (POS + Catálogo)</option>
            <option value="INVENTARIO">INVENTARIO (Kardex + Stock)</option>
            <option value="ANALISTA">ANALISTA (Solo Analítica)</option>
          </select>
        </div>

        {/* Notificaciones & Avatar */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
            BA
          </div>
        </div>
      </div>
    </header>
  );
}
