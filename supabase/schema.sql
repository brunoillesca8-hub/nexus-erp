-- ==============================================================================
-- ERP + CRM + INVENTARIO MULTI-TENANT: ESQUEMA DE BASE DE DATOS SUPABASE POSTGRESQL
-- (SCRIPT 100% IDEMPOTENTE / RE-EJECUTABLE SIN ERRORES)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('SUPERADMIN', 'ADMIN', 'VENDEDOR', 'INVENTARIO', 'ANALISTA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_venta AS ENUM ('COMPLETADA', 'ANULADA', 'PENDIENTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE metodo_pago_tipo AS ENUM ('EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'OTRO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_movimiento AS ENUM (
        'ENTRADA_COMPRA',
        'SALIDA_VENTA',
        'DEVOLUCION_CLIENTE',
        'DEVOLUCION_PROVEEDOR',
        'AJUSTE_POSITIVO',
        'AJUSTE_NEGATIVO',
        'MERMA_DANADO',
        'TRANSFERENCIA_SALIDA',
        'TRANSFERENCIA_ENTRADA'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLAS BASE
-- Empresas (Tenants)
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    rut_identificador VARCHAR(50),
    telefono VARCHAR(50),
    email VARCHAR(255),
    direccion TEXT,
    logo_url TEXT,
    moneda VARCHAR(10) DEFAULT 'CLP',
    iva_porcentaje NUMERIC(5, 2) DEFAULT 19.00,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sucursales
CREATE TABLE IF NOT EXISTS sucursales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50),
    direccion TEXT,
    telefono VARCHAR(50),
    es_principal BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Perfiles de usuario (espejo de auth.users)
CREATE TABLE IF NOT EXISTS usuarios_perfil (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Relación Multi-empresa (Miembros / Roles)
CREATE TABLE IF NOT EXISTS miembros_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios_perfil(id) ON DELETE CASCADE,
    rol rol_usuario NOT NULL DEFAULT 'VENDEDOR',
    sucursal_asignada_id UUID REFERENCES sucursales(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (empresa_id, usuario_id)
);

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    rut_identificador VARCHAR(50),
    contacto_nombre VARCHAR(150),
    telefono VARCHAR(50),
    email VARCHAR(255),
    direccion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    rut_identificador VARCHAR(50),
    telefono VARCHAR(50),
    email VARCHAR(255),
    direccion TEXT,
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    sku VARCHAR(100) NOT NULL,
    codigo_barras VARCHAR(100),
    precio_compra NUMERIC(14, 2) NOT NULL DEFAULT 0,
    precio_venta NUMERIC(14, 2) NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    unidad_medida VARCHAR(50) DEFAULT 'unidad',
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (empresa_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_productos_empresa_barcode ON productos(empresa_id, codigo_barras);
CREATE INDEX IF NOT EXISTS idx_productos_empresa_sku ON productos(empresa_id, sku);
CREATE INDEX IF NOT EXISTS idx_productos_empresa_nombre ON productos(empresa_id, nombre);

-- Stock por Sucursal
CREATE TABLE IF NOT EXISTS stock_sucursal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    stock_actual INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (sucursal_id, producto_id)
);

-- Ventas
CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_id UUID NOT NULL REFERENCES sucursales(id),
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES usuarios_perfil(id),
    numero_folio BIGSERIAL,
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
    descuento NUMERIC(14, 2) NOT NULL DEFAULT 0,
    impuesto NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    metodo_pago metodo_pago_tipo NOT NULL DEFAULT 'EFECTIVO',
    estado estado_venta NOT NULL DEFAULT 'COMPLETADA',
    notas TEXT,
    fecha_venta TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ventas_empresa_fecha ON ventas(empresa_id, fecha_venta);

-- Detalle de Ventas
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(14, 2) NOT NULL,
    costo_unitario NUMERIC(14, 2) NOT NULL,
    descuento NUMERIC(14, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(14, 2) NOT NULL
);

-- Movimientos de Inventario (Kardex)
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_id UUID NOT NULL REFERENCES sucursales(id),
    producto_id UUID NOT NULL REFERENCES productos(id),
    usuario_id UUID REFERENCES usuarios_perfil(id),
    tipo tipo_movimiento NOT NULL,
    cantidad INT NOT NULL,
    stock_anterior INT NOT NULL,
    stock_posterior INT NOT NULL,
    motivo TEXT,
    venta_id UUID REFERENCES ventas(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos_inventario(producto_id, created_at);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) - CON LIMPIEZA PREVIA PARA EVITAR CONFLICTOS
-- ==============================================================================

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_sucursal ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;

-- Helper: Obtener empresas del usuario actual autenticado
CREATE OR REPLACE FUNCTION get_user_empresa_ids()
RETURNS TABLE (empresa_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT m.empresa_id
    FROM miembros_empresa m
    WHERE m.usuario_id = auth.uid() AND m.activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Eliminar políticas anteriores si existen para que nunca dé error 42710
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON usuarios_perfil;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios_perfil;
DROP POLICY IF EXISTS "Tenant empresas SELECT" ON empresas;
DROP POLICY IF EXISTS "Tenant sucursales ALL" ON sucursales;
DROP POLICY IF EXISTS "Tenant miembros_empresa SELECT" ON miembros_empresa;
DROP POLICY IF EXISTS "Tenant categorias ALL" ON categorias;
DROP POLICY IF EXISTS "Tenant proveedores ALL" ON proveedores;
DROP POLICY IF EXISTS "Tenant clientes ALL" ON clientes;
DROP POLICY IF EXISTS "Tenant productos ALL" ON productos;
DROP POLICY IF EXISTS "Tenant stock_sucursal ALL" ON stock_sucursal;
DROP POLICY IF EXISTS "Tenant ventas ALL" ON ventas;
DROP POLICY IF EXISTS "Tenant detalle_ventas ALL" ON detalle_ventas;
DROP POLICY IF EXISTS "Tenant movimientos_inventario ALL" ON movimientos_inventario;

-- Crear políticas limpias
CREATE POLICY "Usuarios pueden ver su propio perfil" 
    ON usuarios_perfil FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
    ON usuarios_perfil FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Tenant empresas SELECT" ON empresas 
    FOR SELECT USING (id IN (SELECT empresa_id FROM get_user_empresa_ids()));

CREATE POLICY "Tenant sucursales ALL" ON sucursales 
    FOR ALL USING (empresa_id IN (SELECT empresa_id FROM get_user_empresa_ids()));

CREATE POLICY "Tenant miembros_empresa SELECT" ON miembros_empresa 
    FOR SELECT USING (empresa_id IN (SELECT empresa_id FROM get_user_empresa_ids()) OR usuario_id = auth.uid());

CREATE POLICY "Tenant categorias ALL" ON categorias 
    FOR ALL USING (empresa_id IN (SELECT empresa_id FROM get_user_empresa_ids()));

CREATE POLICY "Tenant proveedores ALL" ON proveedores 
    FOR ALL USING (empresa_id IN (SELECT empresa_id FROM get_user_empresa_ids()));

CREATE POLICY "Tenant clientes ALL" ON clientes 
    FOR ALL USING (empresa_id IN (SELECT empresa_id FROM get_user_empresa_ids()));

CREATE POLICY "Tenant productos ALL" ON productos 
    FOR ALL USING (empresa_id IN (SELECT empresa_id FROM get_user_empresa_ids()));

CREATE POLICY "Tenant stock_sucursal ALL" ON stock_sucursal 
    FOR ALL USING (empresa_id IN (SELECT empresa_id FROM get_user_empresa_ids()));

CREATE POLICY "Tenant ventas ALL" ON ventas 
    FOR ALL USING (empresa_id IN (SELECT empresa_id FROM get_user_empresa_ids()));

CREATE POLICY "Tenant detalle_ventas ALL" ON detalle_ventas 
    FOR ALL USING (venta_id IN (SELECT id FROM ventas WHERE empresa_id IN (SELECT empresa_id FROM get_user_empresa_ids())));

CREATE POLICY "Tenant movimientos_inventario ALL" ON movimientos_inventario 
    FOR ALL USING (empresa_id IN (SELECT empresa_id FROM get_user_empresa_ids()));

-- ==============================================================================
-- 5. PROCEDIMIENTO TRANSACCIONAL ATÓMICO: REALIZAR VENTA (RPC)
-- ==============================================================================

CREATE OR REPLACE FUNCTION procesar_venta_pos(
    p_empresa_id UUID,
    p_sucursal_id UUID,
    p_usuario_id UUID,
    p_cliente_id UUID,
    p_subtotal NUMERIC,
    p_descuento NUMERIC,
    p_impuesto NUMERIC,
    p_total NUMERIC,
    p_metodo_pago metodo_pago_tipo,
    p_items JSONB
)
RETURNS UUID AS $$
DECLARE
    v_venta_id UUID;
    v_item JSONB;
    v_producto_id UUID;
    v_cantidad INT;
    v_precio_unitario NUMERIC;
    v_costo_unitario NUMERIC;
    v_descuento NUMERIC;
    v_item_subtotal NUMERIC;
    v_stock_actual INT;
    v_stock_posterior INT;
    v_nombre_producto TEXT;
BEGIN
    -- 1. Validar stock antes de procesar
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_producto_id := (v_item->>'producto_id')::UUID;
        v_cantidad := (v_item->>'cantidad')::INT;

        SELECT s.stock_actual, p.nombre 
        INTO v_stock_actual, v_nombre_producto
        FROM stock_sucursal s
        JOIN productos p ON p.id = s.producto_id
        WHERE s.sucursal_id = p_sucursal_id AND s.producto_id = v_producto_id
        FOR UPDATE;

        IF NOT FOUND OR v_stock_actual < v_cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto "%". Stock disponible: %, Cantidad requerida: %', 
                COALESCE(v_nombre_producto, 'Desconocido'), COALESCE(v_stock_actual, 0), v_cantidad;
        END IF;
    END LOOP;

    -- 2. Insertar venta
    INSERT INTO ventas (
        empresa_id,
        sucursal_id,
        cliente_id,
        usuario_id,
        subtotal,
        descuento,
        impuesto,
        total,
        metodo_pago,
        estado
    ) VALUES (
        p_empresa_id,
        p_sucursal_id,
        p_cliente_id,
        p_usuario_id,
        p_subtotal,
        p_descuento,
        p_impuesto,
        p_total,
        p_metodo_pago,
        'COMPLETADA'
    ) RETURNING id INTO v_venta_id;

    -- 3. Detalle, Kardex y descuento de stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_producto_id := (v_item->>'producto_id')::UUID;
        v_cantidad := (v_item->>'cantidad')::INT;
        v_precio_unitario := (v_item->>'precio_unitario')::NUMERIC;
        v_costo_unitario := (v_item->>'costo_unitario')::NUMERIC;
        v_descuento := COALESCE((v_item->>'descuento')::NUMERIC, 0);
        v_item_subtotal := (v_item->>'subtotal')::NUMERIC;

        SELECT stock_actual INTO v_stock_actual
        FROM stock_sucursal
        WHERE sucursal_id = p_sucursal_id AND producto_id = v_producto_id;

        v_stock_posterior := v_stock_actual - v_cantidad;

        INSERT INTO detalle_ventas (
            venta_id,
            producto_id,
            cantidad,
            precio_unitario,
            costo_unitario,
            descuento,
            subtotal
        ) VALUES (
            v_venta_id,
            v_producto_id,
            v_cantidad,
            v_precio_unitario,
            v_costo_unitario,
            v_descuento,
            v_item_subtotal
        );

        UPDATE stock_sucursal
        SET stock_actual = v_stock_posterior,
            updated_at = now()
        WHERE sucursal_id = p_sucursal_id AND producto_id = v_producto_id;

        INSERT INTO movimientos_inventario (
            empresa_id,
            sucursal_id,
            producto_id,
            usuario_id,
            tipo,
            cantidad,
            stock_anterior,
            stock_posterior,
            motivo,
            venta_id
        ) VALUES (
            p_empresa_id,
            p_sucursal_id,
            v_producto_id,
            p_usuario_id,
            'SALIDA_VENTA',
            -v_cantidad,
            v_stock_actual,
            v_stock_posterior,
            'Venta registrada POS',
            v_venta_id
        );
    END LOOP;

    RETURN v_venta_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de creación de perfil automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios_perfil (id, nombre_completo, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 9. POLÍTICAS DE ACCESO PÚBLICO Y SINCRONIZACIÓN REALTIME (PC + CELULAR)
-- ==============================================================================

-- Habilitar RLS permisivo
ALTER TABLE IF EXISTS empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS venta_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS movimientos_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clientes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow public all empresas" ON empresas FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public all sucursales" ON sucursales FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public all categorias" ON categorias FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public all proveedores" ON proveedores FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public all productos" ON productos FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public all ventas" ON ventas FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public all venta_detalles" ON venta_detalles FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public all movimientos_inventario" ON movimientos_inventario FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public all clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Habilitar Realtime para reflejo instantáneo en todos los dispositivos
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE productos, ventas, venta_detalles, movimientos_inventario, categorias, clientes, proveedores, empresas, sucursales;
EXCEPTION WHEN duplicate_object OR others THEN null; END $$;
