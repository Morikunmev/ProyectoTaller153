// Prueba1.jsx
import React, { useState, useEffect } from "react";
import { UserCircle } from "lucide-react";

const Seccion1 = () => {
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

  return (
    <div className="pt-20">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {userData?.FotoUsuario ? (
              <div className="w-16 h-16 rounded-full ring-2 ring-indigo-100 shadow overflow-hidden">
                <img
                  src={userData.FotoUsuario}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-indigo-50">
                <span className="text-2xl font-bold text-indigo-600">
                  {userData?.user?.first_name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
          </div>

          <div className="text-gray-800">
            <h1 className="text-2xl font-bold text-gray-900">¡Bienvenido!</h1>
            <p className="text-lg text-gray-700">
              {userData?.user?.first_name || "Usuario"}
            </p>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                {userData?.TipoUsuario || "Usuario"}
              </span>
              <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-sm">
                {userData?.RutUsuario || "Sin RUT"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Contenido Principal
          </h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 shadow-inner">
          <h1 className="text-gray-600">Hola</h1>
        </div>
      </div>
    </div>
  );
};

export default Seccion1;
