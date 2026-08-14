'use client';

import React, { useMemo } from 'react';
import { useERP } from '@/context/erp-context';
import { Clock, Sun, Moon, Calendar, Zap, ShoppingBag, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Link from 'next/link';

export default function HorariosAnaliticaPage() {
  const { ventas } = useERP();

  // Calcular distribución REAL de unidades de productos vendidos por hora del día (de 08:00 a 23:00)
  const horasData = useMemo(() => {
    if (ventas.length === 0) return [];

    const franjas: Record<number, { hora: string; unidades: number; boletas: number }> = {};
    for (let h = 8; h <= 22; h++) {
      const horaFormato = `${h.toString().padStart(2, '0')}:00`;
      franjas[h] = { hora: horaFormato, unidades: 0, boletas: 0 };
    }

    ventas.forEach((v) => {
      const fecha = new Date(v.fecha_venta);
      const hora = fecha.getHours();
      
      // Cantidad de productos en esa venta
      const unidadesEnVenta = v.detalles && v.detalles.length > 0 
        ? v.detalles.reduce((acc, d) => acc + d.cantidad, 0)
        : 1;

      if (franjas[hora]) {
        franjas[hora].unidades += unidadesEnVenta;
        franjas[hora].boletas += 1;
      } else if (hora >= 8 && hora <= 22) {
        franjas[hora] = { hora: `${hora}:00`, unidades: unidadesEnVenta, boletas: 1 };
      }
    });

    return Object.values(franjas);
  }, [ventas]);

  // Identificar hora pico real
  const horaPico = useMemo(() => {
    if (horasData.length === 0) return null;
    const max = [...horasData].sort((a, b) => b.unidades - a.unidades)[0];
    return max && max.unidades > 0 ? max : null;
  }, [horasData]);

  const totalProductosVendidos = useMemo(() => {
    return horasData.reduce((acc, h) => acc + h.unidades, 0);
  }, [horasData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Análisis de Horarios & Demanda</h2>
            <p className="text-xs text-slate-500">
              Cantidad de productos y unidades vendidas por franja horaria para optimizar reposición y atención.
            </p>
          </div>
        </div>

        {horaPico ? (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-xs text-amber-900 font-bold">
            <Zap className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Hora de Mayor Demanda: {horaPico.hora} ({horaPico.unidades} u.)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-600 font-semibold">
            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Esperando primeras ventas reales</span>
          </div>
        )}
      </div>

      {/* Gráfico de Cantidad de Productos Vendidos por Hora */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Distribución de Productos Vendidos por Hora</h3>
            <p className="text-xs text-slate-400">Cantidad total de unidades dispensadas en cada horario</p>
          </div>
          {ventas.length > 0 && (
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
              {totalProductosVendidos} unidades vendidas en total
            </span>
          )}
        </div>

        {ventas.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <h4 className="font-bold text-slate-700 text-sm">No hay ventas registradas aún</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                La gráfica de horarios y concurrencia se generará automáticamente a medida que realices ventas reales en el Punto de Venta (POS).
              </p>
            </div>
            <Link
              href="/ventas/nueva"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2d3748] hover:bg-[#1a202c] text-white font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              <span>Ir al Punto de Venta (POS)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={horasData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hora" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} unidades`, 'Productos Vendidos']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Bar dataKey="unidades" name="Unidades Vendidas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tarjetas de Recomendación Operativa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Turno Mañana (09:00 - 13:00)</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Recepción de compras a proveedores, reposición de góndolas y preparación del punto de venta.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 border-l-4 border-l-blue-600">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Franja de Alta Demanda</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Concentración de mayor volumen de unidades por ticket. Mantener cajas operativas y productos clave al alcance.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span>Cierre de Turno</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Cuadratura y arqueo de caja, verificación de stock en kardex y reposición de productos con alerta ROP.
          </p>
        </div>
      </div>
    </div>
  );
}
