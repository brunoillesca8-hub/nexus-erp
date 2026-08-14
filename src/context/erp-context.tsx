'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Empresa, 
  Sucursal, 
  Producto, 
  Categoria, 
  Proveedor, 
  Cliente, 
  Venta, 
  VentaItem, 
  MovimientoInventario, 
  RolUsuario 
} from '@/types/database.types';
import { 
  DEMO_EMPRESA, 
  DEMO_SUCURSALES, 
  DEMO_CATEGORIAS, 
  DEMO_PROVEEDORES, 
  DEMO_CLIENTES, 
  DEMO_PRODUCTOS, 
  DEMO_VENTAS, 
  DEMO_MOVIMIENTOS 
} from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/client';

interface ERPContextType {
  // Tenant & Sesión
  empresa: Empresa;
  setEmpresa: (emp: Empresa) => void;
  sucursales: Sucursal[];
  actualizarNombreSucursal: (nombre: string) => void;
  sucursalActiva: Sucursal;
  setSucursalActiva: (suc: Sucursal) => void;
  rolActual: RolUsuario;
  setRolActual: (rol: RolUsuario) => void;
  
  // Catálogo & Stock
  productos: Producto[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  clientes: Cliente[];
  generarSiguienteSKU: () => string;
  
  // Operaciones Catálogo
  agregarProducto: (producto: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  agregarProductosLote: (lista: Array<Omit<Producto, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  actualizarProducto: (id: string, producto: Partial<Producto>) => void;
  eliminarProducto: (id: string) => void;
  vaciarCatalogo: () => void;
  agregarCliente: (cliente: Omit<Cliente, 'id' | 'created_at'>) => Promise<void>;
  actualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  agregarProveedor: (proveedor: Omit<Proveedor, 'id' | 'created_at'>) => Promise<void>;
  agregarCategoria: (categoria: Omit<Categoria, 'id' | 'created_at'>) => Promise<void>;
  
  // Ventas & POS
  ventas: Venta[];
  procesarVenta: (data: {
    clienteId: string | null;
    items: VentaItem[];
    subtotal: number;
    descuento: number;
    impuesto: number;
    total: number;
    metodoPago: Venta['metodo_pago'];
    notas?: string;
  }) => { success: boolean; error?: string; ventaId?: string; folio?: number };

  // Inventario & Kardex
  movimientos: MovimientoInventario[];
  ajustarStock: (productoId: string, cantidad: number, motivo: string, tipo: MovimientoInventario['tipo']) => void;

  // Estado UI & Sincronización
  isOnlineSupabase: boolean;
  notificacion: { mensaje: string; tipo: 'success' | 'error' | 'info' } | null;
  mostrarNotificacion: (mensaje: string, tipo?: 'success' | 'error' | 'info') => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export function ERPProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());

  const [empresa, setEmpresa] = useState<Empresa>(DEMO_EMPRESA);
  const [sucursales, setSucursales] = useState<Sucursal[]>(DEMO_SUCURSALES);
  const [sucursalActiva, setSucursalActiva] = useState<Sucursal>(DEMO_SUCURSALES[0]);
  const [rolActual, setRolActual] = useState<RolUsuario>('ADMIN');

  const [productos, setProductos] = useState<Producto[]>(DEMO_PRODUCTOS);
  const [categorias, setCategorias] = useState<Categoria[]>(DEMO_CATEGORIAS);
  const [proveedores, setProveedores] = useState<Proveedor[]>(DEMO_PROVEEDORES);
  const [clientes, setClientes] = useState<Cliente[]>(DEMO_CLIENTES);
  const [ventas, setVentas] = useState<Venta[]>(DEMO_VENTAS);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>(DEMO_MOVIMIENTOS);

  const [isOnlineSupabase, setIsOnlineSupabase] = useState<boolean>(false);
  const [notificacion, setNotificacion] = useState<{ mensaje: string; tipo: 'success' | 'error' | 'info' } | null>(null);

  const mostrarNotificacion = useCallback((mensaje: string, tipo: 'success' | 'error' | 'info' = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => {
      setNotificacion(null);
    }, 4000);
  }, []);

  // Generador de Código SKU 100% Numérico Autoincrementable (ej: 1001, 1002, 1003...)
  const generarSiguienteSKU = useCallback(() => {
    let maxNum = 1000;
    productos.forEach(p => {
      // Extraer los dígitos numéricos del SKU
      const numEncontrado = p.sku.replace(/\D/g, '');
      if (numEncontrado) {
        const n = parseInt(numEncontrado, 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextNum = maxNum + 1;
    return nextNum.toString();
  }, [productos]);

  // Actualizar nombre del local principal
  const actualizarNombreSucursal = (nombre: string) => {
    const actualizada = { ...sucursalActiva, nombre };
    setSucursalActiva(actualizada);
    setSucursales([actualizada]);
    localStorage.setItem('erp_sucursal', JSON.stringify(actualizada));
    mostrarNotificacion(`Nombre del local actualizado a "${nombre}".`, 'success');
  };

  // Sincronizar con Supabase Cloud
  const sincronizarConSupabase = async () => {
    try {
      const { data: prodsData, error: prodsErr } = await supabase.from('productos').select('*');
      if (!prodsErr && prodsData) {
        setProductos(prodsData.map(p => ({
          id: p.id,
          empresa_id: p.empresa_id || empresa.id,
          categoria_id: p.categoria_id,
          proveedor_id: p.proveedor_id,
          nombre: p.nombre,
          sku: p.sku ? p.sku.replace(/\D/g, '') || p.sku : '1001',
          codigo_barras: p.codigo_barras,
          precio_compra: Number(p.precio_compra || 0),
          precio_venta: Number(p.precio_venta || 0),
          stock_actual: p.stock_actual ?? 15,
          stock_minimo: p.stock_minimo ?? 5,
          unidad_medida: p.unidad_medida || 'u.',
          descripcion: p.descripcion,
          imagen_url: p.imagen_url,
          activo: p.activo ?? true,
          created_at: p.created_at,
          updated_at: p.updated_at,
        })));
        setIsOnlineSupabase(true);
      }

      const { data: catsData } = await supabase.from('categorias').select('*');
      if (catsData && catsData.length > 0) {
        setCategorias(catsData);
      }

      const { data: ventasData } = await supabase.from('ventas').select('*');
      if (ventasData) {
        setVentas(ventasData);
      }

      const { data: clientesData } = await supabase.from('clientes').select('*');
      if (clientesData) {
        setClientes(clientesData);
      }

      const { data: provData } = await supabase.from('proveedores').select('*');
      if (provData) {
        setProveedores(provData);
      }
    } catch (err) {
      console.log('Modo local/offline activo:', err);
    }
  };

  useEffect(() => {
    sincronizarConSupabase();

    // Suscripción Realtime para reflejo instantáneo en todos los dispositivos conectados
    const channel = supabase
      .channel('erp-live-cloud-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        sincronizarConSupabase();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Cargar datos persistidos en localStorage (como fallback inmediato)
  useEffect(() => {
    try {
      const savedProds = localStorage.getItem('erp_productos');
      const savedVentas = localStorage.getItem('erp_ventas');
      const savedClientes = localStorage.getItem('erp_clientes');
      const savedMovs = localStorage.getItem('erp_movimientos');
      const savedEmpresa = localStorage.getItem('erp_empresa');
      const savedCats = localStorage.getItem('erp_categorias');
      const savedSuc = localStorage.getItem('erp_sucursal');

      if (savedProds && !isOnlineSupabase) setProductos(JSON.parse(savedProds));
      if (savedVentas && !isOnlineSupabase) setVentas(JSON.parse(savedVentas));
      if (savedClientes && !isOnlineSupabase) setClientes(JSON.parse(savedClientes));
      if (savedMovs) setMovimientos(JSON.parse(savedMovs));
      if (savedEmpresa) setEmpresa(JSON.parse(savedEmpresa));
      if (savedCats && !isOnlineSupabase) setCategorias(JSON.parse(savedCats));
      if (savedSuc) {
        const parsedSuc = JSON.parse(savedSuc);
        setSucursalActiva(parsedSuc);
        setSucursales([parsedSuc]);
      }
    } catch {
      // Ignore parse error
    }
  }, [isOnlineSupabase]);

  // Persistir en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('erp_productos', JSON.stringify(productos));
      localStorage.setItem('erp_ventas', JSON.stringify(ventas));
      localStorage.setItem('erp_clientes', JSON.stringify(clientes));
      localStorage.setItem('erp_movimientos', JSON.stringify(movimientos));
      localStorage.setItem('erp_empresa', JSON.stringify(empresa));
      localStorage.setItem('erp_categorias', JSON.stringify(categorias));
    } catch {
      // Ignore storage errors
    }
  }, [productos, ventas, clientes, movimientos, empresa, categorias]);

  // Agregar Producto Individual
  const agregarProducto = async (nuevoProd: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => {
    const id = `p-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const prod: Producto = {
      ...nuevoProd,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProductos(prev => [prod, ...prev]);

    try {
      await supabase.from('productos').insert([{
        nombre: prod.nombre,
        sku: prod.sku,
        codigo_barras: prod.codigo_barras,
        categoria_id: prod.categoria_id,
        precio_compra: prod.precio_compra,
        precio_venta: prod.precio_venta,
        stock_minimo: prod.stock_minimo,
        unidad_medida: prod.unidad_medida,
        descripcion: prod.descripcion,
        activo: true,
      }]);
    } catch {
      // Silencioso
    }

    mostrarNotificacion(`Producto "${prod.nombre}" registrado con éxito.`, 'success');
  };

  // Agregar Lote Masivo de Productos a Supabase Cloud + Local
  const agregarProductosLote = async (lista: Array<Omit<Producto, 'id' | 'created_at' | 'updated_at'>>) => {
    const ahora = new Date().toISOString();
    const nuevosProds: Producto[] = [];

    lista.forEach((item, idx) => {
      const id = `p-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 9)}`;
      const prod: Producto = {
        ...item,
        id,
        created_at: ahora,
        updated_at: ahora,
      };
      nuevosProds.push(prod);
    });

    setProductos(prev => [...nuevosProds, ...prev]);

    try {
      const isUUID = (str?: string | null) => str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      const empresaIdValido = isUUID(empresa.id) ? empresa.id : 'a0000000-0000-0000-0000-000000000001';

      const formateadosSupabase = nuevosProds.map(p => ({
        empresa_id: empresaIdValido,
        nombre: p.nombre,
        sku: p.sku ? p.sku.toString().replace(/\D/g, '') || p.sku.toString() : '1001',
        codigo_barras: p.codigo_barras || null,
        categoria_id: isUUID(p.categoria_id) ? p.categoria_id : null,
        precio_compra: p.precio_compra,
        precio_venta: p.precio_venta,
        stock_actual: p.stock_actual ?? 10,
        stock_minimo: p.stock_minimo ?? 5,
        unidad_medida: p.unidad_medida || 'u.',
        descripcion: p.descripcion || null,
        activo: true,
      }));

      // Insertar en lotes de 100 con upsert para no duplicar SKUs
      for (let i = 0; i < formateadosSupabase.length; i += 100) {
        const chunk = formateadosSupabase.slice(i, i + 100);
        const { error } = await supabase.from('productos').upsert(chunk, { onConflict: 'empresa_id,sku' });
        if (error) {
          console.error('Error insertando lote Supabase:', error);
        }
      }

      await sincronizarConSupabase();
    } catch (e) {
      console.log('Error insertando en Supabase:', e);
    }

    mostrarNotificacion(`¡Se importaron ${nuevosProds.length} productos con éxito y sincronizados en la nube!`, 'success');
  };

  // Actualizar Producto
  const actualizarProducto = async (id: string, campos: Partial<Producto>) => {
    setProductos(prev => prev.map(p => p.id === id ? { ...p, ...campos, updated_at: new Date().toISOString() } : p));
    try {
      await supabase.from('productos').update(campos).eq('id', id);
    } catch {}
    mostrarNotificacion('Producto actualizado correctamente.', 'success');
  };

  // Eliminar Producto (Cloud + Local)
  const eliminarProducto = async (id: string) => {
    const prod = productos.find(p => p.id === id);
    setProductos(prev => prev.filter(p => p.id !== id));
    try {
      await supabase.from('productos').delete().eq('id', id);
      if (prod?.sku) {
        await supabase.from('productos').delete().eq('sku', prod.sku);
      }
    } catch {}
    mostrarNotificacion('Producto eliminado del catálogo.', 'info');
  };

  // Vaciar Catálogo y Datos de Prueba (Reset Completo Cloud + Local)
  const vaciarCatalogo = async () => {
    setProductos([]);
    setMovimientos([]);
    setVentas([]);
    setClientes([]);
    setProveedores([]);
    try {
      localStorage.removeItem('erp_productos');
      localStorage.removeItem('erp_movimientos');
      localStorage.removeItem('erp_ventas');
      localStorage.removeItem('erp_clientes');
      localStorage.removeItem('erp_proveedores');

      // Limpiar también en Supabase Cloud
      await supabase.from('productos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ventas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('clientes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('proveedores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (e) {
      console.log('Error vaciando nube:', e);
    }
    mostrarNotificacion('El catálogo, ventas, clientes y proveedores han sido limpiados por completo en todos los dispositivos.', 'info');
  };

  // Agregar Cliente
  const agregarCliente = async (nuevo: Omit<Cliente, 'id' | 'created_at'>) => {
    const cliente: Cliente = {
      ...nuevo,
      id: `cli-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setClientes(prev => [cliente, ...prev]);
    mostrarNotificacion(`Cliente "${cliente.nombre}" registrado.`, 'success');
  };

  // Actualizar Cliente
  const actualizarCliente = (id: string, campos: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...campos } : c));
    mostrarNotificacion('Datos del cliente actualizados.', 'success');
  };

  // Agregar Proveedor
  const agregarProveedor = async (nuevo: Omit<Proveedor, 'id' | 'created_at'>) => {
    const prov: Proveedor = {
      ...nuevo,
      id: `prov-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setProveedores(prev => [prov, ...prev]);
    mostrarNotificacion(`Proveedor "${prov.nombre}" registrado.`, 'success');
  };

  // Agregar Categoría
  const agregarCategoria = async (nuevo: Omit<Categoria, 'id' | 'created_at'>) => {
    const cat: Categoria = {
      ...nuevo,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setCategorias(prev => [...prev, cat]);
    mostrarNotificacion(`Categoría "${cat.nombre}" agregada con éxito.`, 'success');
  };

  // Procesar Venta Atómica con Descuento de Stock, Kardex y Folio desde 100
  const procesarVenta = (data: {
    clienteId: string | null;
    items: VentaItem[];
    subtotal: number;
    descuento: number;
    impuesto: number;
    total: number;
    metodoPago: Venta['metodo_pago'];
    notas?: string;
  }) => {
    for (const item of data.items) {
      const prod = productos.find(p => p.id === item.producto_id);
      const stockDisponible = prod?.stock_actual ?? 0;
      if (stockDisponible < item.cantidad) {
        const msg = `Stock insuficiente para "${item.nombre || prod?.nombre}". Disponible: ${stockDisponible}, Solicitado: ${item.cantidad}.`;
        mostrarNotificacion(msg, 'error');
        return { success: false, error: msg };
      }
    }

    const ventaId = `v-${Date.now()}`;
    
    // Folio comienza en 100 si es la primera venta, de lo contrario se autoincrementa
    const nextFolio = ventas.length > 0 ? (ventas[0]?.numero_folio || 99) + 1 : 100;
    const ahora = new Date().toISOString();

    const detallesCreados = data.items.map((item, idx) => ({
      id: `d-${Date.now()}-${idx}`,
      venta_id: ventaId,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      costo_unitario: item.costo_unitario,
      descuento: item.descuento || 0,
      subtotal: item.subtotal,
    }));

    const nuevaVenta: Venta = {
      id: ventaId,
      empresa_id: empresa.id,
      sucursal_id: sucursalActiva.id,
      cliente_id: data.clienteId,
      usuario_id: 'u-actual',
      numero_folio: nextFolio,
      subtotal: data.subtotal,
      descuento: data.descuento,
      impuesto: data.impuesto,
      total: data.total,
      metodo_pago: data.metodoPago,
      estado: 'COMPLETADA',
      notas: data.notas || null,
      fecha_venta: ahora,
      cliente: clientes.find(c => c.id === data.clienteId),
      detalles: detallesCreados,
    };

    const nuevosMovimientos: MovimientoInventario[] = [];
    const prodsActualizados = [...productos];

    for (const item of data.items) {
      const pIndex = prodsActualizados.findIndex(p => p.id === item.producto_id);
      if (pIndex !== -1) {
        const prod = prodsActualizados[pIndex];
        const stockAnt = prod.stock_actual ?? 0;
        const stockPost = Math.max(0, stockAnt - item.cantidad);

        prodsActualizados[pIndex] = {
          ...prod,
          stock_actual: stockPost,
          updated_at: ahora,
        };

        nuevosMovimientos.push({
          id: `m-${Date.now()}-${item.producto_id}`,
          empresa_id: empresa.id,
          sucursal_id: sucursalActiva.id,
          producto_id: item.producto_id,
          usuario_id: null,
          tipo: 'SALIDA_VENTA',
          cantidad: -item.cantidad,
          stock_anterior: stockAnt,
          stock_posterior: stockPost,
          motivo: `Venta POS Folio #${nextFolio}`,
          venta_id: ventaId,
          created_at: ahora,
          producto: prod,
        });
      }
    }

    setProductos(prodsActualizados);
    setVentas(prev => [nuevaVenta, ...prev]);
    setMovimientos(prev => [...nuevosMovimientos, ...prev]);

    mostrarNotificacion(`¡Venta #${nextFolio} completada con éxito!`, 'success');
    return { success: true, ventaId, folio: nextFolio };
  };

  const ajustarStock = (
    productoId: string, 
    cantidadAjuste: number, 
    motivo: string, 
    tipo: MovimientoInventario['tipo']
  ) => {
    const prod = productos.find(p => p.id === productoId);
    if (!prod) return;

    const stockAnt = prod.stock_actual ?? 0;
    const stockPost = Math.max(0, stockAnt + cantidadAjuste);

    setProductos(prev => prev.map(p => p.id === productoId ? { ...p, stock_actual: stockPost } : p));

    const mov: MovimientoInventario = {
      id: `m-${Date.now()}`,
      empresa_id: empresa.id,
      sucursal_id: sucursalActiva.id,
      producto_id: productoId,
      usuario_id: null,
      tipo,
      cantidad: cantidadAjuste,
      stock_anterior: stockAnt,
      stock_posterior: stockPost,
      motivo,
      venta_id: null,
      created_at: new Date().toISOString(),
      producto: prod,
    };

    setMovimientos(prev => [mov, ...prev]);
    mostrarNotificacion(`Ajuste de stock aplicado a "${prod.nombre}".`, 'success');
  };

  return (
    <ERPContext.Provider
      value={{
        empresa,
        setEmpresa,
        sucursales,
        actualizarNombreSucursal,
        sucursalActiva,
        setSucursalActiva,
        rolActual,
        setRolActual,
        productos,
        categorias,
        proveedores,
        clientes,
        generarSiguienteSKU,
        agregarProducto,
        agregarProductosLote,
        actualizarProducto,
        eliminarProducto,
        vaciarCatalogo,
        agregarCliente,
        actualizarCliente,
        agregarProveedor,
        agregarCategoria,
        ventas,
        procesarVenta,
        movimientos,
        ajustarStock,
        isOnlineSupabase,
        notificacion,
        mostrarNotificacion,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP debe ser utilizado dentro de un ERPProvider');
  }
  return context;
}
