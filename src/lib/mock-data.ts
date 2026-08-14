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

export const DEMO_PROVEEDORES: Proveedor[] = [];

export const DEMO_CLIENTES: Cliente[] = [];

export const DEMO_PRODUCTOS: Producto[] = [];

export const DEMO_VENTAS: Venta[] = [];

export const DEMO_MOVIMIENTOS: MovimientoInventario[] = [];
