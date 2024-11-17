import React from "react";
import { X, XCircle, Search } from "lucide-react";
import { useEnvioUpdateModal } from "../hooks/useEnvioUpdateModal";

const EnvioUpdateModal = ({ isOpen, onClose, envio, onEnvioUpdated }) => {
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
    searchFactura, // Agregar esto
    setSearchFactura, // Agregar esto
    facturas,
  } = useEnvioUpdateModal({
    isOpen,
    onClose,
    envio,
    onEnvioUpdated,
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
              Editar Envío
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            {/* Campos obligatorios */}
            <div className="space-y-4">
              <h3 className="font-medium">Información Principal</h3>

              {/* Nombre del Envío */}
              {/* Nombre del Envío */}
              <div>
                <label className="text-sm font-medium">Nombre del Envío*</label>
                <input
                  type="text"
                  name="NombreEnvio"
                  value={formData.NombreEnvio}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
              focus:ring-2 focus:ring-blue-500 focus:outline-none
              transition-colors duration-200
              ${formData.NombreEnvio ? "border-green-400" : "border-gray-300"}`}
                />
                {errors.NombreEnvio && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.NombreEnvio}
                  </p>
                )}
              </div>

              {/* Factura - Nuevo campo a agregar */}
              {/* Factura con búsqueda */}
              <div>
                <label className="text-sm font-medium">Factura</label>
                <div className="relative mt-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar factura o proveedor..."
                      value={searchFactura}
                      onChange={(e) => setSearchFactura(e.target.value)}
                      className="w-full px-3 py-2 pr-8 border-2 rounded
                  focus:ring-2 focus:ring-blue-500 focus:outline-none
                  transition-colors duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <select
                    name="Factura"
                    value={formData.Factura || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border-2 rounded mt-2
                focus:ring-2 focus:ring-blue-500 focus:outline-none
                transition-colors duration-200
                ${formData.Factura ? "border-green-400" : "border-gray-300"}`}
                    size={4}
                  >
                    <option value="">Sin factura</option>
                    {facturas
                      .filter(
                        (factura) =>
                          factura.NumeroFactura.toLowerCase().includes(
                            searchFactura.toLowerCase()
                          ) ||
                          factura.Proveedor.NombreProveedor.toLowerCase().includes(
                            searchFactura.toLowerCase()
                          )
                      )
                      .map((factura) => (
                        <option key={factura.id} value={factura.id}>
                          Nro Factura: {factura.NumeroFactura} | Proveedor:{" "}
                          {factura.Proveedor.NombreProveedor}
                        </option>
                      ))}
                  </select>
                </div>
                {errors.Factura && (
                  <p className="text-sm text-red-500 mt-1">{errors.Factura}</p>
                )}
              </div>

              {/* Tipo de Envío */}
              <div>
                <label className="text-sm font-medium">Tipo de Envío*</label>
                <select
                  name="TipoEnvio"
                  value={formData.TipoEnvio}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                            focus:ring-2 focus:ring-blue-500 focus:outline-none
                            transition-colors duration-200
                            ${
                              formData.TipoEnvio
                                ? "border-green-400"
                                : "border-gray-300"
                            }`}
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="material">Material</option>
                  <option value="herramienta">Herramienta</option>
                </select>
                {errors.TipoEnvio && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.TipoEnvio}
                  </p>
                )}
              </div>

              {/* Cantidad y Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cantidad*</label>
                  <input
                    type="number"
                    name="CantidadEnvio"
                    value={formData.CantidadEnvio}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border-2 rounded mt-1 
                              focus:ring-2 focus:ring-blue-500 focus:outline-none
                              transition-colors duration-200
                              ${
                                formData.CantidadEnvio
                                  ? "border-green-400"
                                  : "border-gray-300"
                              }`}
                  />
                  {errors.CantidadEnvio && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.CantidadEnvio}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Precio Unitario*
                  </label>
                  <input
                    type="number"
                    name="PrecioEnvio"
                    value={formData.PrecioEnvio}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border-2 rounded mt-1 
                              focus:ring-2 focus:ring-blue-500 focus:outline-none
                              transition-colors duration-200
                              ${
                                formData.PrecioEnvio
                                  ? "border-green-400"
                                  : "border-gray-300"
                              }`}
                  />
                  {errors.PrecioEnvio && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.PrecioEnvio}
                    </p>
                  )}
                </div>
              </div>

              {/* Proveedor */}
              <div>
                <label className="text-sm font-medium">Proveedor*</label>
                <select
                  name="Proveedor"
                  value={formData.Proveedor}
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
                {errors.Proveedor && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.Proveedor}
                  </p>
                )}
              </div>
            </div>

            {/* Campos opcionales */}
            <div className="space-y-4">
              <h3 className="font-medium">Información Adicional</h3>

              {/* Fecha de Compra */}
              <div>
                <label className="text-sm font-medium">Fecha de Compra</label>
                <input
                  type="date"
                  name="FechaCompraEnvio"
                  value={formData.FechaCompraEnvio || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                            focus:ring-2 focus:ring-blue-500 focus:outline-none
                            transition-colors duration-200
                            ${
                              formData.FechaCompraEnvio
                                ? "border-green-400"
                                : "border-gray-300"
                            }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  La fecha de compra se usará para calcular los días
                  transcurridos
                </p>
              </div>

              {/* Estado del Envío */}
              <div>
                <label className="text-sm font-medium">Estado del Envío</label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="EnvioRecibido"
                      checked={formData.EnvioRecibido}
                      onChange={(e) =>
                        handleInputChange({
                          target: {
                            name: "EnvioRecibido",
                            value: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">Envío Recibido</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Al marcar como recibido, se detendrá el contador de días
                    transcurridos
                  </p>
                </div>
              </div>

              {/* Días Transcurridos (solo mostrar) */}
              <div>
                <label className="text-sm font-medium">
                  Días Transcurridos
                </label>
                <div
                  className={`mt-2 px-3 py-2 rounded bg-gray-50 text-sm 
                              ${
                                formData.EnvioRecibido
                                  ? "text-gray-600"
                                  : formData.DiasTranscurridos > 30
                                  ? "text-red-600"
                                  : formData.DiasTranscurridos > 15
                                  ? "text-orange-600"
                                  : "text-blue-600"
                              }`}
                >
                  {formData.DiasTranscurridos} días
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  name="DescripcionEnvio"
                  value={formData.DescripcionEnvio || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                            focus:ring-2 focus:ring-blue-500 focus:outline-none
                            transition-colors duration-200
                            ${
                              formData.DescripcionEnvio
                                ? "border-green-400"
                                : "border-gray-300"
                            }`}
                />
              </div>
            </div>

            {/* Foto del Envío */}
            <div>
              <label className="text-sm font-medium">Foto del Envío</label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                  id="foto-envio"
                />
                <label
                  htmlFor="foto-envio"
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
                      {formData.FotoEnvio instanceof File
                        ? formData.FotoEnvio.name
                        : "Foto actual"}
                    </div>
                  </div>
                )}
              </div>
              {errors.FotoEnvio && (
                <p className="text-sm text-red-500 mt-1">{errors.FotoEnvio}</p>
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

export default EnvioUpdateModal;
