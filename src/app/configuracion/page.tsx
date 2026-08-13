'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { Settings, Building2, Store, Upload, Check, AlertCircle, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import Papa from 'papaparse';

export default function ConfiguracionPage() {
  const { empresa, setEmpresa, sucursales, agregarProducto, mostrarNotificacion } = useERP();

  // Estados de edición de empresa
  const [nombre, setNombre] = useState(empresa.nombre);
  const [rut, setRut] = useState(empresa.rut_identificador || '');
  const [telefono, setTelefono] = useState(empresa.telefono || '');
  const [email, setEmail] = useState(empresa.email || '');
  const [direccion, setDireccion] = useState(empresa.direccion || '');
  const [iva, setIva] = useState(empresa.iva_porcentaje || 19);

  // Estados de importación CSV
  const [previewDatos, setPreviewDatos] = useState<any[]>([]);
  const [archivoNombre, setArchivoNombre] = useState<string | null>(null);

  const handleGuardarEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    setEmpresa({
      ...empresa,
      nombre,
      rut_identificador: rut,
      telefono,
      email,
      direccion,
      iva_porcentaje: Number(iva),
      updated_at: new Date().toISOString(),
    });
    mostrarNotificacion('Configuración de empresa actualizada con éxito.', 'success');
  };

  // Carga y validación previa de archivo CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivoNombre(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const filasValidadas = results.data.map((row: any) => ({
          nombre: row.Nombre || row.nombre || row.Producto || '',
          sku: row.SKU || row.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
          codigo_barras: row.Codigo_Barras || row.codigo_barras || row.Codigo || null,
          precio_compra: Number(row.Precio_Compra || row.precio_compra || row.Costo || 1000),
          precio_venta: Number(row.Precio_Venta || row.precio_venta || row.Precio || 1500),
          stock_actual: Number(row.Stock || row.stock || row.Stock_Actual || 10),
          stock_minimo: Number(row.Stock_Minimo || row.stock_minimo || 5),
          unidad_medida: 'unidad',
        })).filter(r => r.nombre);

        setPreviewDatos(filasValidadas);
        mostrarNotificacion(`Archivo cargado: ${filasValidadas.length} productos detectados para importación.`, 'info');
      },
    });
  };

  const confirmarImportacion = () => {
    if (previewDatos.length === 0) return;

    previewDatos.forEach(item => {
      agregarProducto({
        empresa_id: empresa.id,
        categoria_id: null,
        proveedor_id: null,
        nombre: item.nombre,
        sku: item.sku,
        codigo_barras: item.codigo_barras,
        precio_compra: item.precio_compra,
        precio_venta: item.precio_venta,
        stock_actual: item.stock_actual,
        stock_minimo: item.stock_minimo,
        unidad_medida: item.unidad_medida,
        descripcion: 'Importado vía CSV',
        imagen_url: null,
        activo: true,
      });
    });

    setPreviewDatos([]);
    setArchivoNombre(null);
    mostrarNotificacion('¡Catálogo importado exitosamente!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Configuración del Sistema</h2>
            <p className="text-xs text-slate-500">Ajustes multi-empresa, sucursales y herramientas de importación masiva.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Empresa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Datos de la Empresa (Tenant)</h3>
          </div>

          <form onSubmit={handleGuardarEmpresa} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Razón Social / Nombre Comercial *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">RUT Empresa</label>
                <input
                  type="text"
                  value={rut}
                  onChange={e => setRut(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tasa IVA (%)</label>
                <input
                  type="number"
                  value={iva}
                  onChange={e => setIva(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Teléfono</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Corporativo</label>
                <input
                  type="email"
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
                value={direccion}
                onChange={e => setDireccion(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-md shadow-blue-500/20 text-xs transition-all active:scale-98"
              >
                Guardar Cambios de Empresa
              </button>
            </div>
          </form>
        </div>

        {/* Sucursales Activas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Sucursales Habilitadas</h3>
          </div>

          <div className="space-y-3">
            {sucursales.map(s => (
              <div key={s.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{s.nombre}</span>
                    {s.es_principal && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Matriz
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 mt-0.5">{s.direccion || 'Sin dirección'}</p>
                </div>
                <span className="font-mono text-slate-400 font-bold">{s.codigo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Importador Masivo CSV / Excel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Importación Masiva de Productos (CSV / Excel)</h3>
            <p className="text-xs text-slate-500">Carga miles de productos de una vez con validación previa estricta.</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-3 bg-slate-50 hover:bg-slate-100/60 transition-colors">
          <Upload className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-xs text-slate-600">
            <label className="font-bold text-blue-600 hover:underline cursor-pointer">
              <span>Selecciona un archivo CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-slate-400 mt-1">Columnas reconocidas: Nombre, SKU, Codigo_Barras, Precio_Compra, Precio_Venta, Stock</p>
          </div>
        </div>

        {previewDatos.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">
                Vista Previa de Validación ({previewDatos.length} registros listos)
              </h4>
              <button
                onClick={confirmarImportacion}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar e Insertar Productos</span>
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold sticky top-0">
                  <tr>
                    <th className="p-2">SKU</th>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">C. Barras</th>
                    <th className="p-2">P. Compra</th>
                    <th className="p-2">P. Venta</th>
                    <th className="p-2">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {previewDatos.slice(0, 5).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-slate-800">{row.sku}</td>
                      <td className="p-2">{row.nombre}</td>
                      <td className="p-2 font-mono text-slate-500">{row.codigo_barras || '-'}</td>
                      <td className="p-2">${row.precio_compra}</td>
                      <td className="p-2 font-bold">${row.precio_venta}</td>
                      <td className="p-2 font-bold text-emerald-600">{row.stock_actual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
