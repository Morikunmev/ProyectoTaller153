import React, { useState, useMemo } from "react";
import { X, Package, XCircle, Search } from "lucide-react";
import { useEnvioCreateModal } from "../hooks/useEnvioCreateModal";

const EnvioCreateModal = ({ isOpen, onClose, onSubmit }) => {
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
    facturas,
  } = useEnvioCreateModal({ isOpen, onClose, onSubmit });

  // Filter facturas based on search term
  const filteredFacturas = useMemo(() => {
    if (!searchTerm.trim()) return facturas;

    return facturas?.filter((factura) => {
      const searchString =
        `${factura.NumeroFactura} ${factura.Proveedor.NombreProveedor}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }, [facturas, searchTerm]);

  const getInputBorderClass = (value) => {
    if (value && value.toString().trim() !== "") {
      return "border-green-400";
    }
    return "border-gray-300";
  };

  // Custom select component with search
  const InvoiceSelect = () => (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar factura o proveedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 border-2 rounded-t
            focus:ring-2 focus:ring-blue-500 focus:outline-none
            transition-colors duration-200 border-gray-300"
        />
      </div>
      <select
        name="Factura"
        value={formData.Factura || ""}
        onChange={handleInputChange}
        className={`w-full px-3 py-1.5 border-2 border-t-0 rounded-b
          focus:ring-2 focus:ring-blue-500 focus:outline-none
          transition-colors duration-200
          ${getInputBorderClass(formData.Factura)}`}
        size={5}
      >
        <option value="">Sin factura</option>
        {filteredFacturas?.map((factura) => (
          <option key={factura.id} value={factura.id.toString()}>
            Nro Factura: {factura.NumeroFactura} | Proveedor:{" "}
            {factura.Proveedor.NombreProveedor}
          </option>
        ))}
      </select>
    </div>
  );

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
          <h2 className="text-lg font-semibold">Nuevo Envío</h2>
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
            {/* Campos obligatorios */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Información Principal
              </h3>

              {/* Nombre del Envío */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Nombre del Envío*
                </label>
                <input
                  type="text"
                  name="NombreEnvio"
                  value={formData.NombreEnvio}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border rounded
                  focus:ring-1 focus:ring-blue-500 focus:outline-none
                  transition-colors duration-200
                  ${getInputBorderClass(formData.NombreEnvio)}`}
                />
                {errors.NombreEnvio && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.NombreEnvio}
                  </p>
                )}
              </div>

              {/* Factura */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Factura
                </label>
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar factura o proveedor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border rounded-t
                      focus:ring-1 focus:ring-blue-500 focus:outline-none
                      transition-colors duration-200 border-gray-300"
                    />
                    <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    name="Factura"
                    value={formData.Factura || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border border-t-0 rounded-b
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.Factura)}`}
                    size={4}
                  >
                    <option value="">Sin factura</option>
                    {filteredFacturas?.map((factura) => (
                      <option key={factura.id} value={factura.id.toString()}>
                        Nro Factura: {factura.NumeroFactura} | Proveedor:{" "}
                        {factura.Proveedor.NombreProveedor}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.Factura && (
                  <p className="text-xs text-red-500 mt-1">{errors.Factura}</p>
                )}
              </div>

              {/* Tipo de Envío */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Tipo de Envío*
                </label>
                <select
                  name="TipoEnvio"
                  value={formData.TipoEnvio || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border rounded
                  focus:ring-1 focus:ring-blue-500 focus:outline-none
                  transition-colors duration-200
                  ${getInputBorderClass(formData.TipoEnvio)}`}
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="material">Material</option>
                  <option value="herramienta">Herramienta</option>
                </select>
                {errors.TipoEnvio && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.TipoEnvio}
                  </p>
                )}
              </div>

              {/* Cantidad */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Cantidad*
                </label>
                <input
                  type="number"
                  name="CantidadEnvio"
                  value={formData.CantidadEnvio}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-1.5 border rounded
                  focus:ring-1 focus:ring-blue-500 focus:outline-none
                  transition-colors duration-200
                  ${getInputBorderClass(formData.CantidadEnvio)}`}
                />
                {errors.CantidadEnvio && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.CantidadEnvio}
                  </p>
                )}
              </div>

              {/* Precio */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Precio Unitario*
                </label>
                <input
                  type="number"
                  name="PrecioEnvio"
                  value={formData.PrecioEnvio}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-1.5 border rounded
                  focus:ring-1 focus:ring-blue-500 focus:outline-none
                  transition-colors duration-200
                  ${getInputBorderClass(formData.PrecioEnvio)}`}
                />
                {errors.PrecioEnvio && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.PrecioEnvio}
                  </p>
                )}
              </div>

              {/* Proveedor */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Proveedor*
                </label>
                <select
                  name="Proveedor"
                  value={formData.Proveedor || ""}
                  onChange={handleInputChange}
                  disabled={formData.Factura ? true : false}
                  className={`w-full px-3 py-1.5 border rounded
                  focus:ring-1 focus:ring-blue-500 focus:outline-none
                  transition-colors duration-200
                  ${formData.Factura ? "bg-gray-100" : ""}
                  ${getInputBorderClass(formData.Proveedor)}`}
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id.toString()}>
                      {proveedor.NombreProveedor}
                    </option>
                  ))}
                </select>
                {errors.Proveedor && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.Proveedor}
                  </p>
                )}
              </div>
            </div>

            {/* Campos opcionales */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Información Adicional
              </h3>

              {/* Fecha de Compra */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  name="FechaCompraEnvio"
                  value={formData.FechaCompraEnvio || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border rounded
                  focus:ring-1 focus:ring-blue-500 focus:outline-none
                  transition-colors duration-200
                  ${getInputBorderClass(formData.FechaCompraEnvio)}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  La fecha de compra se usará para calcular los días
                  transcurridos
                </p>
              </div>

              {/* Estado del Envío */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Estado del Envío
                </label>
                <div className="mt-1">
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
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-1"
                    />
                    <span className="ml-2 text-sm">Envío Recibido</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Al marcar como recibido, se detendrá el contador de días
                    transcurridos
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Descripción
                </label>
                <textarea
                  name="DescripcionEnvio"
                  value={formData.DescripcionEnvio || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-1.5 border rounded
                  focus:ring-1 focus:ring-blue-500 focus:outline-none
                  transition-colors duration-200
                  ${getInputBorderClass(formData.DescripcionEnvio)}`}
                />
              </div>

              {/* Foto del Envío */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Foto del Envío
                </label>
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
                    className="px-3 py-1.5 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
                    transition-colors duration-150 text-sm"
                  >
                    Seleccionar imagen
                  </label>
                  {previewUrl && (
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
                  )}
                </div>
                {errors.FotoEnvio && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.FotoEnvio}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG. Máx:
                  10MB
                </p>
              </div>
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
            {isSubmitting ? "Creando..." : "Crear Envío"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnvioCreateModal;
