'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { formatCLP } from '@/lib/utils';
import { Users, Plus, Search, UserCheck, Phone, Mail, MapPin, DollarSign, ShoppingBag, X } from 'lucide-react';
import { Cliente } from '@/types/database.types';

export default function ClientesCRMPage() {
  const { clientes, ventas, agregarCliente } = useERP();
  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  // Formulario nuevo cliente
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;

    agregarCliente({
      empresa_id: 'current',
      nombre,
      rut_identificador: rut || null,
      telefono: telefono || null,
      email: email || null,
      direccion: direccion || null,
      notas: notas || null,
      activo: true,
    });

    setModalOpen(false);
    setNombre('');
    setRut('');
    setTelefono('');
    setEmail('');
    setDireccion('');
    setNotas('');
  };

  // Calcular métricas por cliente
  const getClienteMetricas = (clienteId: string) => {
    const comprasCliente = ventas.filter(v => v.cliente_id === clienteId);
    const totalGastado = comprasCliente.reduce((acc, v) => acc + v.total, 0);
    const cantidadCompras = comprasCliente.length;
    const ticketPromedio = cantidadCompras > 0 ? totalGastado / cantidadCompras : 0;

    return { totalGastado, cantidadCompras, ticketPromedio, comprasCliente };
  };

  const clientesFiltrados = clientes.filter(c => {
    if (!c.activo) return false;
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      c.nombre.toLowerCase().includes(q) ||
      (c.rut_identificador && c.rut_identificador.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Modal Nuevo Cliente */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Registrar Nuevo Cliente</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre o Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Distribuidora Central o Juan Pérez"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">RUT / Identificador</label>
                <input
                  type="text"
                  placeholder="Ej. 76.543.210-K"
                  value={rut}
                  onChange={e => setRut(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+56 9 1234 5678"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    placeholder="cliente@correo.cl"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Dirección</label>
                <input
                  type="text"
                  placeholder="Calle, número, comuna o ciudad"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Notas / Preferencias</label>
                <textarea
                  rows={2}
                  placeholder="Información adicional del cliente..."
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-md shadow-blue-500/20"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Gestión de Clientes (CRM)</h2>
            <p className="text-xs text-slate-500">Ficha 360°, recurrencia de compras y valor de vida del cliente (LTV).</p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre, RUT o email..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 text-xs bg-transparent outline-none placeholder:text-slate-400 text-slate-900"
        />
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          {clientesFiltrados.length} clientes
        </span>
      </div>

      {/* Grid de Tarjetas de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.map((c) => {
          const { totalGastado, cantidadCompras, ticketPromedio } = getClienteMetricas(c.id);

          return (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {c.rut_identificador || 'SIN RUT'}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {cantidadCompras} compras
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{c.nombre}</h3>

                <div className="space-y-1 text-xs text-slate-500">
                  {c.telefono && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {c.telefono}
                    </p>
                  )}
                  {c.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}
                    </p>
                  )}
                  {c.direccion && (
                    <p className="flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.direccion}
                    </p>
                  )}
                </div>
              </div>

              {/* Métricas Financieras del Cliente */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Comprado</span>
                  <span className="font-extrabold text-slate-900">{formatCLP(totalGastado)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket Medio</span>
                  <span className="font-bold text-blue-600">{formatCLP(ticketPromedio)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
