'use client';

import React, { useMemo } from 'react';
import { useERP } from '@/context/erp-context';
import { formatCLP, formatNumber } from '@/lib/utils';
import { BarChart3, TrendingUp, Sparkles, Layers, ArrowUpRight } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

// 10 Colores distintos y vibrantes para diferenciar los 10 productos
const PRODUCT_COLORS = [
  '#2563eb', // Azul
  '#10b981', // Verde esmeralda
  '#f59e0b', // Ámbar / Naranja
  '#8b5cf6', // Violeta
  '#ef4444', // Rojo
  '#06b6d4', // Cyan
  '#ec4899', // Rosa
  '#84cc16', // Lima
  '#6366f1', // Índigo
  '#14b8a6', // Teal
];

export default function Top10ProductosPage() {
  const { productos, ventas } = useERP();

  // Obtener los Top 10 productos
  const top10 = useMemo(() => {
    return productos.slice(0, 10);
  }, [productos]);

  // Generar datos cronológicos para el gráfico multilínea (Semana 1 a Semana 6)
  const lineChartData = useMemo(() => {
    const semanas = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'];

    return semanas.map((sem, sIndex) => {
      const entry: Record<string, any> = { semana: sem };

      top10.forEach((p, pIndex) => {
        // Base de unidades vendidas simuladas por producto a lo largo de las semanas
        const factor = (10 - pIndex) * 4;
        const variacion = Math.sin(sIndex + pIndex) * 6;
        const unidadesVendidas = Math.max(2, Math.round(factor + variacion + (sIndex * 2)));
        
        entry[p.sku] = unidadesVendidas;
      });

      return entry;
    });
  }, [top10]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Evolución de Tendencia: Top 10 Productos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gráfico multilínea con <strong className="text-slate-800">10 colores diferenciados</strong> para monitorear el comportamiento de demanda y crecimiento semanal.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-xs text-blue-900 font-semibold">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Monitoreo Semanal de Unidades</span>
        </div>
      </div>

      {/* Gráfico Multilínea de 10 Colores */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Unidades Vendidas por Semana (Top 10 SKUs)</h3>
          <span className="text-xs font-semibold text-slate-500">Curvas de Demanda</span>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="semana" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
              
              {top10.map((p, idx) => (
                <Line
                  key={p.sku}
                  type="monotone"
                  dataKey={p.sku}
                  name={`${p.nombre.slice(0, 18)} (${p.sku})`}
                  stroke={PRODUCT_COLORS[idx % PRODUCT_COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid de Resumen de los 10 Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {top10.map((p, idx) => (
          <div
            key={p.id}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 border-t-4"
            style={{ borderTopColor: PRODUCT_COLORS[idx % PRODUCT_COLORS.length] }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[10px] text-slate-400">#{idx + 1} • {p.sku}</span>
              <span className="font-bold text-slate-900">{formatCLP(p.precio_venta)}</span>
            </div>
            <p className="font-bold text-slate-900 line-clamp-1">{p.nombre}</p>
            <p className="text-[11px] text-slate-500">{p.stock_actual ?? 0} unidades disponibles</p>
          </div>
        ))}
      </div>
    </div>
  );
}
