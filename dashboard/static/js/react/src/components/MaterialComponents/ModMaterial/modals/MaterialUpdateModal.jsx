import React from "react";
import { X, XCircle, Search } from "lucide-react";
import { useMaterialUpdateModal } from "../hooks/useMaterialUpdateModal";

const MaterialUpdateModal = ({
  isOpen,
  onClose,
  material,
  onMaterialUpdated,
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
    proveedores,
    searchEnvio,
    setSearchEnvio,
    envios,
  } = useMaterialUpdateModal({
    isOpen,
    onClose,
    material,
    onMaterialUpdated,
  });

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
              Editar Material
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos obligatorios */}
            <div className="space-y-4">
              <h3 className="font-medium">Información Principal</h3>

              {/* Nombre del Material */}
              <div>
                <label className="text-sm font-medium">
                  Nombre del Material*
                </label>
                <input
                  type="text"
                  name="NombreMaterial"
                  value={formData.NombreMaterial}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${
                      formData.NombreMaterial
                        ? "border-green-400"
                        : "border-gray-300"
                    }`}
                />
                {errors.NombreMaterial && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.NombreMaterial}
                  </p>
                )}
              </div>

              {/* Stock y Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Stock*</label>
                  <input
                    type="number"
                    name="StockMaterial"
                    value={formData.StockMaterial}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border-2 rounded mt-1 
                      focus:ring-2 focus:ring-blue-500 focus:outline-none
                      transition-colors duration-200
                      ${
                        formData.StockMaterial !== ""
                          ? "border-green-400"
                          : "border-gray-300"
                      }`}
                  />
                  {errors.StockMaterial && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.StockMaterial}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Precio Unitario*
                  </label>
                  <input
                    type="number"
                    name="PrecioMaterial"
                    value={formData.PrecioMaterial}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border-2 rounded mt-1 
                      focus:ring-2 focus:ring-blue-500 focus:outline-none
                      transition-colors duration-200
                      ${
                        formData.PrecioMaterial
                          ? "border-green-400"
                          : "border-gray-300"
                      }`}
                  />
                  {errors.PrecioMaterial && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.PrecioMaterial}
                    </p>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="text-sm font-medium">Estado*</label>
                <select
                  name="EstadoMaterial"
                  value={formData.EstadoMaterial}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${
                      formData.EstadoMaterial
                        ? "border-green-400"
                        : "border-gray-300"
                    }`}
                >
                  <option value="">Seleccione un estado</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
                {errors.EstadoMaterial && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.EstadoMaterial}
                  </p>
                )}
              </div>

              {/* Ubicación */}
              <div>
                <label className="text-sm font-medium">Ubicación*</label>
                <input
                  type="text"
                  name="UbicacionMaterial"
                  value={formData.UbicacionMaterial}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${
                      formData.UbicacionMaterial
                        ? "border-green-400"
                        : "border-gray-300"
                    }`}
                />
                {errors.UbicacionMaterial && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.UbicacionMaterial}
                  </p>
                )}
              </div>
            </div>

            {/* Campos opcionales */}
            <div className="space-y-4">
              <h3 className="font-medium">Información Adicional</h3>

              {/* Color */}
              <div>
                <label className="text-sm font-medium">Color</label>
                <input
                  type="text"
                  name="ColorMaterial"
                  value={formData.ColorMaterial || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${
                      formData.ColorMaterial
                        ? "border-green-400"
                        : "border-gray-300"
                    }`}
                />
              </div>

              {/* Peso */}
              <div>
                <label className="text-sm font-medium">Peso</label>
                <input
                  type="text"
                  name="PesoMaterial"
                  value={formData.PesoMaterial || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${
                      formData.PesoMaterial
                        ? "border-green-400"
                        : "border-gray-300"
                    }`}
                />
              </div>

              {/* Dimensiones */}
              <div>
                <label className="text-sm font-medium">Dimensiones</label>
                <input
                  type="text"
                  name="DimensionesMaterial"
                  value={formData.DimensionesMaterial || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${
                      formData.DimensionesMaterial
                        ? "border-green-400"
                        : "border-gray-300"
                    }`}
                />
              </div>

              {/* Proveedor */}
              <div>
                <label className="text-sm font-medium">Proveedor</label>
                <select
                  name="Proveedor"
                  value={formData.Proveedor || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${
                      formData.Proveedor
                        ? "border-green-400"
                        : "border-gray-300"
                    }`}
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.NombreProveedor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Envío con búsqueda */}
              <div>
                <label className="text-sm font-medium">Envío</label>
                <div className="relative mt-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar envío o proveedor..."
                      value={searchEnvio}
                      onChange={(e) => setSearchEnvio(e.target.value)}
                      className="w-full px-3 py-2 pr-8 border-2 rounded
                        focus:ring-2 focus:ring-blue-500 focus:outline-none
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
                    className={`w-full px-3 py-2 border-2 rounded mt-2
                      focus:ring-2 focus:ring-blue-500 focus:outline-none
                      transition-colors duration-200
                      ${
                        formData.Envio ? "border-green-400" : "border-gray-300"
                      }`}
                    size={4}
                  >
                    <option value="">Sin envío</option>
                    {envios
                      .filter(
                        (envio) =>
                          envio.NombreEnvio.toLowerCase().includes(
                            searchEnvio.toLowerCase()
                          ) ||
                          envio.Proveedor.NombreProveedor.toLowerCase().includes(
                            searchEnvio.toLowerCase()
                          )
                      )
                      .map((envio) => (
                        <option key={envio.id} value={envio.id}>
                          Envío: {envio.NombreEnvio} | Proveedor:{" "}
                          {envio.Proveedor.NombreProveedor}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  name="DescripcionMaterial"
                  value={formData.DescripcionMaterial || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${
                      formData.DescripcionMaterial
                        ? "border-green-400"
                        : "border-gray-300"
                    }`}
                />
              </div>

              {/* Detalles */}
              <div>
                <label className="text-sm font-medium">
                  Detalles Adicionales
                </label>
                <textarea
                  name="DetalleMaterial"
                  value={formData.DetalleMaterial || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${
                      formData.DetalleMaterial
                        ? "border-green-400"
                        : "border-gray-300"
                    }`}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Foto del Material</label>
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
                  className="px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
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
                        className="h-16 w-16 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFoto}
                        className="absolute -top-2 -right-2 bg-white rounded-full shadow-md 
                          hover:bg-gray-100 p-0.5 transition-colors duration-150"
                      >
                        <XCircle className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    <div className="text-xs mt-1 text-gray-500">
                      {formData.FotoMaterial instanceof File
                        ? formData.FotoMaterial.name
                        : "Foto actual"}
                    </div>
                  </div>
                )}
              </div>
              {errors.FotoMaterial && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.FotoMaterial}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG. Tamaño
                máximo: 10MB
              </p>
            </div>

            {errors.general && (
              <div className="p-4 bg-red-50 text-red-600 rounded">
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
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialUpdateModal;
