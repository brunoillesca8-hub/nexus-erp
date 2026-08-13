'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { Truck, Plus, Search, Phone, Mail, MapPin, User, X } from 'lucide-react';

export default function ProveedoresPage() {
  const { proveedores, agregarProveedor } = useERP();
  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;

    agregarProveedor({
      empresa_id: 'current',
      nombre,
      rut_identificador: rut || null,
      contacto_nombre: contacto || null,
      telefono: telefono || null,
      email: email || null,
      direccion: direccion || null,
      activo: true,
    });

    setModalOpen(false);
    setNombre('');
    setRut('');
    setContacto('');
    setTelefono('');
    setEmail('');
    setDireccion('');
  };

  const proveedoresFiltrados = proveedores.filter(p => {
    if (!p.activo) return false;
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      p.nombre.toLowerCase().includes(q) ||
      (p.rut_identificador && p.rut_identificador.toLowerCase().includes(q)) ||
      (p.contacto_nombre && p.contacto_nombre.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Modal Nuevo Proveedor */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Registrar Proveedor</h3>
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
                <label className="font-bold text-slate-700">Nombre / Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cervecería Kunstmann o Colun"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">RUT Proveedor</label>
                <input
                  type="text"
                  placeholder="Ej. 96.123.456-7"
                  value={rut}
                  onChange={e => setRut(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Persona de Contacto</label>
                <input
                  type="text"
                  placeholder="Ej. Rodrigo Silva"
                  value={contacto}
                  onChange={e => setContacto(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+56 63 2223344"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    placeholder="ventas@proveedor.cl"
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
                  placeholder="Dirección casa matriz o centro de distribución"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
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
                  Guardar Proveedor
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
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Gestión de Proveedores</h2>
            <p className="text-xs text-slate-500">Contactos comerciales, distribución y órdenes de reabastecimiento.</p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Grid de Proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proveedoresFiltrados.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {p.rut_identificador || 'SIN RUT'}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Activo
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm">{p.nombre}</h3>

            <div className="space-y-1 text-xs text-slate-500">
              {p.contacto_nombre && (
                <p className="flex items-center gap-1.5 font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400" /> {p.contacto_nombre}
                </p>
              )}
              {p.telefono && (
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {p.telefono}
                </p>
              )}
              {p.email && (
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {p.email}
                </p>
              )}
              {p.direccion && (
                <p className="flex items-center gap-1.5 line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {p.direccion}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
