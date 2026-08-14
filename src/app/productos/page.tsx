'use client';

import React, { useState, useEffect } from 'react';
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
  Layers,
  FolderPlus,
  Sparkles
} from 'lucide-react';
import { Producto } from '@/types/database.types';

export default function ProductosPage() {
  const { 
    productos, 
    categorias, 
    proveedores, 
    generarSiguienteSKU, 
    agregarProducto, 
    actualizarProducto, 
    eliminarProducto,
    agregarCategoria 
  } = useERP();

  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalNuevaCatOpen, setModalNuevaCatOpen] = useState(false);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  
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
    stock_actual: 15,
    stock_minimo: 5,
    stock_maximo: 50,
    unidad_medida: 'unidad',
    descripcion: '',
  });

  // Al abrir el modal, auto-generar el siguiente SKU correlativo
  useEffect(() => {
    if (modalNuevoOpen) {
      setForm(prev => ({
        ...prev,
        sku: generarSiguienteSKU(),
        categoria_id: categorias[0]?.id || '',
      }));
    }
  }, [modalNuevoOpen, generarSiguienteSKU, categorias]);

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
      stock_actual: 15,
      stock_minimo: 5,
      stock_maximo: 50,
      unidad_medida: 'unidad',
      descripcion: '',
    });
  };

  const handleCrearCategoriaRapida = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCatNombre.trim()) return;
    agregarCategoria({
      empresa_id: 'current',
      nombre: nuevaCatNombre.trim(),
      descripcion: 'Categoría personalizada',
      activo: true,
    });
    setNuevaCatNombre('');
    setModalNuevaCatOpen(false);
  };

  // Exportar Catálogo a CSV
  const exportarCSV = () => {
    const encabezados = ['SKU', 'Codigo_Barras', 'Nombre', 'Categoria', 'Precio_Compra_Unitario_CLP', 'Precio_Venta_Unitario_CLP', 'Stock_Actual', 'Stock_Minimo'];
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
      {/* Modal Rápido: Nueva Categoría */}
      {modalNuevaCatOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-blue-600" />
                <span>Nueva Categoría de Producto</span>
              </h4>
              <button onClick={() => setModalNuevaCatOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCrearCategoriaRapida} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Congelados, Panadería, Limpieza..."
                  value={nuevaCatNombre}
                  onChange={e => setNuevaCatNombre(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNuevaCatOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    placeholder="Ej. Bebida Cola 1.5L o Arroz Grano Largo 1kg"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Código SKU Interno *</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Autoincrementable
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={e => setForm({ ...form, sku: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold outline-none focus:border-blue-500 uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Código de Barras (EAN / Pistola)</label>
                  <input
                    type="text"
                    placeholder="Ej. 780123456789 (o pistolear)"
                    value={form.codigo_barras}
                    onChange={e => setForm({ ...form, codigo_barras: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono outline-none focus:border-blue-500"
                  />
                </div>

                {/* Categoría con botón inline de añadir */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Categoría</label>
                    <button
                      type="button"
                      onClick={() => setModalNuevaCatOpen(true)}
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Nueva Categoría
                    </button>
                  </div>
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

                {/* Precios Unitarios Claros */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Precio de Compra Costo Unitario (CLP) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Costo por 1 unidad"
                    value={form.precio_compra}
                    onChange={e => setForm({ ...form, precio_compra: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Precio de Venta Público Unitario (CLP) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Precio venta por 1 unidad"
                    value={form.precio_venta}
                    onChange={e => setForm({ ...form, precio_venta: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Margen Calculado Preview */}
                <div className="sm:col-span-2 p-3 bg-blue-50 rounded-xl border border-blue-200 flex justify-between items-center text-xs">
                  <span className="font-semibold text-blue-900">Margen Bruto Proyectado Unitario:</span>
                  <span className="font-bold text-blue-700 text-sm">
                    {formatPercent(margenCalculado)} ({formatCLP(form.precio_venta - form.precio_compra)} de ganancia por unidad)
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Stock Inicial (Primer Pedido) *</label>
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
                  <label className="font-bold text-slate-700">Stock Máximo Inicial (Decidido por Dueño) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.stock_maximo}
                    onChange={e => setForm({ ...form, stock_maximo: Number(e.target.value) })}
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
            <p className="text-xs text-slate-500">Gestión de SKUs automáticos, precios de compra y venta unitarios y control de inventario.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalNuevaCatOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-600" />
            <span>+ Categoría</span>
          </button>
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
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
            placeholder="Buscar por Nombre, SKU correlativo o Código de barras..."
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
          <option value="">Todas las Categorías ({categorias.length})</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <button
          onClick={() => setSoloBajoStock(!soloBajoStock)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold border transition-all cursor-pointer ${
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
                <th className="px-4 py-3.5 text-right">P. Compra Unit.</th>
                <th className="px-4 py-3.5 text-right">P. Venta Unit.</th>
                <th className="px-4 py-3.5 text-center">Margen Unit.</th>
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
