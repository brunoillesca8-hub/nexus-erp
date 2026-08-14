'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2, Laptop, Smartphone } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export function BarcodeScannerModal({ isOpen, onClose, onScanSuccess }: BarcodeScannerModalProps) {
  const [scannerActive, setScannerActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      setScannerActive(false);
      return;
    }

    const html5QrCode = new Html5Qrcode('barcode-camera-reader');
    scannerRef.current = html5QrCode;

    const config = {
      fps: 15,
      qrbox: { width: 280, height: 180 },
      aspectRatio: 1.777778,
    };

    // Intentar primero con cualquier cámara disponible (compatible con webcam de PC y celulares)
    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!cameras || cameras.length === 0) {
          throw new Error('No se detectaron cámaras en este dispositivo.');
        }

        // Si hay varias cámaras, buscar la trasera; si es PC/notebook, tomar la primera
        const selectedCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('trasera')) || cameras[cameras.length - 1];

        return html5QrCode.start(
          selectedCamera.id,
          config,
          (decodedText) => {
            setLastScanned(decodedText);
            onScanSuccess(decodedText);
            if (navigator.vibrate) {
              navigator.vibrate(100);
            }
          },
          () => {} // Ignorar frames vacíos
        );
      })
      .then(() => {
        setScannerActive(true);
        setErrorMsg(null);
      })
      .catch((err) => {
        console.error('Error al inicializar cámara:', err);
        // Fallback directo a cámara por defecto
        html5QrCode.start(
          { facingMode: 'user' },
          config,
          (decodedText) => {
            setLastScanned(decodedText);
            onScanSuccess(decodedText);
          },
          () => {}
        )
        .then(() => {
          setScannerActive(true);
          setErrorMsg(null);
        })
        .catch(() => {
          setErrorMsg('No se pudo acceder a la cámara. Asegúrate de permitir el acceso en tu navegador.');
          setScannerActive(false);
        });
      });

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Escáner de Cámara (PC, Laptop & Celular)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor de Cámara */}
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center min-h-[320px] relative">
          <div
            id="barcode-camera-reader"
            className="w-full rounded-xl overflow-hidden bg-black"
          />

          {errorMsg ? (
            <div className="p-4 bg-rose-900/40 border border-rose-500 rounded-xl text-rose-200 text-xs text-center flex flex-col items-center gap-2 m-4">
              <AlertCircle className="w-6 h-6 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          ) : !scannerActive ? (
            <div className="flex flex-col items-center gap-2 text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              <span>Conectando cámara del equipo...</span>
            </div>
          ) : null}

          {/* Animación de visor */}
          {scannerActive && (
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-24 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none flex items-center justify-center bg-blue-500/10">
              <span className="text-[11px] font-semibold text-white bg-slate-900/80 px-2 py-1 rounded">
                Alinea el código de barras aquí
              </span>
            </div>
          )}
        </div>

        {/* Notificación de último escaneo */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {lastScanned ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Código detectado: <strong className="font-mono">{lastScanned}</strong></span>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center">
              Apunta la cámara al código de barras del producto. Al detectarlo se agregará automáticamente al carrito.
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Listo / Volver al Punto de Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
