'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '@/context/erp-context';
import { formatCLP, formatDate } from '@/lib/utils';
import { 
  History, 
  ShoppingCart, 
  Search, 
  Filter, 
  Printer, 
  Eye, 
  ArrowUpRight, 
  CheckCircle2, 
  User, 
  Calendar, 
  FileSpreadsheet, 
  Download, 
  X,
  Layers,
  Truck,
  CreditCard,
  TrendingUp,
  DollarSign,
  Clock
} from 'lucide-react';
import { Venta } from '@/types/database.types';
import * as XLSX from 'xlsx';

export default function HistorialVentasPage() {
  const { ventas, productos, categorias, proveedores, sucursalActiva, empresa } = useERP();

  // Estados de Filtros
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [filtroMetodoPago, setFiltroMetodoPago] = useState('');

  // Modal de Detalle
  const [ventaDetalle, setVentaDetalle] = useState<Venta | null>(null);

  // Atajos de Fecha
  const aplicarRangoFecha = (tipo: 'hoy' | '7dias' | 'mes' | 'todo') => {
    const hoy = new Date();
    const formatoYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];

    if (tipo === 'hoy') {
      setFechaDesde(formatoYYYYMMDD(hoy));
      setFechaHasta(formatoYYYYMMDD(hoy));
    } else if (tipo === '7dias') {
      const hace7 = new Date();
      hace7.setDate(hoy.getDate() - 7);
      setFechaDesde(formatoYYYYMMDD(hace7));
      setFechaHasta(formatoYYYYMMDD(hoy));
    } else if (tipo === 'mes') {
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      setFechaDesde(formatoYYYYMMDD(primerDiaMes));
      setFechaHasta(formatoYYYYMMDD(hoy));
    } else {
      setFechaDesde('');
      setFechaHasta('');
    }
  };

  // Filtrado Multidimensional
  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      // 1. Filtro de Texto (Folio, Cliente, Notas)
      const q = filtroBusqueda.toLowerCase().trim();
      if (q) {
        const matchFolio = v.numero_folio.toString().includes(q);
        const matchCliente = v.cliente?.nombre && v.cliente.nombre.toLowerCase().includes(q);
        const matchRut = v.cliente?.rut_identificador && v.cliente.rut_identificador.toLowerCase().includes(q);
        const matchMetodo = v.metodo_pago.toLowerCase().includes(q);
        if (!matchFolio && !matchCliente && !matchRut && !matchMetodo) return false;
      }

      // 2. Filtro por Rango de Fechas
      if (v.fecha_venta) {
        const fechaVentaStr = v.fecha_venta.split('T')[0];
        if (fechaDesde && fechaVentaStr < fechaDesde) return false;
        if (fechaHasta && fechaVentaStr > fechaHasta) return false;
      }

      // 3. Filtro por Método de Pago
      if (filtroMetodoPago && v.metodo_pago !== filtroMetodoPago) return false;

      // 4. Filtro por Categoría (Revisa si la venta tiene al menos un item de esa categoría)
      if (filtroCategoria) {
        const tieneCategoria = v.detalles?.some(d => {
          const prod = productos.find(p => p.id === d.producto_id);
          return prod?.categoria_id === filtroCategoria;
        });
        if (!tieneCategoria) return false;
      }

      // 5. Filtro por Proveedor
      if (filtroProveedor) {
        const tieneProveedor = v.detalles?.some(d => {
          const prod = productos.find(p => p.id === d.producto_id);
          return prod?.proveedor_id === filtroProveedor;
        });
        if (!tieneProveedor) return false;
      }

      return true;
    });
  }, [ventas, filtroBusqueda, fechaDesde, fechaHasta, filtroMetodoPago, filtroCategoria, filtroProveedor, productos]);

  // Resumen de Métricas del Filtro Activo
  const metricasFiltro = useMemo(() => {
    const totalVendido = ventasFiltradas.reduce((acc, v) => acc + v.total, 0);
    const totalCosto = ventasFiltradas.reduce((acc, v) => {
      const costo = v.detalles?.reduce((cAcc, d) => cAcc + (d.costo_unitario * d.cantidad), 0) || (v.total * 0.6);
      return acc + costo;
    }, 0);
    const ganancia = totalVendido - totalCosto;
    const ticketPromedio = ventasFiltradas.length > 0 ? totalVendido / ventasFiltradas.length : 0;

    return {
      totalVendido,
      totalCosto,
      ganancia,
      ticketPromedio,
      totalTransacciones: ventasFiltradas.length,
    };
  }, [ventasFiltradas]);

  // Exportar Ventas a Excel (.xlsx) con desglose detallado
  const exportarVentasExcel = () => {
    const filasDetalladas: any[] = [];

    ventasFiltradas.forEach(v => {
      const fechaFormateada = formatDate(v.fecha_venta);
      const clienteNombre = v.cliente?.nombre || 'Cliente General';
      const clienteRut = v.cliente?.rut_identificador || 'N/A';

      if (v.detalles && v.detalles.length > 0) {
        v.detalles.forEach(d => {
          const prod = productos.find(p => p.id === d.producto_id);
          const cat = categorias.find(c => c.id === prod?.categoria_id)?.nombre || 'General';
          const prov = proveedores.find(p => p.id === prod?.proveedor_id)?.nombre || 'Sin Proveedor';
          const gananciaItem = (d.precio_unitario - d.costo_unitario) * d.cantidad;

          filasDetalladas.push({
            'Folio Boleta': `#${v.numero_folio}`,
            'Fecha y Hora': fechaFormateada,
            'Cliente': clienteNombre,
            'RUT Cliente': clienteRut,
            'SKU': prod?.sku || 'N/A',
            'Producto Vendido': prod?.nombre || 'Producto',
            'Categoría': cat,
            'Proveedor': prov,
            'Cantidad': d.cantidad,
            'Costo Compra Unit. Neto (CLP)': d.costo_unitario,
            'Precio Venta Unit. Inc. IVA (CLP)': d.precio_unitario,
            'Ganancia Total Ítem (CLP)': gananciaItem,
            'Total Ítem (CLP)': d.subtotal,
            'Método de Pago': v.metodo_pago.replace('_', ' '),
            'Local / Sucursal': sucursalActiva.nombre,
          });
        });
      } else {
        filasDetalladas.push({
          'Folio Boleta': `#${v.numero_folio}`,
          'Fecha y Hora': fechaFormateada,
          'Cliente': clienteNombre,
          'RUT Cliente': clienteRut,
          'SKU': 'VARIOS',
          'Producto Vendido': 'Venta Registrada',
          'Categoría': 'General',
          'Proveedor': 'General',
          'Cantidad': 1,
          'Costo Compra Unit. Neto (CLP)': Math.round(v.total * 0.6),
          'Precio Venta Unit. Inc. IVA (CLP)': v.total,
          'Ganancia Total Ítem (CLP)': Math.round(v.total * 0.4),
          'Total Ítem (CLP)': v.total,
          'Método de Pago': v.metodo_pago.replace('_', ' '),
          'Local / Sucursal': sucursalActiva.nombre,
        });
      }
    });

    const hoja = XLSX.utils.json_to_sheet(filasDetalladas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Registro Histórico de Ventas');
    XLSX.writeFile(libro, `Reporte_Ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Modal de Detalle de Venta */}
      {ventaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Comprobante de Venta</h3>
                <p className="text-xs text-slate-500 font-mono font-bold">Folio #{ventaDetalle.numero_folio}</p>
              </div>
              <button 
                onClick={() => setVentaDetalle(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Fecha y Hora de Emisión:</span>
                <span className="font-bold text-slate-900">{formatDate(ventaDetalle.fecha_venta)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="font-semibold text-slate-800">{ventaDetalle.cliente?.nombre || 'Cliente General'}</span>
              </div>
              <div className="flex justify-between">
                <span>Medio de Pago:</span>
                <span className="font-semibold text-slate-800">{ventaDetalle.metodo_pago.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Local Comercial:</span>
                <span className="font-semibold text-slate-800">{sucursalActiva.nombre}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <span className="font-bold text-slate-700 block pb-1 border-b border-slate-200">Detalle de Productos:</span>
              {ventaDetalle.detalles?.map(d => {
                const prod = productos.find(p => p.id === d.producto_id);
                return (
                  <div key={d.id} className="flex justify-between items-center py-1">
                    <div>
                      <span className="font-semibold text-slate-900">{prod?.nombre || 'Producto'}</span>
                      <span className="text-[11px] text-slate-400 block">{d.cantidad} un. x {formatCLP(d.precio_unitario)}</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatCLP(d.subtotal)}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">Total Venta (IVA Inc.):</span>
              <span className="font-black text-blue-600 text-lg">{formatCLP(ventaDetalle.total)}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                onClick={() => setVentaDetalle(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header con botón de exportar y métricas rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Registro Histórico de Ventas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auditoría de boletas con fecha y hora exacta, desglose tributario y exportación a Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarVentasExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Ventas en Excel (.xlsx)</span>
          </button>
          <Link
            href="/ventas/nueva"
            className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#1a202c] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Nueva Venta (POS)</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Resumen Dinámico del Filtro */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Facturación Filtrada</span>
          <span className="text-lg font-black text-slate-900 block mt-0.5">{formatCLP(metricasFiltro.totalVendido)}</span>
          <span className="text-[10px] text-slate-400">{metricasFiltro.totalTransacciones} boletas emitidas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Utilidad / Ganancia Neta</span>
          <span className="text-lg font-black text-emerald-600 block mt-0.5">+{formatCLP(metricasFiltro.ganancia)}</span>
          <span className="text-[10px] text-emerald-700 font-semibold">Margen sobre ventas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Ticket Promedio</span>
          <span className="text-lg font-black text-blue-600 block mt-0.5">{formatCLP(metricasFiltro.ticketPromedio)}</span>
          <span className="text-[10px] text-slate-400">Por transacción</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Local Activo</span>
          <span className="text-sm font-black text-slate-800 block mt-1 line-clamp-1">{sucursalActiva.nombre}</span>
          <span className="text-[10px] text-emerald-600 font-bold">100% Sincronizado</span>
        </div>
      </div>

      {/* Barra de Filtros Avanzados (Fecha, Categoría, Proveedor, Método) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-900">Filtros de Búsqueda & Rango de Fechas:</span>
          </div>

          {/* Atajos Rápidos de Fecha */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => aplicarRangoFecha('hoy')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-[11px] text-slate-700 cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={() => aplicarRangoFecha('7dias')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-[11px] text-slate-700 cursor-pointer"
            >
              Últimos 7 Días
            </button>
            <button
              onClick={() => aplicarRangoFecha('mes')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-[11px] text-slate-700 cursor-pointer"
            >
              Este Mes
            </button>
            <button
              onClick={() => aplicarRangoFecha('todo')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-[11px] text-slate-500 cursor-pointer"
            >
              Ver Todo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Buscador de texto libre */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 ml-3 absolute pointer-events-none" />
            <input
              type="text"
              placeholder="Folio, Cliente o RUT..."
              value={filtroBusqueda}
              onChange={e => setFiltroBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          {/* Fecha Desde */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-[10px] font-bold text-slate-500">Desde:</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              className="w-full bg-transparent text-slate-800 font-semibold outline-none text-xs"
            />
          </div>

          {/* Fecha Hasta */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-[10px] font-bold text-slate-500">Hasta:</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              className="w-full bg-transparent text-slate-800 font-semibold outline-none text-xs"
            />
          </div>

          {/* Filtro por Categoría */}
          <select
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none font-medium"
          >
            <option value="">Todas las Categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          {/* Filtro por Proveedor */}
          <select
            value={filtroProveedor}
            onChange={e => setFiltroProveedor(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none font-medium"
          >
            <option value="">Todos los Proveedores</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Ventas con Fecha y Hora Exacta */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-700 font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Folio</th>
                <th className="px-4 py-3.5">Fecha y Hora</th>
                <th className="px-4 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">Ítems Vendidos</th>
                <th className="px-4 py-3.5">Medio de Pago</th>
                <th className="px-4 py-3.5 text-right">Total (CLP)</th>
                <th className="px-4 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No se encontraron ventas para los filtros y fechas seleccionadas.
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">
                      #{v.numero_folio}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(v.fecha_venta)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {v.cliente?.nombre || 'Cliente General'}
                      {v.cliente?.rut_identificador && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {v.cliente.rut_identificador}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                        {v.detalles?.length || 1} producto(s)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                        {v.metodo_pago.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-900 text-sm">
                      {formatCLP(v.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setVentaDetalle(v)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ver Boleta</span>
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
