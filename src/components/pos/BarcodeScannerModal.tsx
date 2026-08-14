'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2, Laptop, Smartphone, Barcode, ArrowRight } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export function BarcodeScannerModal({ isOpen, onClose, onScanSuccess }: BarcodeScannerModalProps) {
  const [scannerActive, setScannerActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [codigoManual, setCodigoManual] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setScannerActive(false);
      setErrorMsg(null);
      return;
    }

    let isMounted = true;

    // Configuración con soporte EXPLÍCITO para códigos de barra 1D (EAN-13, CODE-128, etc.)
    const html5QrCode = new Html5Qrcode('barcode-camera-reader', {
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
      fps: 20,
      qrbox: { width: 280, height: 140 }, // Rectángulo horizontal óptimo para códigos de barra
      aspectRatio: 1.777778,
    };

    const iniciarCamara = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          throw new Error('No se detectaron cámaras en este dispositivo.');
        }

        // Preferir cámara trasera en celulares, o la primera disponible en PC
        const camaraSeleccionada = cameras.find(c => 
          c.label.toLowerCase().includes('back') || 
          c.label.toLowerCase().includes('trasera') ||
          c.label.toLowerCase().includes('rear') ||
          c.label.toLowerCase().includes('environment')
        ) || cameras[cameras.length - 1];

        if (!isMounted) return;

        await html5QrCode.start(
          camaraSeleccionada.id,
          config,
          (decodedText) => {
            if (!isMounted) return;
            setLastScanned(decodedText);
            onScanSuccess(decodedText);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(100);
            }
          },
          () => {} // Callback silencioso para frames no leídos
        );

        if (isMounted) {
          setScannerActive(true);
          setErrorMsg(null);
        }
      } catch (err: any) {
        console.warn('Fallo cámara primaria, intentando modo general:', err);
        try {
          if (!isMounted) return;
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              if (!isMounted) return;
              setLastScanned(decodedText);
              onScanSuccess(decodedText);
            },
            () => {}
          );
          if (isMounted) {
            setScannerActive(true);
            setErrorMsg(null);
          }
        } catch (fallbackErr: any) {
          if (isMounted) {
            setErrorMsg('Permite el acceso a la cámara en tu navegador o ingresa el código manualmente abajo.');
            setScannerActive(false);
          }
        }
      }
    };

    // Pequeño timeout para asegurar que el elemento DOM #barcode-camera-reader esté renderizado
    const timer = setTimeout(() => {
      iniciarCamara();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {}).finally(() => {
          html5QrCode.clear();
        });
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
              <h3 className="font-bold text-sm leading-tight">Escáner de Código de Barras (EAN-13 & 1D)</h3>
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
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden">
          <div
            id="barcode-camera-reader"
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
              <span>Conectando cámara del dispositivo...</span>
            </div>
          ) : null}

          {/* Guía visual para centrar códigos de barra 1D */}
          {scannerActive && (
            <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 h-24 border-2 border-dashed border-emerald-400 rounded-xl pointer-events-none flex items-center justify-center bg-emerald-500/10">
              <span className="text-[10px] font-bold text-emerald-300 bg-slate-900/90 px-2.5 py-1 rounded-full shadow-md">
                Centra el código de barras aquí
              </span>
            </div>
          )}
        </div>

        {/* Footer & Entrada de Código Manual de Respaldo */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          {lastScanned && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Código detectado: <strong className="font-mono">{lastScanned}</strong> (Agregado)</span>
            </div>
          )}

          {/* Formulario rápido de ingreso manual o pistoleo */}
          <form onSubmit={handleManualSubmit} className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
              ¿O prefieres tipear / pistolear el código?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
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
            className="w-full py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Listo / Volver al Carrito
          </button>
        </div>

      </div>
    </div>
  );
}
