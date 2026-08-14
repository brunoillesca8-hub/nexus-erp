'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Percent,
  CheckSquare,
  Square
} from 'lucide-react';
import { Producto } from '@/types/database.types';
import Link from 'next/link';
import * as XLSX from 'xlsx';

type SortField = 'sku' | 'nombre' | 'categoria' | 'precio_compra' | 'precio_venta' | 'margen' | 'stock_actual';
type SortOrder = 'asc' | 'desc';

export default function ProductosPage() {
  const { 
    productos, 
    categorias, 
    proveedores, 
    generarSiguienteSKU, 
    agregarProducto, 
    actualizarProducto, 
    eliminarProducto,
    agregarCategoria,
    ajustarStock,
    mostrarNotificacion
  } = useERP();

  // Modales
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  const [modalNuevaCatOpen, setModalNuevaCatOpen] = useState(false);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [modalAjusteMasivoOpen, setModalAjusteMasivoOpen] = useState(false);
  const [porcentajeAjuste, setPorcentajeAjuste] = useState<number>(5);

  // Modal de Recepción Rápida de Mercadería por Código de Barras
  const [modalRecepcionOpen, setModalRecepcionOpen] = useState(false);
  const [productoRecepcion, setProductoRecepcion] = useState<Producto | null>(null);
  const [cantidadRecepcion, setCantidadRecepcion] = useState<number>(12);
  const [motivoRecepcion, setMotivoRecepcion] = useState<string>('Recepción de Factura / Ingreso');

  // Modal de Escáner Rápido por Código
  const [modalEscanearRapidoOpen, setModalEscanearRapidoOpen] = useState(false);
  const [codigoInputManual, setCodigoInputManual] = useState('');

  // Filtros & Búsqueda predictiva
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [estadoStockFiltro, setEstadoStockFiltro] = useState<'todos' | 'bajo' | 'agotado' | 'optimo'>('todos');

  // Ordenamiento interactivo
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  // Selección múltiple para acciones masivas
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  // Formulario nuevo / editar
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
    unidad_medida: 'u.',
    descripcion: '',
  });

  // Al abrir el modal nuevo, auto-generar SKU correlativo
  useEffect(() => {
    if (modalNuevoOpen) {
      setForm({
        nombre: '',
        sku: generarSiguienteSKU(),
        codigo_barras: '',
        categoria_id: categorias[0]?.id || '',
        proveedor_id: '',
        precio_compra: 0,
        precio_venta: 0,
        stock_actual: 15,
        stock_minimo: 5,
        stock_maximo: 50,
        unidad_medida: 'u.',
        descripcion: '',
      });
    }
  }, [modalNuevoOpen, generarSiguienteSKU, categorias]);

  // Al seleccionar producto para editar
  const handleAbrirEditar = (prod: Producto) => {
    setProductoAEditar(prod);
    setForm({
      nombre: prod.nombre,
      sku: prod.sku,
      codigo_barras: prod.codigo_barras || '',
      categoria_id: prod.categoria_id || '',
      proveedor_id: prod.proveedor_id || '',
      precio_compra: prod.precio_compra,
      precio_venta: prod.precio_venta,
      stock_actual: prod.stock_actual ?? 0,
      stock_minimo: prod.stock_minimo,
      stock_maximo: 50,
      unidad_medida: prod.unidad_medida || 'u.',
      descripcion: prod.descripcion || '',
    });
    setModalEditarOpen(true);
  };

  // Procesar escaneo de código de barras para Recepción o Registro
  const procesarEscaneoMercaderia = (codigo: string) => {
    const codeTrim = codigo.trim().toLowerCase();
    const prodExistente = productos.find(p => {
      const matchBarcode = p.codigo_barras && p.codigo_barras.toLowerCase() === codeTrim;
      const matchSku = p.sku && p.sku.toLowerCase() === codeTrim;
      const matchSkuNum = p.sku && p.sku.replace(/\D/g, '') === codeTrim;
      return matchBarcode || matchSku || matchSkuNum;
    });

    if (prodExistente) {
      // Caso A: El producto YA existe -> Abre modal para sumar unidades
      setProductoRecepcion(prodExistente);
      setCantidadRecepcion(12);
      setMotivoRecepcion('Recepción de Factura / Ingreso de Mercadería');
      setModalRecepcionOpen(true);
      mostrarNotificacion(`Producto identificado: "${prodExistente.nombre}". Ingresa las unidades recibidas.`, 'info');
    } else {
      // Caso B: El producto es NUEVO -> Abre modal para crearlo con el código ya puesto
      setForm({
        nombre: '',
        sku: generarSiguienteSKU(),
        codigo_barras: codigo.trim(),
        categoria_id: categorias[0]?.id || '',
        proveedor_id: '',
        precio_compra: 0,
        precio_venta: 0,
        stock_actual: 12,
        stock_minimo: 5,
        stock_maximo: 50,
        unidad_medida: 'u.',
        descripcion: 'Ingresado por escaneo de código',
      });
      setModalNuevoOpen(true);
      mostrarNotificacion(`Código nuevo detectado (${codigo}). Completa los datos para registrarlo.`, 'info');
    }
  };

  // Listener global de pistola lectora / app móvil (Barcode to PC)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Enter' || e.key === 'Tab') {
        const textoAProcesar = (isInput && (target as HTMLInputElement).value) 
          ? (target as HTMLInputElement).value.trim() 
          : buffer.trim();

        if (textoAProcesar.length >= 2) {
          procesarEscaneoMercaderia(textoAProcesar);
          buffer = '';
          if (isInput && target.id !== 'search-products-input') (target as HTMLInputElement).value = '';
          e.preventDefault();
        }
        buffer = '';
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 500) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer += e.key;
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const pasted = e.clipboardData?.getData('text');
      if (pasted && pasted.trim().length >= 2) {
        procesarEscaneoMercaderia(pasted.trim());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [productos, categorias, generarSiguienteSKU]);

  const handleSubmitRecepcion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoRecepcion || cantidadRecepcion <= 0) return;

    ajustarStock(productoRecepcion.id, cantidadRecepcion, motivoRecepcion || 'Recepción de Mercadería', 'ENTRADA_COMPRA');
    setModalRecepcionOpen(false);
    setProductoRecepcion(null);
    mostrarNotificacion(`¡Se agregaron +${cantidadRecepcion} unidades a "${productoRecepcion.nombre}"!`, 'success');
  };

  const margenCalculado = calculateMargin(form.precio_venta, form.precio_compra);
  const markupCalculado = form.precio_compra > 0 
    ? ((form.precio_venta - form.precio_compra) / form.precio_compra) * 100 
    : 0;

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
  };

  const handleSubmitEditar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoAEditar || !form.nombre || form.precio_venta <= 0) return;

    actualizarProducto(productoAEditar.id, {
      nombre: form.nombre,
      codigo_barras: form.codigo_barras || null,
      categoria_id: form.categoria_id || null,
      proveedor_id: form.proveedor_id || null,
      precio_compra: Number(form.precio_compra),
      precio_venta: Number(form.precio_venta),
      stock_actual: Number(form.stock_actual),
      stock_minimo: Number(form.stock_minimo),
      unidad_medida: form.unidad_medida,
      descripcion: form.descripcion || null,
    });

    setModalEditarOpen(false);
    setProductoAEditar(null);
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

  // Manejo de ordenamiento interactivo
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtro y Búsqueda predictiva
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      if (!p.activo) return false;

      // Filtro por stock
      const stock = p.stock_actual ?? 0;
      if (estadoStockFiltro === 'bajo' && stock > p.stock_minimo) return false;
      if (estadoStockFiltro === 'agotado' && stock > 0) return false;
      if (estadoStockFiltro === 'optimo' && (stock <= p.stock_minimo || stock === 0)) return false;

      // Filtro por categoría
      if (categoriaFiltro && p.categoria_id !== categoriaFiltro) return false;

      // Búsqueda por texto libre (nombre, SKU o código de barras)
      const q = busqueda.toLowerCase().trim();
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.codigo_barras && p.codigo_barras.includes(q))
      );
    });
  }, [productos, busqueda, categoriaFiltro, estadoStockFiltro]);

  // Ordenamiento
  const productosOrdenados = useMemo(() => {
    return [...productosFiltrados].sort((a, b) => {
      let aVal: any = a[sortField as keyof Producto];
      let bVal: any = b[sortField as keyof Producto];

      if (sortField === 'categoria') {
        aVal = categorias.find(c => c.id === a.categoria_id)?.nombre || '';
        bVal = categorias.find(c => c.id === b.categoria_id)?.nombre || '';
      } else if (sortField === 'margen') {
        aVal = calculateMargin(a.precio_venta, a.precio_compra);
        bVal = calculateMargin(b.precio_venta, b.precio_compra);
      } else if (sortField === 'stock_actual') {
        aVal = a.stock_actual ?? 0;
        bVal = b.stock_actual ?? 0;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal as string) 
          : (bVal as string).localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal - bVal) : (bVal - aVal);
    });
  }, [productosFiltrados, sortField, sortOrder, categorias]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(productosOrdenados.length / filasPorPagina));
  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPagina;
    return productosOrdenados.slice(inicio, inicio + filasPorPagina);
  }, [productosOrdenados, paginaActual, filasPorPagina]);

  // Manejo de Selección Múltiple
  const handleToggleSeleccionarTodos = () => {
    if (seleccionados.length === productosPaginados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(productosPaginados.map(p => p.id));
    }
  };

  const handleToggleSeleccionarUno = (id: string) => {
    setSeleccionados(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Ajuste de Precios Masivo %
  const handleAplicarAjusteMasivo = () => {
    if (seleccionados.length === 0 || porcentajeAjuste === 0) return;
    const factor = 1 + (porcentajeAjuste / 100);

    seleccionados.forEach(id => {
      const prod = productos.find(p => p.id === id);
      if (prod) {
        const nuevoPrecio = Math.round(prod.precio_venta * factor);
        actualizarProducto(id, { precio_venta: nuevoPrecio });
      }
    });

    mostrarNotificacion(`Se actualizó el precio de ${seleccionados.length} productos en un ${porcentajeAjuste}%.`, 'success');
    setModalAjusteMasivoOpen(false);
    setSeleccionados([]);
  };

  // Exportar a Excel (.xlsx)
  const exportarExcel = () => {
    const filasParaExportar = (seleccionados.length > 0 
      ? productos.filter(p => seleccionados.includes(p.id)) 
      : productosOrdenados
    ).map((p, idx) => {
      const cat = categorias.find(c => c.id === p.categoria_id)?.nombre || 'General';
      const margen = calculateMargin(p.precio_venta, p.precio_compra);
      return {
        '#': idx + 1,
        'SKU Interno': p.sku,
        'Código EAN-13': p.codigo_barras || '',
        'Nombre Producto': p.nombre,
        'Categoría': cat,
        'P. Compra Unit. (Neto)': p.precio_compra,
        'P. Venta Unit. (Inc. IVA)': p.precio_venta,
        'Margen Unit. (%)': `${margen.toFixed(1)}%`,
        'Stock Actual': `${p.stock_actual ?? 0} ${p.unidad_medida || 'u.'}`,
        'Stock Mínimo': p.stock_minimo,
      };
    });

    const hoja = XLSX.utils.json_to_sheet(filasParaExportar);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Catálogo de Productos');
    XLSX.writeFile(libro, `Catalogo_Productos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Helper de icono de ordenamiento
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 inline ml-1 opacity-70" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-slate-900 inline ml-1 font-bold" />
      : <ArrowDown className="w-3 h-3 text-slate-900 inline ml-1 font-bold" />;
  };

  return (
    <div className="space-y-5">
      {/* Modal Ajuste Masivo de Precios */}
      {modalAjusteMasivoOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-600" />
                <span>Ajuste Masivo de Precios</span>
              </h4>
              <button onClick={() => setModalAjusteMasivoOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Aplica una variación porcentual al precio de venta de los <strong>{seleccionados.length} productos seleccionados</strong>.
            </p>
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Variación Porcentual (%)</label>
              <input
                type="number"
                step="0.5"
                placeholder="Ej. 5 para +5%, -10 para descuento del 10%"
                value={porcentajeAjuste}
                onChange={e => setPorcentajeAjuste(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalAjusteMasivoOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAplicarAjusteMasivo}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Aplicar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal Recepción Rápida de Stock (Código de Barras Existente) */}
      {modalRecepcionOpen && productoRecepcion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Recepción de Mercadería</h3>
                  <p className="text-[11px] text-slate-500">Producto ya registrado en el catálogo</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalRecepcionOpen(false);
                  setProductoRecepcion(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-black text-slate-900 text-sm block">{productoRecepcion.nombre}</span>
              <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px] pt-1">
                <div>SKU: <strong className="text-slate-900">#{productoRecepcion.sku.replace(/\D/g, '') || productoRecepcion.sku}</strong></div>
                <div>EAN: <strong className="text-slate-900">{productoRecepcion.codigo_barras || 'N/A'}</strong></div>
                <div>Stock Actual: <strong className="text-blue-700">{productoRecepcion.stock_actual ?? 0} {productoRecepcion.unidad_medida || 'u.'}</strong></div>
                <div>P. Venta: <strong className="text-slate-900">{formatCLP(productoRecepcion.precio_venta)}</strong></div>
              </div>
            </div>

            <form onSubmit={handleSubmitRecepcion} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Unidades que Ingresan / Llegaron *</label>
                <input
                  type="number"
                  min="1"
                  autoFocus
                  required
                  value={cantidadRecepcion}
                  onChange={e => setCantidadRecepcion(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border-2 border-emerald-500 rounded-xl text-slate-900 text-sm font-black outline-none"
                />
                <span className="text-[10px] text-slate-400">
                  Nuevo stock total resultante: <strong className="text-emerald-700 font-bold">{(productoRecepcion.stock_actual ?? 0) + cantidadRecepcion} {productoRecepcion.unidad_medida || 'u.'}</strong>
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Factura de Compra / Observación *</label>
                <input
                  type="text"
                  required
                  value={motivoRecepcion}
                  onChange={e => setMotivoRecepcion(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalRecepcionOpen(false);
                    setProductoRecepcion(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-md text-xs cursor-pointer"
                >
                  + Sumar al Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Escáner Rápido / Ingreso Manual de Código */}
      {modalEscanearRapidoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Escanear / Pistolear Mercadería</h3>
              </div>
              <button
                onClick={() => setModalEscanearRapidoOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Dispara tu pistola lectora o escribe el código de barras / SKU para recepcionar stock o crear un producto nuevo.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!codigoInputManual.trim()) return;
                procesarEscaneoMercaderia(codigoInputManual.trim());
                setCodigoInputManual('');
                setModalEscanearRapidoOpen(false);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                autoFocus
                required
                placeholder="Ej. 780000000317 o SKU..."
                value={codigoInputManual}
                onChange={e => setCodigoInputManual(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalEscanearRapidoOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  Procesar Código
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar / Editar Producto */}
      {(modalNuevoOpen || modalEditarOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {modalEditarOpen ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setModalNuevoOpen(false);
                  setModalEditarOpen(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={modalEditarOpen ? handleSubmitEditar : handleSubmitNuevo} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bebida Cola 1.5L o Arroz Grano Largo 1kg"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Código SKU Interno *</span>
                    {!modalEditarOpen && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Autoincrementable
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={modalEditarOpen}
                    value={form.sku}
                    onChange={e => setForm({ ...form, sku: e.target.value })}
                    className={`w-full p-2.5 rounded-xl text-slate-900 font-mono font-bold outline-none uppercase ${
                      modalEditarOpen ? 'bg-slate-100 border border-slate-200 cursor-not-allowed' : 'bg-slate-50 border border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Código EAN-13 / Barra</label>
                  <input
                    type="text"
                    placeholder="Ej. 780123456789 (o pistolear)"
                    value={form.codigo_barras}
                    onChange={e => setForm({ ...form, codigo_barras: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono outline-none focus:border-blue-500"
                  />
                </div>

                {/* Categoría */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Categoría</label>
                    <button
                      type="button"
                      onClick={() => setModalNuevaCatOpen(true)}
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Nueva
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

                {/* Unidad de medida */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Unidad de Medida *</label>
                  <select
                    value={form.unidad_medida}
                    onChange={e => setForm({ ...form, unidad_medida: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="u.">Unidad (u.)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="lts">Litros (lts)</option>
                    <option value="pack">Pack / Caja</option>
                    <option value="mt">Metros (mt)</option>
                  </select>
                </div>

                {/* Precios Unitarios Claros */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">P. Compra Unit. (Neto) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Costo neto unitario"
                    value={form.precio_compra}
                    onChange={e => setForm({ ...form, precio_compra: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">P. Venta Unit. (Inc. 19% IVA) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Precio venta final"
                    value={form.precio_venta}
                    onChange={e => setForm({ ...form, precio_venta: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                {/* Desglose de Margen y Markup */}
                <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Margen sobre Venta:</span>
                    <strong className="text-blue-700 text-sm font-black">{formatPercent(margenCalculado)}</strong>
                    <span className="text-[10px] text-slate-400 block font-mono">(Pv - Pc)/Pv</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Markup sobre Costo:</span>
                    <strong className="text-emerald-700 text-sm font-black">{formatPercent(markupCalculado)}</strong>
                    <span className="text-[10px] text-slate-400 block font-mono">(Pv - Pc)/Pc</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Stock Actual ({form.unidad_medida}) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock_actual}
                    onChange={e => setForm({ ...form, stock_actual: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Stock Mínimo (Alerta ROP) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock_minimo}
                    onChange={e => setForm({ ...form, stock_minimo: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalNuevoOpen(false);
                    setModalEditarOpen(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#2d3748] hover:bg-[#1a202c] font-bold text-white shadow-md text-xs"
                >
                  {modalEditarOpen ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Encabezado Principal estilo Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestión Centralizada de Productos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Catálogo de productos único de la tienda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {seleccionados.length > 0 && (
            <button
              onClick={() => setModalAjusteMasivoOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Ajustar {seleccionados.length} Precios</span>
            </button>
          )}
          <button
            onClick={() => setModalEscanearRapidoOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Escanear o ingresar código de barras de mercadería entrante"
          >
            <Barcode className="w-4 h-4" />
            <span>Recepción Mercadería</span>
          </button>
          <button
            onClick={() => setModalNuevoOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#1a202c] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtro de Categoría estilo Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 ml-3.5 absolute pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por SKU, Nombre o Código EAN-13"
            value={busqueda}
            onChange={e => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 shadow-2xs font-medium"
          />
        </div>

        <div className="sm:col-span-4 flex gap-2">
          <select
            value={categoriaFiltro}
            onChange={e => {
              setCategoriaFiltro(e.target.value);
              setPaginaActual(1);
            }}
            className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-slate-400 shadow-2xs font-medium cursor-pointer"
          >
            <option value="">Filtrar categoría</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <select
            value={estadoStockFiltro}
            onChange={e => {
              setEstadoStockFiltro(e.target.value as any);
              setPaginaActual(1);
            }}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-slate-400 shadow-2xs font-medium cursor-pointer"
          >
            <option value="todos">Stock: Todos</option>
            <option value="bajo">Stock Crítico</option>
            <option value="agotado">Agotados (0)</option>
            <option value="optimo">Óptimos</option>
          </select>
        </div>
      </div>

      {/* Tabla de Productos Estilo Screenshot con Sorting Interactivo */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-700 font-bold text-xs border-b border-slate-200 select-none">
              <tr>
                <th className="px-3 py-3 w-8 text-center">
                  <button 
                    onClick={handleToggleSeleccionarTodos}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    {seleccionados.length > 0 && seleccionados.length === productosPaginados.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th 
                  onClick={() => handleSort('sku')} 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>SKU (Inter.) / EAN-13</span>
                    {renderSortIcon('sku')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('nombre')} 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Producto</span>
                    {renderSortIcon('nombre')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('categoria')} 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Categoría</span>
                    {renderSortIcon('categoria')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('precio_compra')} 
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>P. Compra Unit. (Neto)</span>
                    {renderSortIcon('precio_compra')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('precio_venta')} 
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>P. Venta Unit. (Inc. IVA)</span>
                    {renderSortIcon('precio_venta')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('margen')} 
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Margen Unit. (%)</span>
                    {renderSortIcon('margen')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('stock_actual')} 
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Stock Actual</span>
                    {renderSortIcon('stock_actual')}
                  </div>
                </th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {productosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    No se encontraron productos coincidentes con los filtros.
                  </td>
                </tr>
              ) : (
                productosPaginados.map((p) => {
                  const stock = p.stock_actual ?? 0;
                  const esAgotado = stock === 0;
                  const esCritico = stock > 0 && stock <= p.stock_minimo;
                  const cat = categorias.find(c => c.id === p.categoria_id);
                  const margen = calculateMargin(p.precio_venta, p.precio_compra);
                  const estaSeleccionado = seleccionados.includes(p.id);
                  const unidad = p.unidad_medida || 'u.';

                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        estaSeleccionado ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleToggleSeleccionarUno(p.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {estaSeleccionado ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        <span>{p.sku.replace(/\D/g, '') || p.sku}</span>
                        {p.codigo_barras && (
                          <span className="block text-[10px] text-slate-400 font-normal">{p.codigo_barras}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 max-w-[240px]">
                        {p.nombre}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {cat?.nombre || 'General'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-600">
                        {formatCLP(p.precio_compra)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatCLP(p.precio_venta)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-slate-700">
                          {margen.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          esAgotado 
                            ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[11px]' 
                            : esCritico 
                            ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px]' 
                            : 'text-slate-900'
                        }`}>
                          {stock} {unidad}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleAbrirEditar(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Editar</span>
                          </button>
                          <Link
                            href="/inventario"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            <Boxes className="w-3 h-3 text-slate-500" />
                            <span>Ver Kardex</span>
                          </Link>
                          <button
                            onClick={() => eliminarProducto(p.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Desactivar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de Paginación y Exportación idéntico al Screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-[#f8fafc] border-t border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold">
              Página {paginaActual} de {totalPaginas} ({productosOrdenados.length} productos en total)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                disabled={paginaActual === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Filas:</span>
              <select
                value={filasPorPagina}
                onChange={e => {
                  setFilasPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 outline-none"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <button
              onClick={exportarExcel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2d3748] hover:bg-[#1a202c] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar a Excel (CSV)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
