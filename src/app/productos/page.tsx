'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { formatCLP, formatPercent, calculateMargin } from '@/lib/utils';
import { 
  Package, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  Barcode, 
  Boxes, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  Layers
} from 'lucide-react';
import { Producto } from '@/types/database.types';

export default function ProductosPage() {
  const { productos, categorias, proveedores, agregarProducto, actualizarProducto, eliminarProducto } = useERP();

  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [soloBajoStock, setSoloBajoStock] = useState(false);

  // Formulario nuevo producto
  const [form, setForm] = useState({
    nombre: '',
    sku: '',
    codigo_barras: '',
    categoria_id: '',
    proveedor_id: '',
    precio_compra: 0,
    precio_venta: 0,
    stock_actual: 10,
    stock_minimo: 5,
    unidad_medida: 'unidad',
    descripcion: '',
  });

  const margenCalculado = calculateMargin(form.precio_venta, form.precio_compra);

  const handleSubmitNuevo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.sku || form.precio_venta <= 0) return;

    agregarProducto({
      empresa_id: 'current',
      categoria_id: form.categoria_id || null,
      proveedor_id: form.proveedor_id || null,
      nombre: form.nombre,
      sku: form.sku.toUpperCase(),
      codigo_barras: form.codigo_barras || null,
      precio_compra: Number(form.precio_compra),
      precio_venta: Number(form.precio_venta),
      stock_actual: Number(form.stock_actual),
      stock_minimo: Number(form.stock_minimo),
      unidad_medida: form.unidad_medida,
      descripcion: form.descripcion || null,
      imagen_url: null,
      activo: true,
    });

    setModalNuevoOpen(false);
    setForm({
      nombre: '',
      sku: '',
      codigo_barras: '',
      categoria_id: '',
      proveedor_id: '',
      precio_compra: 0,
      precio_venta: 0,
      stock_actual: 10,
      stock_minimo: 5,
      unidad_medida: 'unidad',
      descripcion: '',
    });
  };

  // Exportar Catálogo a CSV
  const exportarCSV = () => {
    const encabezados = ['SKU', 'Codigo_Barras', 'Nombre', 'Categoria', 'Precio_Compra_CLP', 'Precio_Venta_CLP', 'Stock_Actual', 'Stock_Minimo'];
    const filas = productos.map(p => [
      `"${p.sku}"`,
      `"${p.codigo_barras || ''}"`,
      `"${p.nombre}"`,
      `"${categorias.find(c => c.id === p.categoria_id)?.nombre || 'General'}"`,
      p.precio_compra,
      p.precio_venta,
      p.stock_actual ?? 0,
      p.stock_minimo
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [encabezados.join(','), ...filas.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `catalogo_productos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado
  const productosFiltrados = productos.filter(p => {
    if (!p.activo) return false;
    if (soloBajoStock && (p.stock_actual ?? 0) > p.stock_minimo) return false;
    if (categoriaFiltro && p.categoria_id !== categoriaFiltro) return false;
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.codigo_barras && p.codigo_barras.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Modal Nuevo Producto */}
      {modalNuevoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Registrar Nuevo Producto</h3>
              </div>
              <button
                onClick={() => setModalNuevoOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNuevo} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Cerveza Torobayo 330cc Pack 6"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Código SKU (Interno) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CERV-TORO-01"
                    value={form.sku}
                    onChange={e => setForm({ ...form, sku: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono outline-none focus:border-blue-500 uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Código de Barras (EAN / Pistola)</label>
                  <input
                    type="text"
                    placeholder="Ej. 780461234001"
                    value={form.codigo_barras}
                    onChange={e => setForm({ ...form, codigo_barras: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Categoría</label>
                  <select
                    value={form.categoria_id}
                    onChange={e => setForm({ ...form, categoria_id: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccionar Categoría</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Proveedor</label>
                  <select
                    value={form.proveedor_id}
                    onChange={e => setForm({ ...form, proveedor_id: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccionar Proveedor</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Precio Compra Costo (CLP) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.precio_compra}
                    onChange={e => setForm({ ...form, precio_compra: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Precio Venta Público (CLP) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.precio_venta}
                    onChange={e => setForm({ ...form, precio_venta: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Margen Calculado Preview */}
                <div className="sm:col-span-2 p-3 bg-blue-50 rounded-xl border border-blue-200 flex justify-between items-center text-xs">
                  <span className="font-semibold text-blue-900">Margen Bruto Proyectado:</span>
                  <span className="font-bold text-blue-700 text-sm">
                    {formatPercent(margenCalculado)} ({formatCLP(form.precio_venta - form.precio_compra)} de ganancia)
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Stock Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock_actual}
                    onChange={e => setForm({ ...form, stock_actual: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Stock Mínimo (Alerta) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.stock_minimo}
                    onChange={e => setForm({ ...form, stock_minimo: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevoOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-md shadow-blue-500/20"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header de la Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Catálogo de Productos</h2>
            <p className="text-xs text-slate-500">Gestión de SKUs, códigos de barras, precios y control de existencias.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setModalNuevoOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-slate-400 ml-2 absolute" />
          <input
            type="text"
            placeholder="Buscar por Nombre, SKU o Código de barras..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={categoriaFiltro}
          onChange={e => setCategoriaFiltro(e.target.value)}
          className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
        >
          <option value="">Todas las Categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <button
          onClick={() => setSoloBajoStock(!soloBajoStock)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold border transition-all ${
            soloBajoStock 
              ? 'bg-amber-100 text-amber-800 border-amber-300' 
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Solo Stock Bajo</span>
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5">SKU / Código</th>
                <th className="px-4 py-3.5">Producto</th>
                <th className="px-4 py-3.5">Categoría</th>
                <th className="px-4 py-3.5 text-right">P. Compra</th>
                <th className="px-4 py-3.5 text-right">P. Venta</th>
                <th className="px-4 py-3.5 text-center">Margen</th>
                <th className="px-4 py-3.5 text-center">Stock Actual</th>
                <th className="px-4 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron productos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((p) => {
                  const stock = p.stock_actual ?? 0;
                  const esBajoStock = stock <= p.stock_minimo;
                  const cat = categorias.find(c => c.id === p.categoria_id);
                  const margen = calculateMargin(p.precio_venta, p.precio_compra);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono">
                        <span className="font-bold text-slate-900 block">{p.sku}</span>
                        {p.codigo_barras && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Barcode className="w-3 h-3" /> {p.codigo_barras}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 max-w-[220px]">
                        {p.nombre}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {cat?.nombre || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-medium">
                        {formatCLP(p.precio_compra)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatCLP(p.precio_venta)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                          {formatPercent(margen)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          stock === 0 
                            ? 'bg-rose-100 text-rose-700' 
                            : esBajoStock 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {stock} {p.unidad_medida}s
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => eliminarProducto(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Desactivar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
