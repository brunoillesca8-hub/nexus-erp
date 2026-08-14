import { Empresa, Sucursal, Producto, Categoria, Proveedor, Cliente, Venta, MovimientoInventario } from '@/types/database.types';

export const DEMO_EMPRESA: Empresa = {
  id: 'a0000000-0000-0000-0000-000000000001',
  nombre: 'Mi Negocio Comercial',
  rut_identificador: '76.123.456-7',
  telefono: '+56 9 1234 5678',
  email: 'contacto@minegocio.cl',
  direccion: 'Calle Comercial 123, Local 1',
  logo_url: null,
  moneda: 'CLP',
  iva_porcentaje: 19.0,
  activo: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_SUCURSALES: Sucursal[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    empresa_id: DEMO_EMPRESA.id,
    nombre: 'Local Principal',
    codigo: 'LOC-01',
    direccion: 'Calle Comercial 123, Local 1',
    telefono: '+56 9 1234 5678',
    es_principal: true,
    activo: true,
    created_at: new Date().toISOString(),
  }
];

export const DEMO_CATEGORIAS: Categoria[] = [
  { id: 'c0000000-0000-0000-0000-000000000001', empresa_id: DEMO_EMPRESA.id, nombre: 'Bebidas y Líquidos', descripcion: 'Aguas, jugos, bebidas y licores', activo: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000002', empresa_id: DEMO_EMPRESA.id, nombre: 'Abarrotes Generales', descripcion: 'Arroz, harinas, aceites y granos', activo: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000003', empresa_id: DEMO_EMPRESA.id, nombre: 'Lácteos y Quesos', descripcion: 'Leches, quesos y mantequillas', activo: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000004', empresa_id: DEMO_EMPRESA.id, nombre: 'Snacks y Dulces', descripcion: 'Chocolates, galletas y confites', activo: true, created_at: new Date().toISOString() }
];

export const DEMO_PROVEEDORES: Proveedor[] = [
  { id: 'd0000000-0000-0000-0000-000000000001', empresa_id: DEMO_EMPRESA.id, nombre: 'Distribuidora Mayorista Sur', rut_identificador: '96.123.456-7', contacto_nombre: 'Rodrigo Silva', telefono: '+56 9 8765 4321', email: 'ventas@mayoristasur.cl', direccion: 'Parque Industrial 450', activo: true, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000002', empresa_id: DEMO_EMPRESA.id, nombre: 'Proveedor Lácteos Central', rut_identificador: '81.456.789-2', contacto_nombre: 'Marcela Fuentes', telefono: '+56 9 7654 3210', email: 'comercial@lacteoscentral.cl', direccion: 'Ruta Sur Km 12', activo: true, created_at: new Date().toISOString() }
];

export const DEMO_CLIENTES: Cliente[] = [
  { id: 'e0000000-0000-0000-0000-000000000001', empresa_id: DEMO_EMPRESA.id, nombre: 'Cliente Frecuente 1', rut_identificador: '16.345.678-9', telefono: '+56 9 9123 4567', email: 'cliente1@correo.cl', direccion: 'Av. Los Alerces 450', notas: 'Cliente recurrente de compras semanales', activo: true, created_at: new Date().toISOString() },
  { id: 'e0000000-0000-0000-0000-000000000002', empresa_id: DEMO_EMPRESA.id, nombre: 'Minimarket San José', rut_identificador: '77.678.901-2', telefono: '+56 9 8234 5678', email: 'sanjose@gmail.com', direccion: 'Calle Prat 890', notas: 'Pago con transferencia', activo: true, created_at: new Date().toISOString() }
];

export const DEMO_PRODUCTOS: Producto[] = [
  {
    id: 'p-1',
    empresa_id: DEMO_EMPRESA.id,
    categoria_id: 'c0000000-0000-0000-0000-000000000001',
    proveedor_id: 'd0000000-0000-0000-0000-000000000001',
    nombre: 'Bebida Gaseosa 1.5L',
    descripcion: 'Botella retornable / desechable 1.5 litros.',
    sku: '1001',
    codigo_barras: '780100000001',
    precio_compra: 950,
    precio_venta: 1690,
    stock_minimo: 10,
    unidad_medida: 'u.',
    imagen_url: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_actual: 45,
  },
  {
    id: 'p-2',
    empresa_id: DEMO_EMPRESA.id,
    categoria_id: 'c0000000-0000-0000-0000-000000000001',
    proveedor_id: 'd0000000-0000-0000-0000-000000000001',
    nombre: 'Jugo Natural Naranja 1L',
    descripcion: 'Jugo 100% fruta sin azúcar añadida.',
    sku: '1002',
    codigo_barras: '780100000002',
    precio_compra: 1200,
    precio_venta: 2190,
    stock_minimo: 8,
    unidad_medida: 'u.',
    imagen_url: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_actual: 30,
  },
  {
    id: 'p-3',
    empresa_id: DEMO_EMPRESA.id,
    categoria_id: 'c0000000-0000-0000-0000-000000000003',
    proveedor_id: 'd0000000-0000-0000-0000-000000000002',
    nombre: 'Queso Laminado 500g',
    descripcion: 'Queso mantecoso tradicional.',
    sku: '1003',
    codigo_barras: '780100000003',
    precio_compra: 3400,
    precio_venta: 5490,
    stock_minimo: 12,
    unidad_medida: 'u.',
    imagen_url: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_actual: 25,
  },
  {
    id: 'p-4',
    empresa_id: DEMO_EMPRESA.id,
    categoria_id: 'c0000000-0000-0000-0000-000000000003',
    proveedor_id: 'd0000000-0000-0000-0000-000000000002',
    nombre: 'Mantequilla con Sal 250g',
    descripcion: 'Mantequilla de campo 100% natural.',
    sku: '1004',
    codigo_barras: '780100000004',
    precio_compra: 1800,
    precio_venta: 2990,
    stock_minimo: 10,
    unidad_medida: 'u.',
    imagen_url: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_actual: 40,
  },
  {
    id: 'p-5',
    empresa_id: DEMO_EMPRESA.id,
    categoria_id: 'c0000000-0000-0000-0000-000000000002',
    proveedor_id: 'd0000000-0000-0000-0000-000000000001',
    nombre: 'Arroz Grano Largo 1kg',
    descripcion: 'Arroz grado 1 selección especial.',
    sku: '1005',
    codigo_barras: '780100000005',
    precio_compra: 950,
    precio_venta: 1590,
    stock_minimo: 20,
    unidad_medida: 'u.',
    imagen_url: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_actual: 70,
  },
  {
    id: 'p-6',
    empresa_id: DEMO_EMPRESA.id,
    categoria_id: 'c0000000-0000-0000-0000-000000000004',
    proveedor_id: 'd0000000-0000-0000-0000-000000000001',
    nombre: 'Chocolate Barra 100g',
    descripcion: 'Chocolate con leche y almendras.',
    sku: '1006',
    codigo_barras: '780100000006',
    precio_compra: 1100,
    precio_venta: 2290,
    stock_minimo: 15,
    unidad_medida: 'u.',
    imagen_url: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_actual: 18,
  }
];

export const DEMO_VENTAS: Venta[] = [
  {
    id: 'v-1',
    empresa_id: DEMO_EMPRESA.id,
    sucursal_id: DEMO_SUCURSALES[0].id,
    cliente_id: DEMO_CLIENTES[0].id,
    usuario_id: 'u-1',
    numero_folio: 100, // Inicia en folio 100
    subtotal: 15460,
    descuento: 460,
    impuesto: 2395,
    total: 15000,
    metodo_pago: 'TARJETA_DEBITO',
    estado: 'COMPLETADA',
    notas: 'Venta inicial',
    fecha_venta: new Date(Date.now() - 3600000 * 2).toISOString(),
    detalles: [
      { id: 'd-1', venta_id: 'v-1', producto_id: 'p-1', cantidad: 3, precio_unitario: 1690, costo_unitario: 950, descuento: 0, subtotal: 5070 },
      { id: 'd-2', venta_id: 'v-1', producto_id: 'p-3', cantidad: 2, precio_unitario: 5490, costo_unitario: 3400, descuento: 0, subtotal: 10980 }
    ]
  }
];

export const DEMO_MOVIMIENTOS: MovimientoInventario[] = [
  {
    id: 'm-1',
    empresa_id: DEMO_EMPRESA.id,
    sucursal_id: DEMO_SUCURSALES[0].id,
    producto_id: DEMO_PRODUCTOS[0].id,
    usuario_id: null,
    tipo: 'ENTRADA_COMPRA',
    cantidad: 48,
    stock_anterior: 0,
    stock_posterior: 48,
    motivo: 'Carga inicial de inventario',
    venta_id: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'm-2',
    empresa_id: DEMO_EMPRESA.id,
    sucursal_id: DEMO_SUCURSALES[0].id,
    producto_id: DEMO_PRODUCTOS[0].id,
    usuario_id: null,
    tipo: 'SALIDA_VENTA',
    cantidad: -3,
    stock_anterior: 48,
    stock_posterior: 45,
    motivo: 'Venta POS Folio #100',
    venta_id: 'v-1',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];
