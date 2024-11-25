import React from "react";
import { X, XCircle, Search } from "lucide-react";
import { useHerramientaUpdateModal } from "../hooks/useHerramientaUpdateModal";

const HerramientaUpdateModal = ({
  isOpen,
  onClose,
  herramienta,
  onHerramientaUpdated,
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
  } = useHerramientaUpdateModal({
    isOpen,
    onClose,
    herramienta,
    onHerramientaUpdated,
  });

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
          <h2 className="text-lg font-semibold">Editar Herramienta</h2>
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
                    Nombre de la Herramienta*
                  </label>
                  <input
                    type="text"
                    name="NombreHerramienta"
                    value={formData.NombreHerramienta}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.NombreHerramienta)}`}
                  />
                  {errors.NombreHerramienta && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.NombreHerramienta}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Stock*
                  </label>
                  <input
                    type="number"
                    name="StockHerramienta"
                    value={formData.StockHerramienta}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.StockHerramienta)}`}
                  />
                  {errors.StockHerramienta && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.StockHerramienta}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Precio Unitario*
                  </label>
                  <input
                    type="number"
                    name="PrecioHerramienta"
                    value={formData.PrecioHerramienta}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.PrecioHerramienta)}`}
                  />
                  {errors.PrecioHerramienta && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.PrecioHerramienta}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    name="MarcaHerramienta"
                    value={formData.MarcaHerramienta}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.MarcaHerramienta)}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    name="ModeloHerramienta"
                    value={formData.ModeloHerramienta}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.ModeloHerramienta)}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="UbicacionHerramienta"
                    value={formData.UbicacionHerramienta}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.UbicacionHerramienta)}`}
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
                    Descripción
                  </label>
                  <textarea
                    name="DescripcionHerramienta"
                    value={formData.DescripcionHerramienta || ""}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.DescripcionHerramienta)}`}
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
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.Proveedor)}`}
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
                  <label className="text-sm font-medium block mb-1">
                    Envío
                  </label>
                  <div className="relative mt-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar envío o proveedor..."
                        value={searchEnvio}
                        onChange={(e) => setSearchEnvio(e.target.value)}
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
              </div>
            </div>

            {/* Foto de la Herramienta */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Foto de la Herramienta
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                  id="foto-herramienta"
                />
                <label
                  htmlFor="foto-herramienta"
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
                      {formData.FotoHerramienta instanceof File
                        ? formData.FotoHerramienta.name
                        : "Foto actual"}
                    </div>
                  </div>
                )}
              </div>
              {errors.FotoHerramienta && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.FotoHerramienta}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
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
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HerramientaUpdateModal;