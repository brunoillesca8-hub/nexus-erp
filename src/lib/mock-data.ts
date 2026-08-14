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
  { id: 'c0000000-0000-0000-0000-000000000001', empresa_id: DEMO_EMPRESA.id, nombre: 'Bebidas y Líquidos', descripcion: 'Aguas, jugos, bebidas, cervezas y licores', activo: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000002', empresa_id: DEMO_EMPRESA.id, nombre: 'Abarrotes Generales', descripcion: 'Arroz, harinas, aceites, azúcar, sal y granos', activo: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000003', empresa_id: DEMO_EMPRESA.id, nombre: 'Lácteos y Quesos', descripcion: 'Leches, quesos, mantequillas, cremas y yogures', activo: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000004', empresa_id: DEMO_EMPRESA.id, nombre: 'Snacks y Dulces', descripcion: 'Chocolates, galletas, papas fritas y confites', activo: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000005', empresa_id: DEMO_EMPRESA.id, nombre: 'Limpieza y Hogar', descripcion: 'Detergentes, lavalozas, cloros, papeles y bolsas', activo: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000006', empresa_id: DEMO_EMPRESA.id, nombre: 'Mascotas', descripcion: 'Alimentos para perros, gatos y accesorios', activo: true, created_at: new Date().toISOString() },
];

export const DEMO_PROVEEDORES: Proveedor[] = [
  { id: 'd0000000-0000-0000-0000-000000000001', empresa_id: DEMO_EMPRESA.id, nombre: 'Distribuidora Mayorista Sur', rut_identificador: '96.123.456-7', contacto_nombre: 'Rodrigo Silva', telefono: '+56 9 8765 4321', email: 'ventas@mayoristasur.cl', direccion: 'Parque Industrial 450', activo: true, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000002', empresa_id: DEMO_EMPRESA.id, nombre: 'Proveedor Lácteos Central', rut_identificador: '81.456.789-2', contacto_nombre: 'Marcela Fuentes', telefono: '+56 9 7654 3210', email: 'comercial@lacteoscentral.cl', direccion: 'Ruta Sur Km 12', activo: true, created_at: new Date().toISOString() }
];

export const DEMO_CLIENTES: Cliente[] = [
  { id: 'e0000000-0000-0000-0000-000000000001', empresa_id: DEMO_EMPRESA.id, nombre: 'Cliente Frecuente 1', rut_identificador: '16.345.678-9', telefono: '+56 9 9123 4567', email: 'cliente1@correo.cl', direccion: 'Av. Los Alerces 450', notas: 'Cliente recurrente de compras semanales', activo: true, created_at: new Date().toISOString() },
  { id: 'e0000000-0000-0000-0000-000000000002', empresa_id: DEMO_EMPRESA.id, nombre: 'Minimarket San José', rut_identificador: '77.678.901-2', telefono: '+56 9 8234 5678', email: 'sanjose@gmail.com', direccion: 'Calle Prat 890', notas: 'Pago con transferencia', activo: true, created_at: new Date().toISOString() }
];

export const DEMO_PRODUCTOS: Producto[] = [];

export const DEMO_VENTAS: Venta[] = [];

export const DEMO_MOVIMIENTOS: MovimientoInventario[] = [];
