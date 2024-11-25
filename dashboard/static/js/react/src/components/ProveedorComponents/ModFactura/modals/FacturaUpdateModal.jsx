import React from "react";
import { X, FileText, XCircle } from "lucide-react";
import { useFacturaUpdateModal } from "../hooks/useFacturaUpdateModal";

const FacturaUpdateModal = ({ isOpen, onClose, factura, onFacturaUpdated }) => {
  const {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    documentPreviewUrl,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleDocumentoChange,
    handleRemoveFoto,
    handleRemoveDocumento,
    proveedores,
  } = useFacturaUpdateModal({
    isOpen,
    onClose,
    factura,
    onFacturaUpdated,
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
          <h2 className="text-lg font-semibold">Editar Factura</h2>
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

              {/* Número de Factura */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Número de Factura*
                </label>
                <input
                  type="text"
                  name="NumeroFactura"
                  value={formData.NumeroFactura}
                  onChange={handleInputChange}
                  placeholder="Ingrese el número de factura"
                  className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.NumeroFactura)}`}
                />
                {errors.NumeroFactura && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.NumeroFactura}
                  </p>
                )}
              </div>

              {/* Fecha de Emisión */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Fecha de Emisión*
                </label>
                <input
                  type="date"
                  name="FechaEmision"
                  value={formData.FechaEmision}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.FechaEmision)}`}
                />
                {errors.FechaEmision && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.FechaEmision}
                  </p>
                )}
              </div>

              {/* Selector de Proveedor */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Proveedor*
                </label>
                <select
                  name="Proveedor"
                  value={formData.Proveedor}
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
                {errors.Proveedor && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.Proveedor}
                  </p>
                )}
              </div>
            </div>

            {/* Archivos */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Archivos</h3>

              {/* Foto de la Factura */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Foto de la Factura
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFotoChange}
                    className="hidden"
                    id="foto-factura-update"
                  />
                  <label
                    htmlFor="foto-factura-update"
                    className="px-3 py-1.5 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
                    transition-colors duration-150 text-sm"
                  >
                    Seleccionar imagen
                  </label>
                  {previewUrl && (
                    <div className="relative">
                      {formData.FotoFactura?.type?.startsWith("image/") ||
                      (!formData.FotoFactura?.type && previewUrl) ? (
                        <img
                          src={previewUrl}
                          alt="Vista previa"
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
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
                {errors.FotoFactura && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.FotoFactura}
                  </p>
                )}
              </div>

              {/* Documento de la Factura */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Documento de la Factura
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    onChange={handleDocumentoChange}
                    className="hidden"
                    id="documento-factura-update"
                  />
                  <label
                    htmlFor="documento-factura-update"
                    className="px-3 py-1.5 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
                    transition-colors duration-150 text-sm"
                  >
                    Seleccionar documento
                  </label>
                  {(documentPreviewUrl || formData.DocumentoFactura) && (
                    <div className="relative">
                      <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDocumento}
                        className="absolute -top-1 -right-1 bg-white rounded-full shadow-md 
                        hover:bg-gray-100 p-0.5 transition-colors duration-150"
                      >
                        <XCircle className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
                {errors.DocumentoFactura && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.DocumentoFactura}
                  </p>
                )}
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
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacturaUpdateModal;
