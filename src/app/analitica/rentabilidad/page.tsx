'use client';

import React from 'react';
import { useERP } from '@/context/erp-context';
import { formatCLP, formatPercent, calculateMargin } from '@/lib/utils';
import { TrendingUp, DollarSign, PieChart, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function RentabilidadPage() {
  const { productos, categorias } = useERP();

  const dataMargen = productos.map(p => ({
    name: p.nombre.slice(0, 15) + '...',
    nombreCompleto: p.nombre,
    precioVenta: p.precio_venta,
    precioCompra: p.precio_compra,
    utilidad: p.precio_venta - p.precio_compra,
    margen: calculateMargin(p.precio_venta, p.precio_compra),
  })).sort((a, b) => b.utilidad - a.utilidad);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Análisis de Rentabilidad & Márgenes</h2>
            <p className="text-xs text-slate-500">Utilidad bruta unitaria y márgenes porcentuales por línea de producto.</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Utilidad por Producto */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Utilidad en Pesos (CLP) por Producto</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataMargen}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                formatter={(val: any, name: any) => [formatCLP(Number(val)), 'Utilidad Unitaria']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
              />
              <Bar dataKey="utilidad" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Márgenes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5">Producto</th>
                <th className="px-4 py-3.5 text-right">Costo Compra</th>
                <th className="px-4 py-3.5 text-right">Precio Venta</th>
                <th className="px-4 py-3.5 text-right">Ganancia Unitaria</th>
                <th className="px-4 py-3.5 text-center">Margen Bruto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataMargen.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.nombreCompleto}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{formatCLP(item.precioCompra)}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCLP(item.precioVenta)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">+{formatCLP(item.utilidad)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      {formatPercent(item.margen)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
