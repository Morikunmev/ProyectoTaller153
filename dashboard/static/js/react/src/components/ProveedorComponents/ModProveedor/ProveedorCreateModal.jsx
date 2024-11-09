import React from "react";
import { X } from "lucide-react";
import { useProveedorCreateModal } from "./hooks/useProveedorCreateModal";
const ProveedorCreateModal = ({ isOpen, onClose, onSubmit }) => {
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
    handleFileChange,
  } = useProveedorCreateModal({ isOpen, onClose, onSubmit });

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
            <h2 className="text-xl font-bold">Nuevo Proveedor</h2>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-150"
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
              {["Nombre", "Rut", "Marca"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium">
                    {field}*{field === "Rut" && " (XX.XXX.XXX-X)"}
                  </label>
                  <input
                    type="text"
                    name={`${field}Proveedor`}
                    value={formData[`${field}Proveedor`]}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {errors[`${field}Proveedor`] && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors[`${field}Proveedor`]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Campos opcionales */}
            <div className="space-y-4">
              <h3 className="font-medium">Información Adicional</h3>

              {/* Ubicación */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Ciudad</label>
                  <input
                    type="text"
                    name="CiudadProveedor"
                    value={formData.CiudadProveedor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Región</label>
                  <input
                    type="text"
                    name="RegionProveedor"
                    value={formData.RegionProveedor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">País</label>
                  <input
                    type="text"
                    name="PaisProveedor"
                    value={formData.PaisProveedor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <input
                    type="tel"
                    name="TelefonoProveedor"
                    value={formData.TelefonoProveedor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {errors.TelefonoProveedor && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.TelefonoProveedor}
                    </p>
                  )}
                </div>
              </div>

              {/* Comentario */}
              <div>
                <label className="text-sm font-medium">Comentario</label>
                <textarea
                  name="ComentarioProveedor"
                  value={formData.ComentarioProveedor}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Foto */}
              <div>
                <label className="text-sm font-medium">Foto del Proveedor</label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="foto-proveedor"
                  />
                  <label
                    htmlFor="foto-proveedor"
                    className="px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
                             transition-colors duration-150"
                  >
                    Seleccionar imagen
                  </label>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="h-16 w-16 object-cover rounded"
                    />
                  )}
                </div>
              </div>
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
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded hover:bg-gray-50 
                       transition-colors duration-150"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-black text-white rounded 
                       hover:bg-gray-800 transition-colors duration-150
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

export default ProveedorCreateModal;