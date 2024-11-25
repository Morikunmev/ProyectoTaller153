import React from "react";
import { X } from "lucide-react";
import { useProveedorUpdateModal } from "../hooks/useProveedorUpdateModal";

const ProveedorUpdateModal = ({
  isOpen,
  onClose,
  proveedor,
  onProveedorUpdated,
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
    handleFileChange,
  } = useProveedorUpdateModal({
    isOpen,
    onClose,
    proveedor,
    onProveedorUpdated,
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
          <h2 className="text-lg font-semibold">Editar Proveedor</h2>
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
              <h3 className="text-sm font-medium text-gray-900">Información Principal</h3>
              {["Nombre", "Rut", "Marca"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium block mb-1">
                    {field}{field === "Rut" && " (XX.XXX.XXX-X)"}*
                  </label>
                  <input
                    type="text"
                    name={`${field}Proveedor`}
                    value={formData[`${field}Proveedor`]}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData[`${field}Proveedor`])}`}
                  />
                  {errors[`${field}Proveedor`] && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors[`${field}Proveedor`]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Campos opcionales */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Información Adicional</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Ciudad</label>
                  <input
                    type="text"
                    name="CiudadProveedor"
                    value={formData.CiudadProveedor}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.CiudadProveedor)}`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Región</label>
                  <input
                    type="text"
                    name="RegionProveedor"
                    value={formData.RegionProveedor}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.RegionProveedor)}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">País</label>
                  <input
                    type="text"
                    name="PaisProveedor"
                    value={formData.PaisProveedor}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.PaisProveedor)}`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="TelefonoProveedor"
                    value={formData.TelefonoProveedor}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.TelefonoProveedor)}`}
                  />
                  {errors.TelefonoProveedor && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.TelefonoProveedor}
                    </p>
                  )}
                </div>
              </div>

              {/* Comentario */}
              <div>
                <label className="text-sm font-medium block mb-1">Comentario</label>
                <textarea
                  name="ComentarioProveedor"
                  value={formData.ComentarioProveedor}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-1.5 border rounded
                  focus:ring-1 focus:ring-blue-500 focus:outline-none
                  transition-colors duration-200
                  ${getInputBorderClass(formData.ComentarioProveedor)}`}
                />
              </div>

              {/* Foto */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Foto del Proveedor
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="foto-proveedor-update"
                  />
                  <label
                    htmlFor="foto-proveedor-update"
                    className="px-3 py-1.5 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
                    transition-colors duration-150 text-sm"
                  >
                    Seleccionar imagen
                  </label>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="h-10 w-10 object-cover rounded"
                    />
                  )}
                </div>
                {errors.FotoProveedor && (
                  <p className="text-xs text-red-500 mt-1">{errors.FotoProveedor}</p>
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

export default ProveedorUpdateModal;