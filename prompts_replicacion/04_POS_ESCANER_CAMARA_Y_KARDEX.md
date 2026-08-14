# Prompt 04: Terminal Punto de Venta (POS), Escáner Cámara y Bloqueo de Stock Cero

```text
Actúa como un Especialista en Interfaces de Usuario y Sistemas de Punto de Venta (POS) para Retail.

Quiero implementar la pantalla de Terminal Punto de Venta (POS) en /ventas/nueva y el componente de escaneo de código de barras por cámara.

REQUERIMIENTOS CLAVE:
1. Componente de Escaneo de Cámara en src/components/pos/BarcodeScannerModal.tsx:
   - Utilizar html5-qrcode.
   - Detectar cámaras disponibles con Html5Qrcode.getCameras() para ser 100% compatible con webcams de computadores/laptops y cámaras traseras de celulares/tablets.
   - Animación de guía de centrado de código de barras.
   - Emitir vibración al escanear si el dispositivo lo soporta y callback onScanSuccess(codigo).

2. Página de Terminal POS en src/app/ventas/nueva/page.tsx:
   - Detección automática de Pistola Lectora USB / Bluetooth (captura secuencias de teclado terminadas en Enter mediante un listener global).
   - Botón destacado "Escanear con Cámara" que abre el BarcodeScannerModal.
   - Buscador rápido por Nombre, SKU o Código de barras.
   - Grilla de selección rápida de productos con badge de disponibilidad y bloqueo visual de productos AGOTADOS (stock = 0).
   - Carrito de compras lateral/inferior con controles (+, -, eliminar), subtotal por item y selector de cliente.
   - Selector de métodos de pago: Efectivo, Tarjeta de Débito, Tarjeta de Crédito, Transferencia.
   - REGLA DE NEGOCIO ESTRICTA: No permitir agregar ni vender productos si stock <= 0 o si la cantidad solicitada supera el stock disponible.
   - Cálculos en Pesos Chilenos (CLP) con subtotal, descuento e IVA (19%).
   - Al confirmar la venta:
     * Llamar a procesarVenta(...) del contexto.
     * Disparar confeti con canvas-confetti.
     * Abrir modal de Comprobante / Ticket con folio autoincrementable (desde el 100) y botón para imprimir (@media print).

3. Página de Historial de Ventas en src/app/ventas/page.tsx:
   - Tabla cronológica de ventas con filtro por folio #, cliente o medio de pago.
   - Visualizador de boletas y botón de reimpresión de comprobante.

Genera los componentes del Punto de Venta y el historial de ventas.
```
