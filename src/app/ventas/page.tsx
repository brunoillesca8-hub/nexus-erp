'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '@/context/erp-context';
import { formatCLP, formatDate } from '@/lib/utils';
import { History, ShoppingCart, Search, Filter, Printer, Eye, ArrowUpRight, CheckCircle2, User } from 'lucide-react';
import { Venta } from '@/types/database.types';

export default function HistorialVentasPage() {
  const { ventas, sucursalActiva, empresa } = useERP();
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [ventaDetalle, setVentaDetalle] = useState<Venta | null>(null);

  const ventasFiltradas = ventas.filter(v => {
    const q = filtroBusqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      v.numero_folio.toString().includes(q) ||
      (v.cliente?.nombre && v.cliente.nombre.toLowerCase().includes(q)) ||
      v.metodo_pago.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Modal de Detalle de Venta */}
      {ventaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Comprobante de Venta</h3>
                <p className="text-xs text-slate-500 font-mono">Folio #{ventaDetalle.numero_folio}</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {ventaDetalle.estado}
              </span>
            </div>

            <div className="text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span className="font-semibold text-slate-800">{formatDate(ventaDetalle.fecha_venta)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="font-semibold text-slate-800">{ventaDetalle.cliente?.nombre || 'Cliente General'}</span>
              </div>
              <div className="flex justify-between">
                <span>Método de Pago:</span>
                <span className="font-semibold text-slate-800">{ventaDetalle.metodo_pago.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Sucursal:</span>
                <span className="font-semibold text-slate-800">{sucursalActiva.nombre}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>{formatCLP(ventaDetalle.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Descuento:</span>
                <span>-{formatCLP(ventaDetalle.descuento)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span className="text-blue-600">{formatCLP(ventaDetalle.total)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
              <button
                onClick={() => setVentaDetalle(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Historial de Ventas</h2>
            <p className="text-xs text-slate-500">Registro histórico inmutable de ventas emitidas en {empresa.nombre}.</p>
          </div>
        </div>

        <Link
          href="/ventas/nueva"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Nueva Venta (POS)</span>
        </Link>
      </div>

      {/* Barra de Filtros */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Filtrar por folio #, cliente o forma de pago..."
          value={filtroBusqueda}
          onChange={(e) => setFiltroBusqueda(e.target.value)}
          className="flex-1 text-xs bg-transparent outline-none placeholder:text-slate-400 text-slate-900"
        />
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          {ventasFiltradas.length} ventas
        </span>
      </div>

      {/* Tabla de Ventas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5">Folio</th>
                <th className="px-4 py-3.5">Fecha y Hora</th>
                <th className="px-4 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">Método de Pago</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5 text-right">Total (CLP)</th>
                <th className="px-4 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron registros de ventas.
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold font-mono text-slate-900">
                      #{v.numero_folio}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {formatDate(v.fecha_venta)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.cliente?.nombre || 'Cliente General'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {v.metodo_pago.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {v.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-right text-slate-900 text-sm">
                      {formatCLP(v.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setVentaDetalle(v)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Ver Comprobante"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
