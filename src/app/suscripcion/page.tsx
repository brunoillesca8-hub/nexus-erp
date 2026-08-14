'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { formatCLP } from '@/lib/utils';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Building2, 
  Clock, 
  ArrowRight,
  CheckCircle2,
  Lock,
  BadgeCheck
} from 'lucide-react';

interface Plan {
  id: string;
  nombre: string;
  precioMensualCLP: number;
  precioAnualCLP: number;
  popular?: boolean;
  descripcion: string;
  caracteristicas: string[];
}

const PLANES_SISTEMA: Plan[] = [
  {
    id: 'basico',
    nombre: 'Plan Emprendedor',
    precioMensualCLP: 29900,
    precioAnualCLP: 299000,
    descripcion: 'Para almacenes, tiendas y locales que están digitalizando sus ventas.',
    caracteristicas: [
      '1 Local Comercial / Sucursal',
      'Hasta 2.000 productos (SKUs)',
      'Terminal Punto de Venta (POS) ilimitado',
      'Lector de código USB & Cámara de celular',
      'Control de Stock y Kardex de movimientos',
      'Gestión de Clientes y Proveedores',
      'Soporte estándar por correo',
    ],
  },
  {
    id: 'pro',
    nombre: 'Plan Profesional & Analítica',
    precioMensualCLP: 49900,
    precioAnualCLP: 499000,
    popular: true,
    descripcion: 'El plan más completo con inteligencia de inventario para maximizar ganancias.',
    caracteristicas: [
      'Todo lo del Plan Emprendedor',
      'Hasta 15.000 productos (SKUs)',
      'Políticas Cuantitativas ROP, Q y Stock Seguridad (SS)',
      'Matriz Analítica ABC - XYZ de Pareto',
      'Gráfica diaria en tiempo real Top 10 Productos',
      'Análisis de Rentabilidad 80/20 y descarga en Excel',
      'Informes Ejecutivos Semanales y Mensuales en PDF',
      'Colaboradores simultáneos ilimitados',
      'Soporte prioritario por WhatsApp',
    ],
  },
  {
    id: 'multi',
    nombre: 'Plan Cadena & Multi-Sucursal',
    precioMensualCLP: 79900,
    precioAnualCLP: 799000,
    descripcion: 'Para empresas con múltiples tiendas, bodegas y centros de distribución.',
    caracteristicas: [
      'Todo lo del Plan Profesional',
      'Sucursales y bodegas ilimitadas',
      'SKUs y catálogo sin límite',
      'Transferencias de stock entre sucursales',
      'Consolidación financiera multi-empresa',
      'Capacitación inicial 1 a 1 para tu equipo',
      'Acceso temprano a nuevas actualizaciones',
    ],
  },
];

export default function SuscripcionPage() {
  const { empresa, mostrarNotificacion } = useERP();
  const [cicloAnual, setCicloAnual] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan | null>(null);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [pasoExitoso, setPasoExitoso] = useState(false);

  // Estado de suscripción activa simulada
  const [suscripcionActual, setSuscripcionActual] = useState({
    planId: 'pro',
    nombrePlan: 'Plan Profesional & Analítica',
    estado: 'ACTIVA',
    diasRestantes: 28,
    proximaRenovacion: new Date(Date.now() + 86400000 * 28).toLocaleDateString('es-CL'),
  });

  const handleSeleccionarPlan = (plan: Plan) => {
    setPlanSeleccionado(plan);
    setModalPagoOpen(true);
  };

  const handleConfirmarSuscripcion = () => {
    if (!planSeleccionado) return;
    setSuscripcionActual({
      planId: planSeleccionado.id,
      nombrePlan: planSeleccionado.nombre,
      estado: 'ACTIVA',
      diasRestantes: cicloAnual ? 365 : 30,
      proximaRenovacion: new Date(Date.now() + 86400000 * (cicloAnual ? 365 : 30)).toLocaleDateString('es-CL'),
    });
    setPasoExitoso(true);
    setTimeout(() => {
      setPasoExitoso(false);
      setModalPagoOpen(false);
      mostrarNotificacion(`¡Te has suscrito exitosamente al ${planSeleccionado.nombre}!`, 'success');
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Modal de Pasarela de Pago */}
      {modalPagoOpen && planSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            {pasoExitoso ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">¡Suscripción Activada!</h3>
                <p className="text-xs text-slate-500">Tu plan ha sido actualizado correctamente. Disfruta de todas las funciones.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Confirmar Suscripción</h3>
                    <p className="text-xs text-slate-500">{planSeleccionado.nombre}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {cicloAnual ? 'Pago Anual (Ahorro 2 meses)' : 'Mensual Recurrente'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Empresa:</span>
                    <strong className="text-slate-900">{empresa.nombre}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Período:</span>
                    <span>{cicloAnual ? '12 meses' : '1 mes'}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Monto a Facturar:</span>
                    <span className="text-blue-600">
                      {formatCLP(cicloAnual ? planSeleccionado.precioAnualCLP : planSeleccionado.precioMensualCLP)}
                    </span>
                  </div>
                </div>

                {/* Métodos de Pago Disponibles en Chile */}
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-slate-700 block">Medio de Pago Integrado (Webpay / Tarjeta):</label>
                  <div className="p-3 bg-white border-2 border-blue-600 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Tarjeta de Débito / Crédito (Webpay Plus)</span>
                    </div>
                    <BadgeCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Transacción encriptada y segura mediante pasarela SSL.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setModalPagoOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarSuscripcion}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Activar Suscripción
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header & Estado Actual */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Suscripción & Planes SaaS</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestiona la licencia comercial y los módulos habilitados para <strong className="text-slate-800">{empresa.nombre}</strong>.
          </p>
        </div>

        {/* Tarjeta de Estado Actual */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-blue-400">{suscripcionActual.nombrePlan}</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {suscripcionActual.estado}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Próxima renovación: <strong>{suscripcionActual.proximaRenovacion}</strong></p>
          </div>
        </div>
      </div>

      {/* Selector Mensual / Anual */}
      <div className="flex items-center justify-center gap-3 text-xs font-bold">
        <span className={!cicloAnual ? 'text-slate-900 font-black' : 'text-slate-400'}>Pago Mensual</span>
        <button
          onClick={() => setCicloAnual(!cicloAnual)}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
            cicloAnual ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-md" />
        </button>
        <span className={cicloAnual ? 'text-slate-900 font-black' : 'text-slate-400'}>
          Pago Anual <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] ml-1">2 Meses Gratis</span>
        </span>
      </div>

      {/* Tarjetas de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANES_SISTEMA.map((plan) => {
          const precio = cicloAnual ? plan.precioAnualCLP : plan.precioMensualCLP;
          const esPlanActual = suscripcionActual.planId === plan.id;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all relative ${
                plan.popular 
                  ? 'border-blue-600 shadow-xl ring-2 ring-blue-600/20 -translate-y-1' 
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                  Recomendado para Negocios
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{plan.nombre}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[34px] leading-relaxed">{plan.descripcion}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{formatCLP(precio)}</span>
                    <span className="text-xs font-semibold text-slate-400">/{cicloAnual ? 'año' : 'mes'}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  {plan.caracteristicas.map((car, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{car}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSeleccionarPlan(plan)}
                  disabled={esPlanActual}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    esPlanActual
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                      : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 active:scale-98'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                  }`}
                >
                  {esPlanActual ? (
                    <>
                      <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      <span>Tu Plan Actual Activo</span>
                    </>
                  ) : (
                    <>
                      <span>Elegir {plan.nombre}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
