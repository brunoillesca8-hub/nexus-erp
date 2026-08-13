'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '@/context/erp-context';
import { formatCLP, formatPercent } from '@/lib/utils';
import { Layers, HelpCircle, Sparkles, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Producto } from '@/types/database.types';

type ClasificacionABC = 'A' | 'B' | 'C';
type ClasificacionXYZ = 'X' | 'Y' | 'Z';

interface AnalisisProducto extends Producto {
  ventasTotalesEstimadas: number;
  participacionPorcentaje: number;
  participacionAcumulada: number;
  clasificacionABC: ClasificacionABC;
  coeficienteVariacion: number;
  clasificacionXYZ: ClasificacionXYZ;
  matriz: `${ClasificacionABC}${ClasificacionXYZ}`;
}

export default function MatrizAbcXyzPage() {
  const { productos } = useERP();
  const [filtroMatriz, setFiltroMatriz] = useState<string | null>(null);

  // Motor de Cálculo ABC y XYZ
  const analisis = useMemo(() => {
    // 1. Simulación / Estimación de ventas e ingresos por producto
    const prodsConVentas = productos.map((p, idx) => {
      // Ingresos estimados ponderados por precio y rotación
      const baseVentas = (p.precio_venta * (p.stock_actual ?? 10)) + (100000 * (6 - (idx % 6)));
      // Variabilidad simulada de la demanda (desviación / promedio)
      const cvSimulado = Number((0.15 + (idx * 0.12) % 0.7).toFixed(2));

      return {
        ...p,
        ventasTotalesEstimadas: baseVentas,
        coeficienteVariacion: cvSimulado,
      };
    });

    // 2. Ordenar de mayor a menor ingreso (Pareto)
    prodsConVentas.sort((a, b) => b.ventasTotalesEstimadas - a.ventasTotalesEstimadas);

    const granTotal = prodsConVentas.reduce((acc, p) => acc + p.ventasTotalesEstimadas, 0);

    let acumulado = 0;
    const resultado: AnalisisProducto[] = prodsConVentas.map(p => {
      const part = granTotal > 0 ? (p.ventasTotalesEstimadas / granTotal) * 100 : 0;
      acumulado += part;

      // Clasificación ABC (80% / 15% / 5%)
      let abc: ClasificacionABC = 'C';
      if (acumulado <= 80) abc = 'A';
      else if (acumulado <= 95) abc = 'B';
      else abc = 'C';

      // Clasificación XYZ por Coeficiente de Variación (CV)
      let xyz: ClasificacionXYZ = 'Z';
      if (p.coeficienteVariacion <= 0.3) xyz = 'X';
      else if (p.coeficienteVariacion <= 0.6) xyz = 'Y';
      else xyz = 'Z';

      return {
        ...p,
        participacionPorcentaje: part,
        participacionAcumulada: acumulado,
        clasificacionABC: abc,
        clasificacionXYZ: xyz,
        matriz: `${abc}${xyz}` as `${ClasificacionABC}${ClasificacionXYZ}`,
      };
    });

    return resultado;
  }, [productos]);

  // Recomendación estratégica para cada celda de la matriz
  const recomendaciones: Record<string, { titulo: string; estrategia: string; color: string }> = {
    AX: { titulo: 'Alta Importancia / Demanda Predecible', estrategia: 'Automatizar reabastecimiento continuo (JIT). Mantener stock de seguridad bajo y alta rotación.', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
    AY: { titulo: 'Alta Importancia / Demanda Moderada', estrategia: 'Monitoreo semanal estricto. Negociar entregas ágiles con proveedores para evitar sobrestock.', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    AZ: { titulo: 'Alta Importancia / Demanda Impredecible', estrategia: 'Riesgo alto de rotura. Mantener stock de seguridad alto o contratos de entrega express.', color: 'bg-amber-50 border-amber-300 text-amber-900' },
    BX: { titulo: 'Importancia Media / Demanda Predecible', estrategia: 'Pedidos periódicos estándar por lotes económicos (EOQ). Bajo costo de supervisión.', color: 'bg-blue-50 border-blue-200 text-blue-900' },
    BY: { titulo: 'Importancia Media / Demanda Fluctuante', estrategia: 'Monitoreo quincenal. Mantener existencias moderadas según estacionalidad.', color: 'bg-blue-50 border-blue-200 text-blue-800' },
    BZ: { titulo: 'Importancia Media / Demanda Impredecible', estrategia: 'Comprar por orden de pedido o evaluar reducción de surtido de marcas.', color: 'bg-amber-50 border-amber-200 text-amber-800' },
    CX: { titulo: 'Baja Importancia / Demanda Constante', estrategia: 'Revisión simplificada. Comprar en lotes grandes espaciados para obtener descuentos.', color: 'bg-slate-50 border-slate-200 text-slate-800' },
    CY: { titulo: 'Baja Importancia / Demanda Fluctuante', estrategia: 'Monitoreo trimestral básico. No sobredimensionar el inventario.', color: 'bg-slate-50 border-slate-200 text-slate-700' },
    CZ: { titulo: 'Baja Importancia / Demanda Impredecible', estrategia: 'Candidatos a descontinuación o venta exclusivamente bajo pedido especial.', color: 'bg-rose-50 border-rose-300 text-rose-900' },
  };

  const productosFiltrados = filtroMatriz 
    ? analisis.filter(p => p.matriz === filtroMatriz)
    : analisis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Matriz Analítica ABC - XYZ</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Segmentación inteligente de productos combinando <strong className="text-slate-800">Impacto Económico (ABC)</strong> con <strong className="text-slate-800">Predictibilidad de Demanda (XYZ)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-xl text-xs text-indigo-900">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-semibold">Algoritmo de Pareto & Variabilidad Activo</span>
        </div>
      </div>

      {/* Cuadrícula de la Matriz 3x3 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Cuadrante Estratégico (Haz clic en una celda para filtrar)</h3>

        <div className="grid grid-cols-4 gap-2 text-xs">
          {/* Header column */}
          <div className="font-bold text-slate-400 p-2 text-center"></div>
          <div className="font-bold text-slate-700 bg-slate-100 p-2 rounded-lg text-center">
            X (Demanda Estable)
          </div>
          <div className="font-bold text-slate-700 bg-slate-100 p-2 rounded-lg text-center">
            Y (Demanda Media)
          </div>
          <div className="font-bold text-slate-700 bg-slate-100 p-2 rounded-lg text-center">
            Z (Demanda Variable)
          </div>

          {/* Fila A */}
          {(['A', 'B', 'C'] as ClasificacionABC[]).map((abc) => (
            <React.Fragment key={abc}>
              <div className="font-bold text-slate-700 bg-slate-100 p-3 rounded-lg flex items-center justify-center">
                {abc} ({abc === 'A' ? 'Top 80%' : abc === 'B' ? '15%' : '5%'})
              </div>
              {(['X', 'Y', 'Z'] as ClasificacionXYZ[]).map((xyz) => {
                const key = `${abc}${xyz}`;
                const count = analisis.filter(p => p.matriz === key).length;
                const isSelected = filtroMatriz === key;

                return (
                  <button
                    key={key}
                    onClick={() => setFiltroMatriz(isSelected ? null : key)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-indigo-600 shadow-md font-bold'
                        : 'hover:border-indigo-400 hover:shadow-xs'
                    } ${
                      abc === 'A' ? 'bg-emerald-50/70 border-emerald-200' :
                      abc === 'B' ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="font-black text-sm block text-slate-900">{key}</span>
                    <span className="text-[11px] font-semibold text-slate-500">{count} productos</span>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {filtroMatriz && (
          <div className={`p-4 rounded-xl border ${recomendaciones[filtroMatriz]?.color || 'bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs">
                Estrategia Recomendada para <strong>{filtroMatriz}</strong>: {recomendaciones[filtroMatriz]?.titulo}
              </h4>
              <button
                onClick={() => setFiltroMatriz(null)}
                className="text-xs font-semibold underline text-slate-600 hover:text-slate-900"
              >
                Mostrar todos
              </button>
            </div>
            <p className="text-xs mt-1 leading-relaxed">
              {recomendaciones[filtroMatriz]?.estrategia}
            </p>
          </div>
        )}
      </div>

      {/* Tabla Detallada con Clasificación */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Detalle por Producto {filtroMatriz && `(Filtrado por ${filtroMatriz})`}
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {productosFiltrados.length} productos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5">SKU</th>
                <th className="px-4 py-3.5">Producto</th>
                <th className="px-4 py-3.5 text-right">Facturación Estimada</th>
                <th className="px-4 py-3.5 text-center">Part. Acum.</th>
                <th className="px-4 py-3.5 text-center">ABC</th>
                <th className="px-4 py-3.5 text-center">XYZ (CV)</th>
                <th className="px-4 py-3.5 text-center">Cuadrante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productosFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{p.sku}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{p.nombre}</td>
                  <td className="px-4 py-3 font-bold text-right text-slate-900">
                    {formatCLP(p.ventasTotalesEstimadas)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-600">
                    {formatPercent(p.participacionAcumulada)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-black text-xs ${
                      p.clasificacionABC === 'A' ? 'bg-emerald-100 text-emerald-800' :
                      p.clasificacionABC === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {p.clasificacionABC}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    <span className="font-bold text-slate-800">{p.clasificacionXYZ}</span>
                    <span className="text-[10px] text-slate-400 block">({p.coeficienteVariacion})</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2.5 py-1 rounded-full font-black text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {p.matriz}
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
