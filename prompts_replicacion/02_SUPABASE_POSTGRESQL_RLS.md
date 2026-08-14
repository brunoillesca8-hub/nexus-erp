# Prompt 02: Base de Datos PostgreSQL, Multi-Tenancy y Procedimiento Atómico

```text
Actúa como un Arquitecto de Bases de Datos PostgreSQL y Supabase.

Quiero que crees el script SQL maestro (100% idempotente y re-ejecutable con DROP POLICY IF EXISTS) para el esquema del ERP Multi-tenant con Row Level Security (RLS) y Stored Procedures transaccionales.

REQUERIMIENTOS DEL ESQUEMA SQL:
1. Extensiones y Enums:
   - uuid-ossp
   - rol_usuario: ('SUPERADMIN', 'ADMIN', 'VENDEDOR', 'INVENTARIO', 'ANALISTA')
   - estado_venta: ('COMPLETADA', 'ANULADA', 'PENDIENTE')
   - metodo_pago_tipo: ('EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'OTRO')
   - tipo_movimiento: ('ENTRADA_COMPRA', 'SALIDA_VENTA', 'DEVOLUCION_CLIENTE', 'DEVOLUCION_PROVEEDOR', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'MERMA_DANADO', 'TRANSFERENCIA_SALIDA', 'TRANSFERENCIA_ENTRADA')

2. Tablas del Sistema:
   - empresas (id UUID, nombre, rut_identificador, telefono, email, direccion, logo_url, moneda='CLP', iva_porcentaje=19.00, activo, created_at, updated_at)
   - sucursales (id UUID, empresa_id, nombre, codigo, direccion, telefono, es_principal, activo, created_at)
   - usuarios_perfil (id UUID referencias a auth.users, nombre_completo, email, avatar_url, created_at)
   - miembros_empresa (id UUID, empresa_id, usuario_id, rol, sucursal_asignada_id, activo, created_at, UNIQUE(empresa_id, usuario_id))
   - categorias (id UUID, empresa_id, nombre, descripcion, activo, created_at)
   - proveedores (id UUID, empresa_id, nombre, rut_identificador, contacto_nombre, telefono, email, direccion, activo, created_at)
   - clientes (id UUID, empresa_id, nombre, rut_identificador, telefono, email, direccion, notas, activo, created_at)
   - productos (id UUID, empresa_id, categoria_id, proveedor_id, nombre, descripcion, sku, codigo_barras, precio_compra, precio_venta, stock_minimo, unidad_medida, imagen_url, activo, created_at, updated_at, UNIQUE(empresa_id, sku))
   - stock_sucursal (id UUID, empresa_id, sucursal_id, producto_id, stock_actual, created_at, updated_at, UNIQUE(sucursal_id, producto_id))
   - ventas (id UUID, empresa_id, sucursal_id, cliente_id, usuario_id, numero_folio BIGSERIAL, subtotal, descuento, impuesto, total, metodo_pago, estado, notas, fecha_venta)
   - detalle_ventas (id UUID, venta_id, producto_id, cantidad, precio_unitario, costo_unitario, descuento, subtotal)
   - movimientos_inventario (id UUID, empresa_id, sucursal_id, producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_posterior, motivo, venta_id, created_at)

3. Índices de Alto Rendimiento:
   - productos(empresa_id, codigo_barras), productos(empresa_id, sku), productos(empresa_id, nombre)
   - ventas(empresa_id, fecha_venta)
   - movimientos_inventario(producto_id, created_at)

4. Políticas de Seguridad RLS:
   - Habilitar RLS en todas las tablas.
   - Función helper get_user_empresa_ids() para aislar tenants.
   - Políticas con DROP POLICY IF EXISTS para que no fallen si se vuelve a correr el script.

5. Procedimiento Atómico Transaccional (RPC): procesar_venta_pos(...)
   - Debe recibir los datos de la venta y un JSONB con los items.
   - Bloquear filas con FOR UPDATE para verificar stock. Si stock < cantidad solicitada, hacer RAISE EXCEPTION con mensaje claro.
   - Insertar en ventas.
   - Insertar en detalle_ventas congelando el costo_unitario histórico.
   - Descontar el stock en stock_sucursal.
   - Insertar el registro de Kardex en movimientos_inventario con tipo 'SALIDA_VENTA' y cantidad negativa.

6. Trigger automático handle_new_user() en auth.users para crear usuarios_perfil al registrarse.

Genera el archivo supabase/schema.sql completo y listo para correr en el SQL Editor.
```
