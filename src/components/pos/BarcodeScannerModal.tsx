'use client';

import React, { useEffect, useRef, useState, Component, ErrorInfo, ReactNode } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2, Barcode, ArrowRight } from 'lucide-react';

// Error Boundary a prueba de fallos para evitar que la página de Vercel se caiga
class ScannerErrorBoundary extends Component<{ children: ReactNode; onClose: () => void }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado en escáner:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border border-slate-200">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Cámara no disponible en este dispositivo</h3>
            <p className="text-xs text-slate-500">
              Usa una pistola lectora USB/Bluetooth o escribe el código directamente en el buscador del POS.
            </p>
            <button
              onClick={this.props.onClose}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

function BarcodeScannerModalInner({ isOpen, onClose, onScanSuccess }: BarcodeScannerModalProps) {
  const [scannerActive, setScannerActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [codigoManual, setCodigoManual] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
        } catch {
          // Ignore
        }
        scannerRef.current = null;
      }
      setScannerActive(false);
      setErrorMsg(null);
      return;
    }

    let isMounted = true;

    // Verificar si el navegador soporta mediaDevices
    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      setErrorMsg('Tu navegador no permite acceso directo a la cámara. Ingresa el código abajo.');
      return;
    }

    const elementId = 'barcode-camera-reader-box';

    const timer = setTimeout(async () => {
      try {
        const domEl = document.getElementById(elementId);
        if (!domEl) return;

        const html5QrCode = new Html5Qrcode(elementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });

        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 260, height: 130 },
          aspectRatio: 1.777778,
        };

        const onDecoded = (decodedText: string) => {
          if (!isMounted) return;
          setLastScanned(decodedText);
          onScanSuccess(decodedText);
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(100); } catch {}
          }
        };

        try {
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            onDecoded,
            () => {}
          );
          if (isMounted) {
            setScannerActive(true);
            setErrorMsg(null);
          }
        } catch {
          // Fallback a cámara frontal o primera disponible
          await html5QrCode.start(
            { facingMode: 'user' },
            config,
            onDecoded,
            () => {}
          );
          if (isMounted) {
            setScannerActive(true);
            setErrorMsg(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg('No se pudo abrir la cámara. Puedes escribir el código de barras abajo.');
          setScannerActive(false);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
        } catch {
          // Ignore
        }
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoManual.trim()) return;
    onScanSuccess(codigoManual.trim());
    setCodigoManual('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#2d3748] text-white">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm leading-tight">Escáner de Código de Barras</h3>
              <p className="text-[10px] text-slate-300">Apunta la cámara al código de barras</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor de Cámara */}
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
          <div
            id="barcode-camera-reader-box"
            className="w-full rounded-2xl overflow-hidden bg-black text-white"
          />

          {errorMsg ? (
            <div className="p-4 bg-rose-900/50 border border-rose-500 rounded-2xl text-rose-200 text-xs text-center flex flex-col items-center gap-2 m-2">
              <AlertCircle className="w-6 h-6 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          ) : !scannerActive ? (
            <div className="flex flex-col items-center gap-2 text-slate-400 text-xs py-10">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              <span>Iniciando visor de cámara...</span>
            </div>
          ) : null}

          {/* Guía de enfoque */}
          {scannerActive && (
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-20 border-2 border-dashed border-emerald-400 rounded-xl pointer-events-none flex items-center justify-center bg-emerald-500/10">
              <span className="text-[10px] font-bold text-emerald-300 bg-slate-900/90 px-2 py-0.5 rounded-full">
                Centra el código aquí
              </span>
            </div>
          )}
        </div>

        {/* Footer con entrada manual */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          {lastScanned && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Detectado: <strong className="font-mono">{lastScanned}</strong> (Agregado)</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
              Ingreso rápido por código o pistola lectora:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Ej. 780000000317 o SKU..."
                value={codigoManual}
                onChange={e => setCodigoManual(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#2d3748] hover:bg-[#1a202c] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Agregar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Listo / Volver
          </button>
        </div>

      </div>
    </div>
  );
}

export function BarcodeScannerModal(props: BarcodeScannerModalProps) {
  return (
    <ScannerErrorBoundary onClose={props.onClose}>
      <BarcodeScannerModalInner {...props} />
    </ScannerErrorBoundary>
  );
}
