'use client';

import React, { useMemo } from 'react';
import { useERP } from '@/context/erp-context';
import { formatCLP, formatPercent, calculateMargin } from '@/lib/utils';
import { TrendingUp, DollarSign, Download, Sparkles, Layers, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';

export default function RentabilidadPage() {
  const { productos, categorias } = useERP();

  // Calcular métricas completas de todos los productos
  const todosLosProductos = useMemo(() => {
    return productos.map(p => {
      const cat = categorias.find(c => c.id === p.categoria_id)?.nombre || 'General';
      const utilidad = p.precio_venta - p.precio_compra;
      const margen = calculateMargin(p.precio_venta, p.precio_compra);
      const facturacionEstimada = p.precio_venta * (p.stock_actual ?? 10);

      return {
        id: p.id,
        sku: p.sku,
        name: p.nombre.slice(0, 16) + (p.nombre.length > 16 ? '...' : ''),
        nombreCompleto: p.nombre,
        categoria: cat,
        precioCompra: p.precio_compra,
        precioVenta: p.precio_venta,
        utilidad,
        margen,
        stockActual: p.stock_actual ?? 0,
        facturacionEstimada,
      };
    }).sort((a, b) => b.utilidad - a.utilidad);
  }, [productos, categorias]);

  // REGLA PARETO 80/20: Seleccionar únicamente el 20% de productos de mayor impacto para la gráfica
  const top20PorcientoGrafica = useMemo(() => {
    const cantidadPareto = Math.max(3, Math.ceil(todosLosProductos.length * 0.20));
    return todosLosProductos.slice(0, cantidadPareto);
  }, [todosLosProductos]);

  // Exportar todos los productos a Excel (.xlsx)
  const descargarExcel = () => {
    const filasParaExcel = todosLosProductos.map((p, idx) => ({
      'Ranking': idx + 1,
      'SKU': p.sku,
      'Producto': p.nombreCompleto,
      'Categoría': p.categoria,
      'Costo Compra Unitario (CLP)': p.precioCompra,
      'Precio Venta Unitario (CLP)': p.precioVenta,
      'Ganancia / Utilidad Unitaria (CLP)': p.utilidad,
      'Margen Bruto (%)': `${p.margen.toFixed(1)}%`,
      'Stock Actual': p.stockActual,
    }));

    const hoja = XLSX.utils.json_to_sheet(filasParaExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Rentabilidad y Márgenes');
    XLSX.writeFile(libro, `Reporte_Rentabilidad_Margenes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Análisis de Rentabilidad & Márgenes (Pareto 80/20)</h2>
            <p className="text-xs text-slate-500">
              Gráfica enfocada en el <strong className="text-slate-800">20% de productos clave</strong> que generan el 80% de utilidad, con auditoría completa debajo.
            </p>
          </div>
        </div>

        <button
          onClick={descargarExcel}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Descargar Excel (.xlsx)</span>
        </button>
      </div>

      {/* Gráfico de Barras: Solo el Top 20% Pareto */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Top 20% Productos Más Rentables (Utilidad en CLP por Unidad)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
            Mostrando {top20PorcientoGrafica.length} de {todosLosProductos.length} productos
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top20PorcientoGrafica}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                formatter={(val: any) => [formatCLP(Number(val)), 'Utilidad Unitaria']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
              />
              <Bar dataKey="utilidad" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla Completa con el 100% de los Productos del Catálogo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Detalle Integral del Catálogo Completo ({todosLosProductos.length} Productos)
          </h3>
          <span className="text-xs text-slate-500 font-medium">Ordenado por mayor ganancia</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">SKU / Producto</th>
                <th className="px-4 py-3.5">Categoría</th>
                <th className="px-4 py-3.5 text-right">Costo Unit.</th>
                <th className="px-4 py-3.5 text-right">Precio Venta Unit.</th>
                <th className="px-4 py-3.5 text-right">Ganancia Unitaria</th>
                <th className="px-4 py-3.5 text-center">Margen Bruto</th>
                <th className="px-4 py-3.5 text-center">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todosLosProductos.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block">{item.nombreCompleto}</span>
                    <span className="font-mono text-[10px] text-slate-400">{item.sku}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                      {item.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">{formatCLP(item.precioCompra)}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCLP(item.precioVenta)}</td>
                  <td className="px-4 py-3 text-right font-black text-emerald-600">+{formatCLP(item.utilidad)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      {formatPercent(item.margen)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">
                    {item.stockActual}
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
