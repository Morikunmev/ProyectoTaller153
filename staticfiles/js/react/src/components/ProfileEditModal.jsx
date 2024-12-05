import React from "react";
import { X, UserCircle, Camera, CheckCircle } from "lucide-react";
import { useProfileEditModal } from "./useProfileEditModal";

const ProfileEditModal = ({ isOpen, onClose, userData, onUpdate }) => {
  const {
    formData,
    errors,
    isSubmitting,
    previewUrl,
    success,
    handleInputChange,
    handleFotoChange,
    handleSubmit,
  } = useProfileEditModal({ isOpen, onClose, userData, onUpdate });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform rounded-lg bg-white shadow-xl">
          <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-md bg-white text-gray-400 
                       hover:text-gray-500 transition-colors duration-300"
            >
              <X className="h-6 w-6" />
            </button>

            {success ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <p className="text-lg font-medium text-green-600">
                  ¡Perfil actualizado con éxito!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Foto de perfil */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div
                      className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-200 
                                  transition-all duration-300 hover:ring-gray-300"
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <UserCircle className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label
                      className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer
                                    hover:bg-gray-800 transition-colors duration-300"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFotoChange}
                      />
                    </label>
                  </div>
                </div>

                {/* Campos del formulario */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                               focus:border-blue-500 focus:ring-blue-500 
                               transition-shadow duration-300 hover:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                               focus:border-blue-500 focus:ring-blue-500 
                               transition-shadow duration-300 hover:border-gray-400"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                               focus:border-blue-500 focus:ring-blue-500 
                               transition-shadow duration-300 hover:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      RUT
                    </label>
                    <input
                      type="text"
                      name="RutUsuario"
                      value={formData.RutUsuario}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                               focus:border-blue-500 focus:ring-blue-500 
                               transition-shadow duration-300 hover:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Edad
                    </label>
                    <input
                      type="number"
                      name="EdadUsuario"
                      value={formData.EdadUsuario}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                               focus:border-blue-500 focus:ring-blue-500 
                               transition-shadow duration-300 hover:border-gray-400"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="TelefonoUsuario"
                      value={formData.TelefonoUsuario}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                               focus:border-blue-500 focus:ring-blue-500 
                               transition-shadow duration-300 hover:border-gray-400"
                    />
                  </div>
                </div>

                {errors.general && (
                  <div className="text-red-500 text-sm">{errors.general}</div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 
                             text-sm font-medium text-gray-700 hover:bg-gray-50
                             transition-colors duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium 
                             text-white hover:bg-gray-800 disabled:opacity-50
                             transition-colors duration-300"
                  >
                    {isSubmitting ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
