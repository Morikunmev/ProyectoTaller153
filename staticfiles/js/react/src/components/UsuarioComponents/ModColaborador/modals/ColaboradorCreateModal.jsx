import React from "react";
import { X, XCircle, User } from "lucide-react";
import { useColaboradorCreateModal } from "../hooks/useColaboradorCreateModal";

const ColaboradorCreateModal = ({ isOpen, onClose, onSubmit }) => {
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
  } = useColaboradorCreateModal({ isOpen, onClose, onSubmit });

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
          <h2 className="text-lg font-semibold">Nuevo Colaborador</h2>
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
            {/* Información de Cuenta */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Información de Cuenta
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Nombre de Usuario*
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.username)}`}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Correo Electrónico*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.email)}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Contraseña*
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.password)}`}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Información Personal
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    RUT*
                  </label>
                  <input
                    type="text"
                    name="RutUsuario"
                    value={formData.RutUsuario}
                    onChange={handleInputChange}
                    placeholder="Ej: 12.345.678-9"
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.RutUsuario)}`}
                  />
                  {errors.RutUsuario && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.RutUsuario}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="TelefonoUsuario"
                    value={formData.TelefonoUsuario}
                    onChange={handleInputChange}
                    placeholder="+56 9 XXXX XXXX"
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.TelefonoUsuario)}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Edad
                  </label>
                  <input
                    type="number"
                    name="EdadUsuario"
                    value={formData.EdadUsuario}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    className={`w-full px-3 py-1.5 border rounded
                    focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200
                    ${getInputBorderClass(formData.EdadUsuario)}`}
                  />
                  {errors.EdadUsuario && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.EdadUsuario}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Foto de Perfil */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Foto de Perfil
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                  id="foto-usuario"
                />
                <label
                  htmlFor="foto-usuario"
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
                        className="h-10 w-10 object-cover rounded-full"
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
                      {formData.FotoUsuario?.name}
                    </div>
                  </div>
                )}
              </div>
              {errors.FotoUsuario && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.FotoUsuario}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 10MB
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
            {isSubmitting ? "Creando..." : "Crear Colaborador"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColaboradorCreateModal;