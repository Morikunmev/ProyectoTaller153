import React, { useState, useEffect } from "react";
import { UserCircle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Seccion1 = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [dataGrafico, setDataGrafico] = useState([]);

  const [ventas, setVentas] = useState({
    maxVentas: 0,
    promedioVentas: 0,
    minVentas: 0,
  });

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
    const fetchVentasGrafico = async () => {
      try {
        const response = await fetch("/api/ventas/grafico/", {
          method: "GET",
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            Accept: "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error al obtener los datos del gráfico");
        }

        const data = await response.json();
        setDataGrafico(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

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

    const fetchCategorias = async () => {
      try {
        const response = await fetch("/api/categorias/", {
          method: "GET",
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            Accept: "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error al obtener las categorías");
        }

        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const fetchVentas = async () => {
      try {
        const response = await fetch("/api/ventas/estadisticas/", {
          method: "GET",
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            Accept: "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error al obtener las estadísticas de ventas");
        }

        const data = await response.json();
        setVentas(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    // Ejecutar todas las funciones fetch
    fetchUserData();
    fetchCategorias();
    fetchVentas();
    fetchVentasGrafico();
  }, []);

  return (
    <div className="pt-20">
      {/* Card de bienvenida */}
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

      {/* Card de categorías */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Categorías</h2>
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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categorias?.map((categoria) => (
            <div key={categoria.id} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                {categoria.FotoCategoria ? (
                  <img
                    src={categoria.FotoCategoria}
                    alt={categoria.NombreCategoria}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                )}
              </div>
              <span className="text-sm text-gray-600 text-center">
                {categoria.NombreCategoria}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row gap-6 mt-6">
        {/* Mayores Ventas */}
        <div className="flex-1 bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">
                Mayores Ventas
              </p>
              <h3 className="text-2xl font-bold text-green-700 mt-1">
                ${ventas?.maxVentas?.toLocaleString("es-CL")}
              </h3>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Promedio Ventas */}
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">
                Promedio Ventas
              </p>
              <h3 className="text-2xl font-bold text-blue-700 mt-1">
                ${ventas?.promedioVentas?.toLocaleString("es-CL")}
              </h3>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Menores Ventas */}
        <div className="flex-1 bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Menores Ventas</p>
              <h3 className="text-2xl font-bold text-red-700 mt-1">
                ${ventas?.minVentas?.toLocaleString("es-CL")}
              </h3>
            </div>
            <div className="p-3 bg-red-200 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Ventas</h2>
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

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="maxVentas"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Mayores Ventas"
              />
              <Area
                type="monotone"
                dataKey="promedioVentas"
                stackId="2"
                stroke="#8884d8"
                fill="#8884d8"
                name="Promedio Ventas"
              />
              <Area
                type="monotone"
                dataKey="minVentas"
                stackId="3"
                stroke="#ff8042"
                fill="#ff8042"
                name="Menores Ventas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Seccion1;
