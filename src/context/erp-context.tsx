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

interface ERPContextType {
  // Tenant & Sesión
  empresa: Empresa;
  setEmpresa: (emp: Empresa) => void;
  sucursales: Sucursal[];
  sucursalActiva: Sucursal;
  setSucursalActiva: (suc: Sucursal) => void;
  rolActual: RolUsuario;
  setRolActual: (rol: RolUsuario) => void;
  
  // Catálogo & Stock
  productos: Producto[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  clientes: Cliente[];
  
  // Operaciones Catálogo
  agregarProducto: (producto: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => void;
  actualizarProducto: (id: string, producto: Partial<Producto>) => void;
  eliminarProducto: (id: string) => void;
  agregarCliente: (cliente: Omit<Cliente, 'id' | 'created_at'>) => void;
  actualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  agregarProveedor: (proveedor: Omit<Proveedor, 'id' | 'created_at'>) => void;
  agregarCategoria: (categoria: Omit<Categoria, 'id' | 'created_at'>) => void;
  
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

  // Estado UI
  isDemoMode: boolean;
  notificacion: { mensaje: string; tipo: 'success' | 'error' | 'info' } | null;
  mostrarNotificacion: (mensaje: string, tipo?: 'success' | 'error' | 'info') => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export function ERPProvider({ children }: { children: React.ReactNode }) {
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

  const [isDemoMode] = useState<boolean>(true);
  const [notificacion, setNotificacion] = useState<{ mensaje: string; tipo: 'success' | 'error' | 'info' } | null>(null);

  // Cargar datos guardados en LocalStorage si existen
  useEffect(() => {
    try {
      const savedProds = localStorage.getItem('erp_productos');
      const savedVentas = localStorage.getItem('erp_ventas');
      const savedClientes = localStorage.getItem('erp_clientes');
      const savedMovs = localStorage.getItem('erp_movimientos');
      const savedEmpresa = localStorage.getItem('erp_empresa');

      if (savedProds) setProductos(JSON.parse(savedProds));
      if (savedVentas) setVentas(JSON.parse(savedVentas));
      if (savedClientes) setClientes(JSON.parse(savedClientes));
      if (savedMovs) setMovimientos(JSON.parse(savedMovs));
      if (savedEmpresa) setEmpresa(JSON.parse(savedEmpresa));
    } catch {
      // Ignorar error de parsing
    }
  }, []);

  // Guardar en LocalStorage cada vez que cambien para persistencia
  useEffect(() => {
    try {
      localStorage.setItem('erp_productos', JSON.stringify(productos));
      localStorage.setItem('erp_ventas', JSON.stringify(ventas));
      localStorage.setItem('erp_clientes', JSON.stringify(clientes));
      localStorage.setItem('erp_movimientos', JSON.stringify(movimientos));
      localStorage.setItem('erp_empresa', JSON.stringify(empresa));
    } catch {
      // Ignore storage errors
    }
  }, [productos, ventas, clientes, movimientos, empresa]);

  const mostrarNotificacion = useCallback((mensaje: string, tipo: 'success' | 'error' | 'info' = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => {
      setNotificacion(null);
    }, 4000);
  }, []);

  // Agregar Producto
  const agregarProducto = (nuevoProd: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => {
    const id = `p-${Date.now()}`;
    const prod: Producto = {
      ...nuevoProd,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProductos(prev => [prod, ...prev]);

    // Registrar movimiento inicial de Kardex si tiene stock
    if (prod.stock_actual && prod.stock_actual > 0) {
      const mov: MovimientoInventario = {
        id: `m-${Date.now()}`,
        empresa_id: empresa.id,
        sucursal_id: sucursalActiva.id,
        producto_id: id,
        usuario_id: null,
        tipo: 'ENTRADA_COMPRA',
        cantidad: prod.stock_actual,
        stock_anterior: 0,
        stock_posterior: prod.stock_actual,
        motivo: 'Inventario inicial del producto',
        venta_id: null,
        created_at: new Date().toISOString(),
      };
      setMovimientos(prev => [mov, ...prev]);
    }

    mostrarNotificacion(`Producto "${prod.nombre}" agregado con éxito.`, 'success');
  };

  // Actualizar Producto
  const actualizarProducto = (id: string, campos: Partial<Producto>) => {
    setProductos(prev => prev.map(p => p.id === id ? { ...p, ...campos, updated_at: new Date().toISOString() } : p));
    mostrarNotificacion('Producto actualizado correctamente.', 'success');
  };

  // Eliminar Producto (Desactivar)
  const eliminarProducto = (id: string) => {
    setProductos(prev => prev.map(p => p.id === id ? { ...p, activo: false } : p));
    mostrarNotificacion('Producto desactivado del catálogo.', 'info');
  };

  // Agregar Cliente
  const agregarCliente = (nuevo: Omit<Cliente, 'id' | 'created_at'>) => {
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
  const agregarProveedor = (nuevo: Omit<Proveedor, 'id' | 'created_at'>) => {
    const prov: Proveedor = {
      ...nuevo,
      id: `prov-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setProveedores(prev => [prov, ...prev]);
    mostrarNotificacion(`Proveedor "${prov.nombre}" agregado.`, 'success');
  };

  // Agregar Categoría
  const agregarCategoria = (nuevo: Omit<Categoria, 'id' | 'created_at'>) => {
    const cat: Categoria = {
      ...nuevo,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setCategorias(prev => [cat, ...prev]);
    mostrarNotificacion(`Categoría "${cat.nombre}" agregada.`, 'success');
  };

  // PROCESAR VENTA ATÓMICA CON DESCUENTO DE STOCK Y KARDEX
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
    // 1. REGLA ESTRICTA: Validar stock de cada producto. Si es cero o menor a la cantidad solicitada -> BLOQUEO
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
    const nextFolio = (ventas[0]?.numero_folio || 1000) + 1;
    const ahora = new Date().toISOString();

    // 2. Crear registro de venta
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
    };

    // 3. Generar movimientos de inventario y actualizar stock de productos
    const nuevosMovimientos: MovimientoInventario[] = [];
    const prodsActualizados = [...productos];

    for (const item of data.items) {
      const pIndex = prodsActualizados.findIndex(p => p.id === item.producto_id);
      if (pIndex !== -1) {
        const prod = prodsActualizados[pIndex];
        const stockAnt = prod.stock_actual ?? 0;
        const stockPost = Math.max(0, stockAnt - item.cantidad);

        // Descontar stock
        prodsActualizados[pIndex] = {
          ...prod,
          stock_actual: stockPost,
          updated_at: ahora,
        };

        // Movimiento Kardex
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

  // Ajuste manual de stock (Entradas / Mermas / Ajustes)
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
        sucursalActiva,
        setSucursalActiva,
        rolActual,
        setRolActual,
        productos,
        categorias,
        proveedores,
        clientes,
        agregarProducto,
        actualizarProducto,
        eliminarProducto,
        agregarCliente,
        actualizarCliente,
        agregarProveedor,
        agregarCategoria,
        ventas,
        procesarVenta,
        movimientos,
        ajustarStock,
        isDemoMode,
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
