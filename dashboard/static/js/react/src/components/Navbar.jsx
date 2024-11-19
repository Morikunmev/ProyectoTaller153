import React, { useState, useEffect } from "react";
import { UserCircle } from "lucide-react";

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 shadow-lg">
      <div className="w-full px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo y nombre - con flex-shrink-0 para evitar que se comprima */}
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

          {/* Perfil de usuario y botón de logout - con ml-auto para empujar a la derecha */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Información del usuario */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center ring-2 ring-white flex-shrink-0">
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

            {/* Botón de logout */}
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
  );
};

export default Navbar;