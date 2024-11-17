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
              Nuevo Envío
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

              {/* Nombre del Envío */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Nombre del Envío*
                </label>
                <input
                  type="text"
                  name="NombreEnvio"
                  value={formData.NombreEnvio}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border-2 rounded
      focus:ring-2 focus:ring-blue-500 focus:outline-none
      transition-colors duration-200
      ${getInputBorderClass(formData.NombreEnvio)}`}
                />
                {errors.NombreEnvio && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.NombreEnvio}
                  </p>
                )}
              </div>

              {/* Factura (nuevo campo) */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Factura
                </label>
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
                {errors.Factura && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.Factura}
                  </p>
                )}
              </div>

              {/* Tipo de Envío */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Tipo de Envío*
                </label>
                <select
                  name="TipoEnvio"
                  value={formData.TipoEnvio || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.TipoEnvio)}`}
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="material">Material</option>
                  <option value="herramienta">Herramienta</option>
                </select>
                {errors.TipoEnvio && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.TipoEnvio}
                  </p>
                )}
              </div>

              {/* Cantidad */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Cantidad*
                </label>
                <input
                  type="number"
                  name="CantidadEnvio"
                  value={formData.CantidadEnvio}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.CantidadEnvio)}`}
                />
                {errors.CantidadEnvio && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.CantidadEnvio}
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
                  name="PrecioEnvio"
                  value={formData.PrecioEnvio}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.PrecioEnvio)}`}
                />
                {errors.PrecioEnvio && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.PrecioEnvio}
                  </p>
                )}
              </div>

              {/* Proveedor */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Proveedor*
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
                {errors.Proveedor && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.Proveedor}
                  </p>
                )}
              </div>
            </div>

            {/* Campos opcionales */}
            <div className="space-y-3">
              <h3 className="font-medium">Información Adicional</h3>

              {/* Fecha de Compra */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  name="FechaCompraEnvio"
                  value={formData.FechaCompraEnvio || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.FechaCompraEnvio)}`}
                />
                <p className="text-xs text-gray-500 mt-0.5">
                  La fecha de compra se usará para calcular los días
                  transcurridos
                </p>
              </div>

              {/* Estado con nota informativa */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Estado del Envío
                </label>
                <div className="mt-0.5">
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
                    <span className="ml-1.5">Envío Recibido</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Al marcar como recibido, se detendrá el contador de días
                    transcurridos
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-medium block mb-0.5">
                  Descripción
                </label>
                <textarea
                  name="DescripcionEnvio"
                  value={formData.DescripcionEnvio || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-1.5 border-2 rounded
                    focus:ring-2 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.DescripcionEnvio)}`}
                />
              </div>
            </div>

            {/* Foto del Envío */}
            <div>
              <label className="text-sm font-medium block mb-0.5">
                Foto del Envío
              </label>
              <div className="mt-0.5 flex items-center space-x-4">
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
                      {formData.FotoEnvio?.name}
                    </div>
                  </div>
                )}
              </div>
              {errors.FotoEnvio && (
                <p className="text-xs text-red-500 mt-0.5">
                  {errors.FotoEnvio}
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

export default EnvioCreateModal;
