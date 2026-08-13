'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BarcodeScannerModal } from '@/components/pos/BarcodeScannerModal';

export default function NuevaVentaPage() {
  const { productos, clientes, procesarVenta, sucursalActiva, empresa, mostrarNotificacion } = useERP();

  // Estado del Carrito
  const [carrito, setCarrito] = useState<VentaItem[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<MetodoPagoTipo>('EFECTIVO');
  const [descuentoGlobal, setDescuentoGlobal] = useState<number>(0);
  const [notas, setNotas] = useState<string>('');

  // Búsqueda y Escaneo
  const [busqueda, setBusqueda] = useState<string>('');
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const [ventaExitosa, setVentaExitosa] = useState<{ ventaId: string; folio: number; total: number } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Escáner de lector USB/Bluetooth (captura secuencias rápidas de teclado terminadas en Enter)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input o textarea normal
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        if (target.id !== 'barcode-fast-input') return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        buffer = ''; // Reiniciar buffer si fue tipeado manualmente muy lento
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length > 2) {
          handleBarcodeScanned(buffer.trim());
          buffer = '';
          e.preventDefault();
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [productos, carrito]);

  // Manejar escaneo (desde USB o desde Cámara de celular)
  const handleBarcodeScanned = (code: string) => {
    const prod = productos.find(
      p => p.codigo_barras === code || p.sku.toLowerCase() === code.toLowerCase()
    );

    if (!prod) {
      mostrarNotificacion(`Código "${code}" no encontrado en el catálogo.`, 'error');
      return;
    }

    agregarAlCarrito(prod.id);
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
          mostrarNotificacion(`No puedes vender más de ${stockDisponible} unidades de "${prod.nombre}".`, 'error');
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
        sku: prod.sku,
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

  // Filtrado de productos para la grilla rápida
  const productosFiltrados = productos.filter(p => {
    if (!p.activo) return false;
    const term = busqueda.toLowerCase().trim();
    if (!term) return true;
    return (
      p.nombre.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (p.codigo_barras && p.codigo_barras.includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Modal de Escaneo con Cámara de Celular */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
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
                <span className="text-slate-500">Sucursal:</span>
                <span className="font-semibold text-slate-800">{sucursalActiva.nombre}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                onClick={() => setVentaExitosa(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header del POS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Terminal Punto de Venta (POS)</h2>
            <p className="text-xs text-slate-500">
              Descuento automático de stock e impresión en <strong className="text-slate-800">Pesos Chilenos (CLP)</strong>.
            </p>
          </div>
        </div>

        {/* Botón Escáner Cámara Móvil */}
        <button
          onClick={() => setCameraModalOpen(true)}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Escanear con Cámara</span>
        </button>
      </div>

      {/* Grid: 2 Columnas (Izquierda: Catálogo/Buscador - Derecha: Carrito) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: Buscador & Catálogo de Productos */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barra de Búsqueda Rápida / Código de Barras */}
          <div className="relative flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <input
              ref={searchInputRef}
              id="barcode-fast-input"
              type="text"
              placeholder="Buscar por Nombre, SKU o pistolear Código de barras..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && busqueda.trim()) {
                  handleBarcodeScanned(busqueda.trim());
                  setBusqueda('');
                }
              }}
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-900"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2"
              >
                Limpiar
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-500">
              <Barcode className="w-3.5 h-3.5" />
              <span>USB Listo</span>
            </div>
          </div>

          {/* Grilla de Selección Rápida */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {productosFiltrados.map((p) => {
              const stock = p.stock_actual ?? 0;
              const sinStock = stock <= 0;

              return (
                <button
                  key={p.id}
                  onClick={() => agregarAlCarrito(p.id)}
                  disabled={sinStock}
                  className={`flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all relative ${
                    sinStock 
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' 
                      : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 active:scale-98 cursor-pointer'
                  }`}
                >
                  {sinStock && (
                    <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      AGOTADO
                    </span>
                  )}
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      {p.sku}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                      {p.nombre}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600">
                      {formatCLP(p.precio_venta)}
                    </span>
                    {!sinStock && (
                      <span className={`text-[10px] font-semibold ${
                        stock <= p.stock_minimo ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {stock} disp.
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DERECHA: Carrito de Compra & Cobro */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Resumen de Venta</h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {carrito.length} items
              </span>
            </div>

            {/* Selector de Cliente */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>Cliente (Opcional)</span>
              </label>
              <select
                value={clienteSeleccionado}
                onChange={(e) => setClienteSeleccionado(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="">Cliente Ocasional / Mostrador</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.rut_identificador || 'Sin RUT'})
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de Items en Carrito */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {carrito.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-xs">No hay productos en el carrito.</p>
                  <p className="text-[11px] text-slate-400">Escanea un código de barras o selecciona del catálogo.</p>
                </div>
              ) : (
                carrito.map((item) => (
                  <div
                    key={item.producto_id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-slate-900 line-clamp-1">{item.nombre}</p>
                      <p className="text-[11px] text-slate-500">{formatCLP(item.precio_unitario)} c/u</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => cambiarCantidad(item.producto_id, -1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-slate-900 min-w-[20px] text-center">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => cambiarCantidad(item.producto_id, 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-black text-slate-900 min-w-[65px] text-right">
                        {formatCLP(item.subtotal)}
                      </span>

                      <button
                        onClick={() => eliminarDelCarrito(item.producto_id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Método de Pago */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Método de Pago</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA'] as MetodoPagoTipo[]).map((met) => (
                  <button
                    key={met}
                    onClick={() => setMetodoPago(met)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      metodoPago === met
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {met === 'EFECTIVO' ? '💵 Efectivo' :
                     met === 'TARJETA_DEBITO' ? '💳 Débito' :
                     met === 'TARJETA_CREDITO' ? '💳 Crédito' : '📱 Transferencia'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Totales y Botón Confirmar */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Neto:</span>
                <span>{formatCLP(subtotalNeto)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IVA ({empresa.iva_porcentaje || 19}% incl.):</span>
                <span>{formatCLP(ivaEstimado)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
                <span>TOTAL A PAGAR:</span>
                <span className="text-blue-600">{formatCLP(totalFinal)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmarVenta}
              disabled={carrito.length === 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                carrito.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 active:scale-98 cursor-pointer'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Confirmar Venta ({formatCLP(totalFinal)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
