import React, { useState, useMemo } from "react";
import { X, Box, XCircle, Search } from "lucide-react";
import { useMaterialCreateModal } from "../hooks/useMaterialCreateModal";

const MaterialCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    proveedores,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
    envios,
  } = useMaterialCreateModal({ isOpen, onClose, onSubmit });

  const filteredEnvios = useMemo(() => {
    if (!searchTerm.trim()) return envios;
    return envios?.filter((envio) => {
      const searchString =
        `${envio.NombreEnvio} ${envio.Proveedor.NombreProveedor}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }, [envios, searchTerm]);

  const getInputBorderClass = (value) => {
    if (value && value.toString().trim() !== "") {
      return "border-green-400";
    }
    return "border-gray-300";
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-16 right-0 bottom-0 w-[448px] bg-white shadow-xl z-40
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isAnimating ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="flex-none border-b">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nuevo Material</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información Principal */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Información Principal
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Nombre del Material*
                  </label>
                  <input
                    type="text"
                    name="NombreMaterial"
                    value={formData.NombreMaterial}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.NombreMaterial)}`}
                  />
                  {errors.NombreMaterial && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.NombreMaterial}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Stock Inicial*
                  </label>
                  <input
                    type="number"
                    name="StockMaterial"
                    value={formData.StockMaterial}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-1.5 border rounded
    focus:ring-1 focus:ring-blue-500 focus:outline-none
    transition-colors duration-200
    ${getInputBorderClass(formData.StockMaterial)}`}
                  />
                  {errors.StockMaterial && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.StockMaterial}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Este será el stock inicial y original del material
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Precio Unitario*
                  </label>
                  <input
                    type="number"
                    name="PrecioMaterial"
                    value={formData.PrecioMaterial}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.PrecioMaterial)}`}
                  />
                  {errors.PrecioMaterial && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.PrecioMaterial}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="EstadoMaterial"
                    value={formData.EstadoMaterial}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.EstadoMaterial)}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="UbicacionMaterial"
                    value={formData.UbicacionMaterial}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.UbicacionMaterial)}`}
                  />
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Información Adicional
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    name="ColorMaterial"
                    value={formData.ColorMaterial || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.ColorMaterial)}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Peso</label>
                  <input
                    type="text"
                    name="PesoMaterial"
                    value={formData.PesoMaterial || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.PesoMaterial)}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Dimensiones
                  </label>
                  <input
                    type="text"
                    name="DimensionesMaterial"
                    value={formData.DimensionesMaterial || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.DimensionesMaterial)}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Proveedor
                  </label>
                  <select
                    name="Proveedor"
                    value={formData.Proveedor || ""}
                    onChange={handleInputChange}
                    disabled={formData.Envio ? true : false}
                    className={`w-full px-3 py-1.5 border rounded
      focus:ring-1 focus:ring-blue-500 focus:outline-none
      transition-colors duration-200
      ${formData.Envio ? "bg-gray-100" : ""}
      ${getInputBorderClass(formData.Proveedor)}`}
                  >
                    <option value="">Seleccione un proveedor</option>
                    {proveedores.map((proveedor) => (
                      <option
                        key={proveedor.id}
                        value={proveedor.id.toString()}
                      >
                        {proveedor.NombreProveedor}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Envío con búsqueda */}
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Envío
                  </label>
                  <div className="relative mt-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar envío o proveedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 pr-8 border rounded-t
          focus:ring-1 focus:ring-blue-500 focus:outline-none
          transition-colors duration-200"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <select
                      name="Envio"
                      value={formData.Envio || ""}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-b mt-0 border-t-0
        focus:ring-1 focus:ring-blue-500 focus:outline-none
        transition-colors duration-200
        ${getInputBorderClass(formData.Envio)}`}
                      size={4}
                    >
                      <option value="">Sin envío</option>
                      {filteredEnvios?.map((envio) => (
                        <option key={envio.id} value={envio.id.toString()}>
                          Envío: {envio.NombreEnvio} | Proveedor:{" "}
                          {envio.Proveedor.NombreProveedor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Detalles Adicionales
                  </label>
                  <textarea
                    name="DetalleMaterial"
                    value={formData.DetalleMaterial || ""}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.DetalleMaterial)}`}
                  />
                </div>
              </div>
            </div>

            {/* Foto del Material */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Foto del Material
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                  id="foto-material"
                />
                <label
                  htmlFor="foto-material"
                  className="px-3 py-1.5 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
                  transition-colors duration-150 text-sm"
                >
                  Seleccionar imagen
                </label>
                {previewUrl && (
                  <div className="relative group">
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="h-10 w-10 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFoto}
                        className="absolute -top-1 -right-1 bg-white rounded-full shadow-md 
                        hover:bg-gray-100 p-0.5 transition-colors duration-150"
                      >
                        <XCircle className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="text-xs mt-1 text-gray-500">
                      {formData.FotoMaterial?.name}
                    </div>
                  </div>
                )}
              </div>
              {errors.FotoMaterial && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.FotoMaterial}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Formatos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG. Máx: 10MB
              </p>
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                {errors.general}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none border-t bg-white p-4">
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm border rounded font-medium
                   hover:bg-gray-50
                   transition-all duration-150
                   disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-black text-white rounded font-medium
                   hover:bg-gray-800
                   transition-all duration-150
                   disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creando..." : "Crear Material"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialCreateModal;
