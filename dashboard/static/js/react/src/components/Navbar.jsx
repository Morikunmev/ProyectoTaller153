import React, { useState, useEffect } from "react";
import { UserCircle, X, Camera, Flag } from "lucide-react";
import { useProfileEditModal } from "./useProfileEditModal";
import ReportModal from "./ReporteComponents/ReportModal";

// Componente Modal de Edición de Perfil
const ProfileEditModal = ({ isOpen, onClose, userData, onUpdate }) => {
  const {
    formData,
    errors,
    isSubmitting,
    previewUrl,
    handleInputChange,
    handleFotoChange,
    handleSubmit,
  } = useProfileEditModal({ isOpen, onClose, userData, onUpdate });

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] overflow-y-auto
        transition-opacity duration-300 ease-in-out
        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-lg transform rounded-xl bg-white shadow-xl
      transition-all duration-300 ease-out backdrop-blur-sm
      ${
        isOpen
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95"
      }`}
        >
          <div className="bg-white/80 px-6 py-6 rounded-xl relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors duration-200 text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Foto de perfil */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-200 transition-transform duration-200 hover:scale-105">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <UserCircle className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors duration-200 shadow-lg">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RUT
                  </label>
                  <input
                    type="text"
                    name="RutUsuario"
                    value={formData.RutUsuario}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Edad
                  </label>
                  <input
                    type="number"
                    name="EdadUsuario"
                    value={formData.EdadUsuario}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="TelefonoUsuario"
                    value={formData.TelefonoUsuario}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 
                     transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    "Guardar cambios"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Principal Navbar
const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/current/", {
          method: "GET",
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            Accept: "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error al obtener datos del usuario");
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    window.location.href = "/logout/";
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 shadow-lg">
        <div className="w-full px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center flex-shrink-0">
              <div className="flex items-center space-x-3">
                <img
                  src="/static/images/logo.png"
                  alt="Logo"
                  className="h-8 w-8 flex-shrink-0"
                />
                <span className="text-2xl font-bold text-white whitespace-nowrap">
                  Taller 153
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                {/* Botón de Reporte */}
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center space-x-2 text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <Flag className="w-5 h-5" />
                  <span>Reportar</span>
                </button>

                <div
                  className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center ring-2 ring-white flex-shrink-0 cursor-pointer"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  {userData?.FotoUsuario ? (
                    <img
                      src={userData.FotoUsuario}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : (
                    <UserCircle className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {loading ? (
                  <div className="h-4 w-24 bg-gray-800 animate-pulse rounded"></div>
                ) : error ? (
                  <span className="text-sm text-gray-400 whitespace-nowrap">
                    Error al cargar usuario
                  </span>
                ) : (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-white truncate">
                      {userData?.user?.first_name} {userData?.user?.last_name}
                    </span>
                    <span className="text-xs text-gray-400 truncate">
                      {userData?.TipoUsuario}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="text-white hover:bg-red-500 px-4 py-2 rounded-md text-sm font-medium
                         transition-colors duration-200 flex items-center whitespace-nowrap"
              >
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userData={userData}
        onUpdate={(updatedUser) => {
          setUserData(updatedUser);
          setIsProfileModalOpen(false);
        }}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
