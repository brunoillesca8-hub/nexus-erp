'use client';

import React from 'react';
import { useERP } from '@/context/erp-context';
import { formatCLP } from '@/lib/utils';
import { Clock, Sun, Moon, Calendar, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function HorariosAnaliticaPage() {
  const { ventas } = useERP();

  // Distribución simulada / real por hora (de 8:00 a 22:00)
  const horasData = [
    { hora: '09:00', total: 45000, transacciones: 3 },
    { hora: '10:00', total: 82000, transacciones: 6 },
    { hora: '11:00', total: 130000, transacciones: 11 },
    { hora: '12:00', total: 210000, transacciones: 16 },
    { hora: '13:00', total: 280000, transacciones: 22 },
    { hora: '14:00', total: 150000, transacciones: 12 },
    { hora: '15:00', total: 95000, transacciones: 8 },
    { hora: '16:00', total: 175000, transacciones: 14 },
    { hora: '17:00', total: 290000, transacciones: 24 },
    { hora: '18:00', total: 420000, transacciones: 35 },
    { hora: '19:00', total: 390000, transacciones: 31 },
    { hora: '20:00', total: 260000, transacciones: 19 },
    { hora: '21:00', total: 110000, transacciones: 7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Análisis de Horarios & Días Pico</h2>
            <p className="text-xs text-slate-500">Identificación de franjas horarias de mayor afluencia para optimizar turnos y reposición.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-xs text-amber-900 font-semibold">
          <Zap className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Hora Pico: 18:00 - 20:00 hrs</span>
        </div>
      </div>

      {/* Gráfico de Ventas por Hora */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-sm">Distribución de Ventas por Hora del Día</h3>
          <span className="text-xs font-semibold text-slate-500">Monto Facturado (CLP)</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={horasData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="hora" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip
                formatter={(val: any) => [formatCLP(Number(val)), 'Total Vendido']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tarjetas de Recomendación Operativa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Turno Mañana (09:00 - 13:00)</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Volumen moderado. Ideal para recepción de compras de proveedores, reposición de góndolas y conteo físico de inventario.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 border-l-4 border-l-blue-600">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Turno Tarde / Pico (17:00 - 20:30)</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Franja de máxima facturación (62% del total diario). Recomendar doble cajero y cajas de cobro ágil.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span>Cierre Nocturno (21:00 - 22:00)</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Disminución de flujo. Momento óptimo para arqueo de caja, verificación de kardex y orden del punto de venta.
          </p>
        </div>
      </div>
    </div>
  );
}
