import React, { useState } from 'react';

const ProveedorForm = () => {
  const [formData, setFormData] = useState({
    NombreProveedor: '',
    RutProveedor: '',
    MarcaProveedor: '',
    ComentarioProveedor: '',
    CiudadProveedor: '',
    RegionProveedor: '',
    PaisProveedor: '',
    TelefonoProveedor: '',
    FotoProveedor: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, FotoProveedor: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-3">Registro de Proveedor</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Nombre*</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              name="NombreProveedor"
              value={formData.NombreProveedor}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">RUT*</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              name="RutProveedor"
              value={formData.RutProveedor}
              onChange={handleInputChange}
              pattern="^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$"
              placeholder="XX.XXX.XXX-X"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Marca*</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              name="MarcaProveedor"
              value={formData.MarcaProveedor}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Teléfono</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              name="TelefonoProveedor"
              value={formData.TelefonoProveedor}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Ciudad</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              name="CiudadProveedor"
              value={formData.CiudadProveedor}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Región</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              name="RegionProveedor"
              value={formData.RegionProveedor}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">País</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              name="PaisProveedor"
              value={formData.PaisProveedor}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Comentario</label>
          <textarea
            className="w-full border rounded px-2 py-1 text-sm"
            name="ComentarioProveedor"
            value={formData.ComentarioProveedor}
            onChange={handleInputChange}
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Foto</label>
          <input
            className="w-full text-sm"
            type="file"
            name="FotoProveedor"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white py-1.5 px-4 rounded text-sm hover:bg-blue-600"
        >
          Registrar Proveedor
        </button>
      </form>
    </div>
  );
};

export default ProveedorForm;