export type RolUsuario = 'SUPERADMIN' | 'ADMIN' | 'VENDEDOR' | 'INVENTARIO' | 'ANALISTA';
export type EstadoVenta = 'COMPLETADA' | 'ANULADA' | 'PENDIENTE';
export type MetodoPagoTipo = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA' | 'OTRO';
export type TipoMovimiento = 
  | 'ENTRADA_COMPRA'
  | 'SALIDA_VENTA'
  | 'DEVOLUCION_CLIENTE'
  | 'DEVOLUCION_PROVEEDOR'
  | 'AJUSTE_POSITIVO'
  | 'AJUSTE_NEGATIVO'
  | 'MERMA_DANADO'
  | 'TRANSFERENCIA_SALIDA'
  | 'TRANSFERENCIA_ENTRADA';

export interface Empresa {
  id: string;
  nombre: string;
  rut_identificador: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  logo_url: string | null;
  moneda: string;
  iva_porcentaje: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sucursal {
  id: string;
  empresa_id: string;
  nombre: string;
  codigo: string | null;
  direccion: string | null;
  telefono: string | null;
  es_principal: boolean;
  activo: boolean;
  created_at: string;
}

export interface UsuarioPerfil {
  id: string;
  nombre_completo: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface MiembroEmpresa {
  id: string;
  empresa_id: string;
  usuario_id: string;
  rol: RolUsuario;
  sucursal_asignada_id: string | null;
  activo: boolean;
  created_at: string;
  empresa?: Empresa;
  usuario?: UsuarioPerfil;
  sucursal?: Sucursal;
}

export interface Categoria {
  id: string;
  empresa_id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
}

export interface Proveedor {
  id: string;
  empresa_id: string;
  nombre: string;
  rut_identificador: string | null;
  contacto_nombre: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  activo: boolean;
  created_at: string;
}

export interface Cliente {
  id: string;
  empresa_id: string;
  nombre: string;
  rut_identificador: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  notas: string | null;
  activo: boolean;
  created_at: string;
}

export interface Producto {
  id: string;
  empresa_id: string;
  categoria_id: string | null;
  proveedor_id: string | null;
  nombre: string;
  descripcion: string | null;
  sku: string;
  codigo_barras: string | null;
  precio_compra: number;
  precio_venta: number;
  stock_minimo: number;
  unidad_medida: string;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  categoria?: Categoria;
  proveedor?: Proveedor;
  stock_actual?: number; // Calculado de stock_sucursal
}

export interface StockSucursal {
  id: string;
  empresa_id: string;
  sucursal_id: string;
  producto_id: string;
  stock_actual: number;
  created_at: string;
  updated_at: string;
}

export interface VentaItem {
  producto_id: string;
  nombre?: string;
  sku?: string;
  codigo_barras?: string | null;
  cantidad: number;
  precio_unitario: number;
  costo_unitario: number;
  descuento: number;
  subtotal: number;
  stock_disponible?: number;
}

export interface Venta {
  id: string;
  empresa_id: string;
  sucursal_id: string;
  cliente_id: string | null;
  usuario_id: string;
  numero_folio: number;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  metodo_pago: MetodoPagoTipo;
  estado: EstadoVenta;
  notas: string | null;
  fecha_venta: string;
  cliente?: Cliente;
  usuario?: UsuarioPerfil;
  sucursal?: Sucursal;
  detalles?: DetalleVenta[];
}

export interface DetalleVenta {
  id: string;
  venta_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  costo_unitario: number;
  descuento: number;
  subtotal: number;
  producto?: Producto;
}

export interface MovimientoInventario {
  id: string;
  empresa_id: string;
  sucursal_id: string;
  producto_id: string;
  usuario_id: string | null;
  tipo: TipoMovimiento;
  cantidad: number;
  stock_anterior: number;
  stock_posterior: number;
  motivo: string | null;
  venta_id: string | null;
  created_at: string;
  producto?: Producto;
  sucursal?: Sucursal;
}
