'use client';

import React from 'react';
import { useERP } from '@/context/erp-context';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function NotificationToast() {
  const { notificacion } = useERP();

  if (!notificacion) return null;

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    error: 'bg-rose-50 border-rose-300 text-rose-900',
    info: 'bg-blue-50 border-blue-300 text-blue-900',
  }[notificacion.tipo];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[notificacion.tipo];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-md ${bgStyles}`}>
        <Icon className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">{notificacion.mensaje}</p>
      </div>
    </div>
  );
}
