'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useERP } from '@/context/erp-context';
import { formatCLP } from '@/lib/utils';
import { VentaItem, MetodoPagoTipo, Cliente } from '@/types/database.types';
import { 
  Barcode, 
  Camera, 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle, 
  User, 
  CreditCard, 
  Banknote, 
  ArrowRight,
  Printer,
  Sparkles,
  AlertTriangle,
  Receipt,
  X,
  Package,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import dynamic from 'next/dynamic';

const BarcodeScannerModal = dynamic(
  () => import('@/components/pos/BarcodeScannerModal').then((mod) => mod.BarcodeScannerModal),
  { ssr: false }
);

export default function NuevaVentaPage() {
  const { productos, clientes, categorias, procesarVenta, sucursalActiva, empresa, mostrarNotificacion } = useERP();

  // Estado del Carrito
  const [carrito, setCarrito] = useState<VentaItem[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<MetodoPagoTipo>('EFECTIVO');
  const [descuentoGlobal, setDescuentoGlobal] = useState<number>(0);
  const [notas, setNotas] = useState<string>('');

  // Búsqueda y Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const [ventaExitosa, setVentaExitosa] = useState<{ ventaId: string; folio: number; total: number } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Escáner de lector USB/Bluetooth y Apps de Celular WiFi (Barcode to PC)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Si presiona Enter en cualquier parte (incluso dentro de un input)
      if (e.key === 'Enter' || e.key === 'Tab') {
        const textoAProcesar = (isInput && (target as HTMLInputElement).value) 
          ? (target as HTMLInputElement).value.trim() 
          : buffer.trim();

        if (textoAProcesar.length >= 2) {
          const encontrado = handleBarcodeScanned(textoAProcesar);
          if (encontrado) {
            buffer = '';
            if (isInput) (target as HTMLInputElement).value = '';
            e.preventDefault();
            return;
          }
        }
        buffer = '';
        return;
      }

      const currentTime = Date.now();
      // Tolerancia amplia de 500ms para latencia de red Wi-Fi de apps móviles
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
        handleBarcodeScanned(pasted.trim());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [productos, carrito]);

  // Manejar escaneo (desde USB o desde Cámara)
  const handleBarcodeScanned = (code: string) => {
    const codeTrim = code.trim().toLowerCase();
    const prod = productos.find(p => {
      const matchBarcode = p.codigo_barras && p.codigo_barras.toLowerCase() === codeTrim;
      const matchSku = p.sku && p.sku.toLowerCase() === codeTrim;
      const matchSkuNum = p.sku && p.sku.replace(/\D/g, '') === codeTrim;
      return matchBarcode || matchSku || matchSkuNum;
    });

    if (!prod) {
      mostrarNotificacion(`Código "${code}" no encontrado en el catálogo.`, 'error');
      return false;
    }

    agregarAlCarrito(prod.id);
    return true;
  };

  // Agregar producto al carrito respetando la REGLA DE STOCK > 0
  const agregarAlCarrito = (productoId: string) => {
    const prod = productos.find(p => p.id === productoId);
    if (!prod) return;

    const stockDisponible = prod.stock_actual ?? 0;

    // REGLA: Si stock es cero -> BLOQUEO ESTRICTO
    if (stockDisponible <= 0) {
      mostrarNotificacion(`¡El producto "${prod.nombre}" no tiene stock disponible!`, 'error');
      return;
    }

    setCarrito(prev => {
      const itemExistente = prev.find(item => item.producto_id === productoId);

      if (itemExistente) {
        if (itemExistente.cantidad >= stockDisponible) {
          mostrarNotificacion(`Stock máximo alcanzado (${stockDisponible} unidades disponibles).`, 'error');
          return prev;
        }

        return prev.map(item => {
          if (item.producto_id === productoId) {
            const nuevaCantidad = item.cantidad + 1;
            return {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: (item.precio_unitario * nuevaCantidad) - item.descuento,
            };
          }
          return item;
        });
      }

      // Nuevo item en carrito
      const nuevoItem: VentaItem = {
        producto_id: prod.id,
        nombre: prod.nombre,
        sku: prod.sku.replace(/\D/g, '') || prod.sku,
        codigo_barras: prod.codigo_barras,
        cantidad: 1,
        precio_unitario: prod.precio_venta,
        costo_unitario: prod.precio_compra,
        descuento: 0,
        subtotal: prod.precio_venta,
        stock_disponible: stockDisponible,
      };

      mostrarNotificacion(`"${prod.nombre}" agregado.`, 'info');
      return [...prev, nuevoItem];
    });
  };

  // Modificar cantidad
  const cambiarCantidad = (productoId: string, delta: number) => {
    const prod = productos.find(p => p.id === productoId);
    const stockMax = prod?.stock_actual ?? 0;

    setCarrito(prev => prev.map(item => {
      if (item.producto_id === productoId) {
        const nuevaCant = item.cantidad + delta;
        if (nuevaCant <= 0) return null as any;
        if (nuevaCant > stockMax) {
          mostrarNotificacion(`Stock máximo alcanzado (${stockMax} unidades).`, 'error');
          return item;
        }
        return {
          ...item,
          cantidad: nuevaCant,
          subtotal: (item.precio_unitario * nuevaCant) - item.descuento,
        };
      }
      return item;
    }).filter(Boolean));
  };

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(prev => prev.filter(i => i.producto_id !== productoId));
  };

  // Cálculos totales en Pesos Chilenos (CLP)
  const subtotalNeto = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const totalFinal = Math.max(0, subtotalNeto - descuentoGlobal);
  const ivaEstimado = Math.round((totalFinal * (empresa.iva_porcentaje || 19)) / (100 + (empresa.iva_porcentaje || 19)));

  // Confirmar Venta Atómica
  const handleConfirmarVenta = () => {
    if (carrito.length === 0) {
      mostrarNotificacion('El carrito de venta está vacío.', 'error');
      return;
    }

    const res = procesarVenta({
      clienteId: clienteSeleccionado || null,
      items: carrito,
      subtotal: subtotalNeto,
      descuento: descuentoGlobal,
      impuesto: ivaEstimado,
      total: totalFinal,
      metodoPago,
      notas,
    });

    if (res.success && res.ventaId && res.folio) {
      // Lanzar confeti celebratorio
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      setVentaExitosa({
        ventaId: res.ventaId,
        folio: res.folio,
        total: totalFinal,
      });

      // Limpiar carrito
      setCarrito([]);
      setDescuentoGlobal(0);
      setNotas('');
    }
  };

  // BÚSQUEDA PREDICTIVA MULTIPALABRA Y SIN ACENTOS
  const normalizarTexto = (str: string) => {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  };

  const productosFiltrados = useMemo(() => {
    const queryNorm = normalizarTexto(busqueda);
    const palabrasQuery = queryNorm.split(/\s+/).filter(Boolean);

    return productos.filter(p => {
      if (!p.activo) return false;
      if (categoriaFiltro && p.categoria_id !== categoriaFiltro) return false;
      if (palabrasQuery.length === 0) return true;

      const skuNum = p.sku.replace(/\D/g, '');
      const textoCompleto = normalizarTexto(
        `${p.nombre} ${p.sku} ${skuNum} ${p.codigo_barras || ''}`
      );

      // Todas las palabras escritas deben coincidir parcialmente
      return palabrasQuery.every(palabra => textoCompleto.includes(palabra));
    });
  }, [productos, busqueda, categoriaFiltro]);

  return (
    <div className="space-y-4">
      {/* Modal de Escaneo con Cámara de Celular / Webcam */}
      <BarcodeScannerModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onScanSuccess={(code) => {
          handleBarcodeScanned(code);
          setCameraModalOpen(false);
        }}
      />

      {/* Modal de Comprobante / Venta Exitosa */}
      {ventaExitosa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">¡Venta Confirmada!</h3>
              <p className="text-xs text-slate-500 mt-1">Folio N° <strong>#{ventaExitosa.folio}</strong></p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Pagado:</span>
                <span className="font-bold text-slate-900">{formatCLP(ventaExitosa.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Método de Pago:</span>
                <span className="font-semibold text-slate-800">{metodoPago.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Local:</span>
                <span className="font-semibold text-slate-800">{sucursalActiva.nombre}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer text-slate-700"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
              <button
                onClick={() => setVentaExitosa(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-xs text-white cursor-pointer"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Principal del POS (Izquierda: Catálogo / Derecha: Carrito Comprimido) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* PANEL IZQUIERDO: Búsqueda y Grilla de Productos (7 columnas) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Barra de Búsqueda Predictiva + Botón Escáner Cámara */}
          <div className="flex gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 ml-3 absolute pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar por Nombre (ej: aceit veg), SKU (1001) o Código EAN..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-slate-400 font-medium shadow-2xs"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={categoriaFiltro}
              onChange={e => setCategoriaFiltro(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none shadow-2xs"
            >
              <option value="">Todas las Categorías</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>

            <button
              onClick={() => setCameraModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2d3748] hover:bg-[#1a202c] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              title="Abrir cámara para escanear código"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Escanear</span>
            </button>
          </div>

          {/* Grilla de Productos */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs min-h-[460px] max-h-[620px] overflow-y-auto">
            {productosFiltrados.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                <Package className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No se encontraron productos coincidentes con &quot;{busqueda}&quot;</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {productosFiltrados.map((p) => {
                  const stock = p.stock_actual ?? 0;
                  const agotado = stock <= 0;
                  const skuNum = p.sku.replace(/\D/g, '') || p.sku;

                  return (
                    <button
                      key={p.id}
                      onClick={() => !agotado && agregarAlCarrito(p.id)}
                      disabled={agotado}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                        agotado
                          ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-xs active:scale-98'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold">
                          <span>#{skuNum}</span>
                          <span className={`px-1.5 py-0.2 rounded font-semibold ${
                            agotado ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {stock} {p.unidad_medida || 'u.'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs mt-1 line-clamp-2 leading-tight">
                          {p.nombre}
                        </h4>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-black text-slate-900 text-xs">
                          {formatCLP(p.precio_venta)}
                        </span>
                        {!agotado && (
                          <span className="w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            +
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: Carrito de Compras Compacto (5 columnas) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          
          {/* Header Carrito + Selector de Cliente */}
          <div className="space-y-2.5 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Carrito ({carrito.length})</h3>
              </div>
              {carrito.length > 0 && (
                <button
                  onClick={() => setCarrito([])}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Selector de Cliente */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={clienteSeleccionado}
                onChange={e => setClienteSeleccionado(e.target.value)}
                className="w-full bg-transparent text-slate-800 font-semibold outline-none cursor-pointer text-xs"
              >
                <option value="">Cliente General / Sin Registro</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.rut_identificador ? `(${c.rut_identificador})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de Ítems en Carrito */}
          <div className="flex-1 max-h-[220px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 text-xs">
            {carrito.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                Selecciona productos de la izquierda o pistolea códigos de barra.
              </div>
            ) : (
              carrito.map((item) => (
                <div key={item.producto_id} className="pt-1.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 text-xs truncate">{item.nombre}</h5>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatCLP(item.precio_unitario)} c/u
                    </span>
                  </div>

                  {/* Control de Cantidad (+ / -) */}
                  <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5 shrink-0">
                    <button
                      onClick={() => cambiarCantidad(item.producto_id, -1)}
                      className="w-5 h-5 flex items-center justify-center bg-white text-slate-700 rounded font-bold hover:bg-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs font-mono">{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(item.producto_id, 1)}
                      className="w-5 h-5 flex items-center justify-center bg-white text-slate-700 rounded font-bold hover:bg-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-bold text-slate-900 text-xs shrink-0 w-16 text-right">
                    {formatCLP(item.subtotal)}
                  </span>

                  <button
                    onClick={() => eliminarDelCarrito(item.producto_id)}
                    className="p-1 text-slate-400 hover:text-rose-600 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Desglose Financiero */}
          <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Subtotal Neto:</span>
              <span className="font-semibold text-slate-800">{formatCLP(subtotalNeto)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>19% IVA (Incluido):</span>
              <span className="font-semibold text-slate-800">{formatCLP(ivaEstimado)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
              <span>Total a Pagar:</span>
              <span className="text-blue-600">{formatCLP(totalFinal)}</span>
            </div>
          </div>

          {/* Selector de Métodos de Pago */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <label className="font-bold text-slate-700 block text-[11px]">Forma de Pago:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
                { id: 'TARJETA_DEBITO', label: 'Débito', icon: CreditCard },
                { id: 'TARJETA_CREDITO', label: 'Crédito', icon: CreditCard },
                { id: 'TRANSFERENCIA', label: 'Transferencia', icon: Receipt },
              ].map((m) => {
                const Icon = m.icon;
                const activo = metodoPago === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetodoPago(m.id as MetodoPagoTipo)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activo
                        ? 'bg-[#2d3748] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTÓN DE VENTA UBICADO INMEDIATAMENTE ABAJO DEL MÉTODO DE PAGO */}
          <div className="pt-2">
            <button
              onClick={handleConfirmarVenta}
              disabled={carrito.length === 0}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                carrito.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-98'
              }`}
            >
              <span>Confirmar Venta • {formatCLP(totalFinal)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
