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

  // Filter envios based on search term
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
      className={`fixed inset-0 z-50 flex items-center justify-center
        transition-opacity duration-150
        ${isAnimating ? "bg-black/50" : "bg-black/0"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white w-full max-w-md rounded-lg shadow-xl my-8 flex flex-col max-h-[calc(100vh-4rem)]
          transition-all duration-150
          ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold w-full text-center">
              Nuevo Material
            </h2>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-150 absolute right-4"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Campos obligatorios */}
            <div className="space-y-3">
              <h3 className="font-medium">Información Principal</h3>

              {/* Nombre del Material */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Nombre del Material*
                </label>
                <input
                  type="text"
                  name="NombreMaterial"
                  value={formData.NombreMaterial}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.NombreMaterial)}`}
                />
                {errors.NombreMaterial && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.NombreMaterial}
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Stock*
                </label>
                <input
                  type="number"
                  name="StockMaterial"
                  value={formData.StockMaterial}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.StockMaterial)}`}
                />
                {errors.StockMaterial && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.StockMaterial}
                  </p>
                )}
              </div>

              {/* Precio */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Precio Unitario*
                </label>
                <input
                  type="number"
                  name="PrecioMaterial"
                  value={formData.PrecioMaterial}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.PrecioMaterial)}`}
                />
                {errors.PrecioMaterial && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.PrecioMaterial}
                  </p>
                )}
              </div>

              {/* Estado */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Estado*
                </label>
                <input
                  type="text"
                  name="EstadoMaterial"
                  value={formData.EstadoMaterial}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border-2 rounded
      focus:ring-2 focus:ring-blue-500 focus:outline-none
      transition-colors duration-200
      ${getInputBorderClass(formData.EstadoMaterial)}`}
                />
                {errors.EstadoMaterial && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.EstadoMaterial}
                  </p>
                )}
              </div>

              {/* Ubicación */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Ubicación*
                </label>
                <input
                  type="text"
                  name="UbicacionMaterial"
                  value={formData.UbicacionMaterial}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.UbicacionMaterial)}`}
                />
                {errors.UbicacionMaterial && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.UbicacionMaterial}
                  </p>
                )}
              </div>
            </div>

            {/* Campos opcionales */}
            <div className="space-y-3">
              <h3 className="font-medium">Información Adicional</h3>

              {/* Color */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Color
                </label>
                <input
                  type="text"
                  name="ColorMaterial"
                  value={formData.ColorMaterial || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.ColorMaterial)}`}
                />
              </div>

              {/* Peso */}
              <div>
                <label className="text-sm font-medium block mb-0.5">Peso</label>
                <input
                  type="text"
                  name="PesoMaterial"
                  value={formData.PesoMaterial || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.PesoMaterial)}`}
                />
              </div>

              {/* Dimensiones */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Dimensiones
                </label>
                <input
                  type="text"
                  name="DimensionesMaterial"
                  value={formData.DimensionesMaterial || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.DimensionesMaterial)}`}
                />
              </div>

              {/* Proveedor */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Proveedor
                </label>
                <select
                  name="Proveedor"
                  value={formData.Proveedor || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.Proveedor)}`}
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id.toString()}>
                      {proveedor.NombreProveedor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Envío */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Envío
                </label>
                <div className="relative">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar envío o proveedor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border-2 rounded-t
            focus:ring-2 focus:ring-blue-500 focus:outline-none
            transition-colors duration-200 border-gray-300"
                    />
                  </div>
                  <select
                    name="Envio"
                    value={formData.Envio || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border-2 border-t-0 rounded-b
          focus:ring-2 focus:ring-blue-500 focus:outline-none
          transition-colors duration-200
          ${getInputBorderClass(formData.Envio)}`}
                    size={5}
                  >
                    <option value="">Sin envío</option>
                    {filteredEnvios?.map((envio) => (
                      <option key={envio.id} value={envio.id.toString()}>
                        #{envio.id} - {envio.NombreEnvio} | Proveedor:{" "}
                        {envio.Proveedor.NombreProveedor}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Descripción
                </label>
                <textarea
                  name="DescripcionMaterial"
                  value={formData.DescripcionMaterial || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.DescripcionMaterial)}`}
                />
              </div>

              {/* Detalles */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Detalles Adicionales
                </label>
                <textarea
                  name="DetalleMaterial"
                  value={formData.DetalleMaterial || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.DetalleMaterial)}`}
                />
              </div>
            </div>

            {/* Foto del Material */}
            <div>
              <label className="text-sm font-medium block mb-0.5">
                Foto del Material
              </label>
              <div className="mt-0.5 flex items-center space-x-4">
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
                    transition-colors duration-150"
                >
                  Seleccionar imagen
                </label>
                {previewUrl && (
                  <div className="relative group">
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="h-12 w-12 object-cover rounded"
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
                    <div className="text-xs mt-0.5 text-gray-500">
                      {formData.FotoMaterial?.name}
                    </div>
                  </div>
                )}
              </div>
              {errors.FotoMaterial && (
                <p className="text-xs text-red-500 mt-0.5">
                  {errors.FotoMaterial}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG. Tamaño
                máximo: 10MB
              </p>
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                {errors.general}
              </div>
            )}
          </form>
        </div>
        {/* Footer */}
        <div className="p-6 border-t">
          <div className="flex justify-center space-x-16">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-8 py-2.5 border-2 border-gray-200 rounded-lg font-medium
                       hover:bg-gray-50 hover:border-gray-300
                       transition-all duration-150 w-36
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-black text-white rounded-lg font-medium
                       hover:bg-gray-800 shadow-sm hover:shadow
                       transition-all duration-150 w-36
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creando..." : "Crear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCreateModal;
