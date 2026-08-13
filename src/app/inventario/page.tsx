'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { formatDate } from '@/lib/utils';
import { Boxes, History, PlusCircle, ArrowDownLeft, ArrowUpRight, AlertTriangle, Search, Filter, ShieldCheck, X } from 'lucide-react';
import { TipoMovimiento } from '@/types/database.types';

export default function InventarioPage() {
  const { productos, movimientos, ajustarStock, sucursalActiva, empresa } = useERP();

  const [tab, setTab] = useState<'stock' | 'kardex'>('stock');
  const [modalAjusteOpen, setModalAjusteOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Form de ajuste
  const [prodSeleccionadoId, setProdSeleccionadoId] = useState('');
  const [tipoAjuste, setTipoAjuste] = useState<TipoMovimiento>('ENTRADA_COMPRA');
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(5);
  const [motivoAjuste, setMotivoAjuste] = useState('');

  const handleAjusteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodSeleccionadoId || cantidadAjuste <= 0 || !motivoAjuste) return;

    const esSalida = ['SALIDA_VENTA', 'AJUSTE_NEGATIVO', 'MERMA_DANADO', 'DEVOLUCION_PROVEEDOR', 'TRANSFERENCIA_SALIDA'].includes(tipoAjuste);
    const cantFinal = esSalida ? -Math.abs(cantidadAjuste) : Math.abs(cantidadAjuste);

    ajustarStock(prodSeleccionadoId, cantFinal, motivoAjuste, tipoAjuste);
    setModalAjusteOpen(false);
    setMotivoAjuste('');
  };

  const getTipoBadge = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case 'ENTRADA_COMPRA':
      case 'AJUSTE_POSITIVO':
      case 'DEVOLUCION_CLIENTE':
      case 'TRANSFERENCIA_ENTRADA':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">+{tipo}</span>;
      case 'SALIDA_VENTA':
      case 'AJUSTE_NEGATIVO':
      case 'MERMA_DANADO':
      case 'DEVOLUCION_PROVEEDOR':
      case 'TRANSFERENCIA_SALIDA':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">{tipo}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">{tipo}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal de Ajuste de Stock / Kardex */}
      {modalAjusteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Registrar Movimiento de Kardex</h3>
              </div>
              <button
                onClick={() => setModalAjusteOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAjusteSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Producto a Ajustar *</label>
                <select
                  required
                  value={prodSeleccionadoId}
                  onChange={e => setProdSeleccionadoId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                >
                  <option value="">Seleccionar Producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (Stock actual: {p.stock_actual ?? 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tipo de Movimiento *</label>
                <select
                  value={tipoAjuste}
                  onChange={e => setTipoAjuste(e.target.value as TipoMovimiento)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                >
                  <option value="ENTRADA_COMPRA">📥 ENTRADA_COMPRA (Aumenta stock)</option>
                  <option value="AJUSTE_POSITIVO">➕ AJUSTE_POSITIVO (Conteo físico favorable)</option>
                  <option value="AJUSTE_NEGATIVO">➖ AJUSTE_NEGATIVO (Descuadre físico)</option>
                  <option value="MERMA_DANADO">⚠️ MERMA_DANADO (Producto roto/vencido)</option>
                  <option value="DEVOLUCION_PROVEEDOR">↩️ DEVOLUCION_PROVEEDOR</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Cantidad de Unidades *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidadAjuste}
                  onChange={e => setCantidadAjuste(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Motivo / Justificación *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ej. Factura N° 8900 proveedor o rotura durante reposición"
                  value={motivoAjuste}
                  onChange={e => setMotivoAjuste(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAjusteOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-md shadow-blue-500/20"
                >
                  Guardar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Gestión de Inventario & Kardex</h2>
            <p className="text-xs text-slate-500">Monitoreo de existencias por sucursal y trazabilidad completa de movimientos.</p>
          </div>
        </div>

        <button
          onClick={() => setModalAjusteOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajuste / Entrada de Stock</span>
        </button>
      </div>

      {/* Pestañas de Vista */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setTab('stock')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            tab === 'stock'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Stock Actual por Producto
        </button>
        <button
          onClick={() => setTab('kardex')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'kardex'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Kardex Histórico Inmutable ({movimientos.length})</span>
        </button>
      </div>

      {/* TAB 1: Stock Actual */}
      {tab === 'stock' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5">SKU</th>
                  <th className="px-4 py-3.5">Producto</th>
                  <th className="px-4 py-3.5 text-center">Stock Mínimo</th>
                  <th className="px-4 py-3.5 text-center">Stock Actual</th>
                  <th className="px-4 py-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.map((p) => {
                  const stock = p.stock_actual ?? 0;
                  const critico = stock <= p.stock_minimo;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{p.sku}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{p.nombre}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{p.stock_minimo} unidades</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-extrabold text-sm text-slate-900">{stock}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          stock === 0
                            ? 'bg-rose-100 text-rose-700'
                            : critico
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {stock === 0 ? 'Sin Existencias' : critico ? 'Stock Bajo (Reponer)' : 'Stock Óptimo'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Kardex Movimientos */}
      {tab === 'kardex' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5">Fecha y Hora</th>
                  <th className="px-4 py-3.5">Producto</th>
                  <th className="px-4 py-3.5">Tipo Movimiento</th>
                  <th className="px-4 py-3.5 text-center">Cant.</th>
                  <th className="px-4 py-3.5 text-center">Stock Ant.</th>
                  <th className="px-4 py-3.5 text-center">Stock Post.</th>
                  <th className="px-4 py-3.5">Motivo / Folio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No hay movimientos de inventario registrados aún.
                    </td>
                  </tr>
                ) : (
                  movimientos.map((m) => {
                    const prod = productos.find(p => p.id === m.producto_id) || m.producto;

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 text-slate-500 font-medium whitespace-nowrap">
                          {formatDate(m.created_at)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {prod?.nombre || 'Producto'}
                        </td>
                        <td className="px-4 py-3">
                          {getTipoBadge(m.tipo)}
                        </td>
                        <td className="px-4 py-3 text-center font-bold font-mono text-slate-900">
                          {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-500 font-mono">
                          {m.stock_anterior}
                        </td>
                        <td className="px-4 py-3 text-center font-black text-slate-900 font-mono">
                          {m.stock_posterior}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">
                          {m.motivo || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
