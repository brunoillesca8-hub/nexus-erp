-- ==============================================================================
-- ERP + CRM: DATOS DE PRUEBA / SEMILLA (SEED DATA)
-- ==============================================================================

-- Empresa de demostración
INSERT INTO empresas (id, nombre, rut_identificador, telefono, email, direccion, moneda, iva_porcentaje)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Distribuidora Austral SpA',
    '76.890.123-K',
    '+56 9 8765 4321',
    'contacto@distribuidoraaustral.cl',
    'Av. Alemania 1230, Valdivia, Chile',
    'CLP',
    19.00
) ON CONFLICT (id) DO NOTHING;

-- Sucursal Principal
INSERT INTO sucursales (id, empresa_id, nombre, codigo, direccion, es_principal)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Casa Matriz Valdivia',
    'SUC-VAL-01',
    'Av. Alemania 1230, Valdivia',
    true
) ON CONFLICT (id) DO NOTHING;

-- Categorías
INSERT INTO categorias (id, empresa_id, nombre, descripcion) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Bebidas y Licores', 'Bebidas, jugos, aguas y licores artesanales'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Abarrotes y Granos', 'Arroz, legumbres, harinas y fideos'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Lácteos y Quesos', 'Quesos de la zona, leches, mantequillas'),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Snacks y Confitería', 'Chocolates, galletas y frutos secos')
ON CONFLICT (id) DO NOTHING;

-- Proveedores
INSERT INTO proveedores (id, empresa_id, nombre, rut_identificador, contacto_nombre, telefono, email, direccion) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Cervecería Kunstmann', '96.123.456-7', 'Rodrigo Silva', '+56 63 2223344', 'ventas@kunstmann.cl', 'Ruta T-350 N° 950, Valdivia'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Colun Cooperativa', '81.456.789-2', 'Marcela Fuentes', '+56 64 2471000', 'comercial@colun.cl', 'La Unión, Región de Los Ríos'),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Empresas Iansa', '90.789.123-4', 'Carlos Mendoza', '+56 2 2345 6789', 'ventas@iansa.cl', 'Santiago')
ON CONFLICT (id) DO NOTHING;

-- Clientes
INSERT INTO clientes (id, empresa_id, nombre, rut_identificador, telefono, email, direccion) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Restaurante La Casona', '77.345.678-9', '+56 9 9123 4567', 'lacasona@valdivia.cl', 'Costanera Arturo Prat 540'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Minimarket Don Pedro', '15.678.901-2', '+56 9 8234 5678', 'donpedro@gmail.com', 'Calle Picarte 890'),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Cafetería Selva Valdiviana', '76.999.888-1', '+56 9 7345 6789', 'cafe@selvavaldiviana.cl', 'Isla Teja 320')
ON CONFLICT (id) DO NOTHING;

-- Productos
INSERT INTO productos (id, empresa_id, categoria_id, proveedor_id, nombre, sku, codigo_barras, precio_compra, precio_venta, stock_minimo, unidad_medida) VALUES
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Cerveza Torobayo 330cc Pack 6', '1001', '780461234001', 5800, 8990, 10, 'pack'),
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Cerveza Bock 330cc Pack 6', '1002', '780461234002', 6200, 9490, 8, 'pack'),
('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'Queso Ranco Laminado 500g', '1003', '780462001001', 3400, 5290, 15, 'u.'),
('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'Mantequilla con Sal 250g', '1004', '780462001002', 1800, 2890, 12, 'u.'),
('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 'Azúcar Blanca Especial 1kg', '1005', '780463001001', 950, 1490, 30, 'u.'),
('f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'Chocolate Artesanal 70% Cacao', '1006', '780464001001', 2100, 3990, 10, 'u.')
ON CONFLICT (id) DO NOTHING;

-- Stock Inicial en Sucursal Principal
INSERT INTO stock_sucursal (empresa_id, sucursal_id, producto_id, stock_actual) VALUES
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 45),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 30),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003', 25),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000004', 40),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', 80),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000006', 18)
ON CONFLICT (sucursal_id, producto_id) DO NOTHING;
