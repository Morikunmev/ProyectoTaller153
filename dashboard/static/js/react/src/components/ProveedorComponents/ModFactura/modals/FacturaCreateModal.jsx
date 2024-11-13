import React from "react";
import { X, FileText } from "lucide-react";
import { useFacturaCreateModal } from "../hooks/useFacturaCreateModal";

const FacturaCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    documentPreviewUrl,
    proveedores,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleDocumentoChange,
  } = useFacturaCreateModal({ isOpen, onClose, onSubmit });

  const getInputBorderClass = (value) => {
    if (value && value.trim() !== "") {
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
              Nueva Factura
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

              {/* Fecha de Emisión */}
              <div>
                <label className="text-sm font-medium">Fecha de Emisión*</label>
                <input
                  type="date"
                  name="FechaEmision"
                  value={formData.FechaEmision}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
                            focus:ring-2 focus:ring-blue-500 focus:outline-none
                            transition-colors duration-200
                            ${getInputBorderClass(formData.FechaEmision)}`}
                />
                {errors.FechaEmision && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.FechaEmision}
                  </p>
                )}
              </div>

              {/* Selector de Proveedor */}
              <div>
                <label className="text-sm font-medium">Proveedor*</label>
                <select
                  name="Proveedor"
                  value={formData.Proveedor || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border-2 rounded mt-1 
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
                  <p className="text-sm text-red-500 mt-1">
                    {errors.Proveedor}
                  </p>
                )}
              </div>
            </div>

            {/* Foto de la Factura */}
            <div>
              <label className="text-sm font-medium">Foto de la Factura</label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFotoChange}
                  className="hidden"
                  id="foto-factura"
                />
                <label
                  htmlFor="foto-factura"
                  className="px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
                           transition-colors duration-150"
                >
                  Seleccionar imagen
                </label>
                {previewUrl && (
                  <div className="relative group">
                    {formData.FotoFactura?.type.startsWith("image/") ? (
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="h-16 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded">
                        <span className="text-xs text-gray-500">PDF</span>
                      </div>
                    )}
                    <div className="text-xs mt-1 text-gray-500">
                      {formData.FotoFactura?.name}
                    </div>
                  </div>
                )}
              </div>
              {errors.FotoFactura && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.FotoFactura}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG, PDF.
                Tamaño máximo: 10MB
              </p>
            </div>

            {/* Documento de la Factura */}
            <div>
              <label className="text-sm font-medium">
                Documento de la Factura
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  onChange={handleDocumentoChange}
                  className="hidden"
                  id="documento-factura"
                />
                <label
                  htmlFor="documento-factura"
                  className="px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
                           transition-colors duration-150"
                >
                  Seleccionar documento
                </label>
                {documentPreviewUrl && (
                  <div className="relative group">
                    <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded">
                      <FileText className="w-8 h-8 text-gray-500" />
                    </div>
                    <div className="text-xs mt-1 text-gray-500">
                      {formData.DocumentoFactura?.name}
                    </div>
                  </div>
                )}
              </div>
              {errors.DocumentoFactura && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.DocumentoFactura}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Tamaño máximo: 10MB</p>
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
              {isSubmitting ? "Creando..." : "Crear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacturaCreateModal;
