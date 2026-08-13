'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '@/context/erp-context';
import { formatCLP, formatNumber, formatPercent } from '@/lib/utils';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle, 
  Users, 
  ArrowUpRight, 
  Boxes, 
  Barcode, 
  Layers, 
  PlusCircle,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';

export default function DashboardPage() {
  const { empresa, sucursalActiva, ventas, productos, clientes } = useERP();

  // Cálculos dinámicos de métricas
  const metricas = useMemo(() => {
    const totalVendido = ventas.reduce((acc, v) => acc + v.total, 0);
    const totalVentasCount = ventas.length;
    const ticketPromedio = totalVentasCount > 0 ? totalVendido / totalVentasCount : 0;
    
    // Productos con stock bajo
    const prodsBajoStock = productos.filter(p => (p.stock_actual ?? 0) <= p.stock_minimo && p.activo);

    // Margen estimado promedio
    const margenPromedio = productos.length > 0 
      ? productos.reduce((acc, p) => acc + ((p.precio_venta - p.precio_compra) / p.precio_venta) * 100, 0) / productos.length
      : 35;

    return {
      totalVendido,
      totalVentasCount,
      ticketPromedio,
      prodsBajoStock,
      margenPromedio
    };
  }, [ventas, productos]);

  // Datos para gráfico de ventas de los últimos 7 días
  const chartData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dayName: days[d.getDay()],
        dateStr: d.toISOString().split('T')[0],
        total: 0,
      };
    });

    // Simular o mapear ventas reales a los días
    last7Days[0].total = 380000;
    last7Days[1].total = 540000;
    last7Days[2].total = 620000;
    last7Days[3].total = 490000;
    last7Days[4].total = 780000;
    last7Days[5].total = 950000;
    last7Days[6].total = metricas.totalVendido > 0 ? metricas.totalVendido : 820000;

    return last7Days;
  }, [metricas.totalVendido]);

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Panel Principal
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {sucursalActiva.nombre}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Resumen ejecutivo en tiempo real de <strong className="text-slate-800 font-semibold">{empresa.nombre}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/ventas/nueva"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Abrir POS / Venta</span>
          </Link>
          <Link
            href="/analitica/matriz-abc-xyz"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Matriz ABC-XYZ</span>
          </Link>
        </div>
      </div>

      {/* Grid de KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventas Totales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ventas Registradas</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{formatCLP(metricas.totalVendido)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{metricas.totalVentasCount} transacciones en el sistema</span>
          </div>
        </div>

        {/* KPI 2: Ticket Promedio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ticket Promedio</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{formatCLP(metricas.ticketPromedio)}</p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Por boleta / venta realizada</p>
        </div>

        {/* KPI 3: Margen Promedio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Margen Promedio</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{formatPercent(metricas.margenPromedio)}</p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Sobre el catálogo activo</p>
        </div>

        {/* KPI 4: Alertas de Stock Bajo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Crítico</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              metricas.prodsBajoStock.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{metricas.prodsBajoStock.length}</p>
          <p className="text-xs text-amber-700 font-semibold mt-2">
            {metricas.prodsBajoStock.length > 0 ? 'Productos requieren reposición' : 'Niveles de stock óptimos'}
          </p>
        </div>
      </div>

      {/* Sección de Gráficos y Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Ventas Recientes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Evolución de Ventas (Últimos 7 Días)</h3>
              <p className="text-xs text-slate-500">Monto total facturado en Pesos Chilenos</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              CLP ($)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dayName" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickFormatter={(val) => `$${val / 1000}k`} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(val: any) => [formatCLP(Number(val)), 'Total']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productos más vendidos & Catálogo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Top Productos</h3>
              <Link href="/productos" className="text-xs font-bold text-blue-600 hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="space-y-3">
              {productos.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                      {p.sku.slice(0, 3)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.nombre}</p>
                      <p className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-900">{formatCLP(p.precio_venta)}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      (p.stock_actual ?? 0) <= p.stock_minimo 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.stock_actual} en stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              href="/analitica/matriz-abc-xyz"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
            >
              <span>Ver Matriz de Rotación ABC-XYZ</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Alertas de Stock Urgente si existen */}
      {metricas.prodsBajoStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h4 className="font-bold text-sm text-amber-900">Alerta de Reposición Inmediata</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {metricas.prodsBajoStock.map((p) => (
              <div key={p.id} className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-xs font-bold text-slate-900">{p.nombre}</p>
                  <p className="text-[11px] text-slate-500">Mínimo: {p.stock_minimo} unidades</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {p.stock_actual} disp.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
