import React, { useState, useEffect } from "react";
import { FileText, Package, Calendar, RotateCw } from "lucide-react";

const CACHE_KEY = "facturas_cache";
const CACHE_DURATION = 5 * 60 * 1000;

const RefreshButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 
             text-white rounded-lg shadow-md hover:shadow-lg
             flex items-center gap-2 transform hover:scale-105
             transition-all duration-200 active:scale-95"
  >
    <RotateCw className="w-4 h-4" />
    <span>Actualizar</span>
  </button>
);

const FacturaDetalle = ({ loading: externalLoading, error: externalError }) => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchFacturas = async (force = false) => {
    try {
      if (!force) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setFacturas(data);
            setLoading(false);
            setLastFetch(timestamp);
            return;
          }
        }
      }

      setLoading(true);
      const response = await fetch("/api/consultar_facturas_detalle/");
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setFacturas(data.facturas);
        const cacheData = {
          data: data.facturas,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        setLastFetch(Date.now());
      } else {
        throw new Error(data.message || "Error al cargar las facturas");
      }
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      setError("No se pudieron cargar las facturas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacturas();
    setIsVisible(true);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchFacturas(true);
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchFacturas(true);
  };

  if (loading || externalLoading) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (error || externalError) {
    return (
      <div className="text-center p-8 text-red-500">
        <p className="text-lg">{error || externalError}</p>
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 transition-all duration-300 ease-in-out
      ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Detalle de Facturas
          </h1>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            {facturas?.length || 0} Facturas
          </span>
        </div>
        <RefreshButton onClick={handleRefresh} />
      </div>

      {lastFetch && (
        <p className="text-sm text-gray-500">
          Última actualización: {new Date(lastFetch).toLocaleString()}
        </p>
      )}

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 gap-6">
        {facturas?.map((factura) => {
          if (!factura) return null;

          const allEnviosRecibidos = factura.envios?.every?.(
            (envio) => envio?.EnvioRecibido
          );

          return (
            <div
              key={factura.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Factura #{factura.NumeroFactura || "Sin número"}
                      </h2>
                      <span className="text-sm text-gray-500">
                        ID: {factura.id}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      Proveedor:{" "}
                      {factura.Proveedor?.NombreProveedor || "Sin proveedor"}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Fecha Emisión:{" "}
                        {factura.FechaEmision
                          ? new Date(factura.FechaEmision).toLocaleDateString(
                              "es-ES"
                            )
                          : "Sin fecha"}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    {/* Contenedor de Foto */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      {factura.FotoFactura ? (
                        <img
                          src={factura.FotoFactura}
                          alt={`Factura #${factura.NumeroFactura}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentNode.classList.add("bg-gray-200");
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 text-xs">
                            Sin foto
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenedor de Documento */}
                    {factura.DocumentoFactura && (
                      <button
                        className="w-20 h-20 rounded-lg border border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        onClick={async () => {
                          try {
                            const csrfToken = document.querySelector(
                              "[name=csrfmiddlewaretoken]"
                            )?.value;
                            if (!csrfToken) {
                              throw new Error("Token CSRF no encontrado");
                            }

                            const response = await fetch(
                              `/api/factura/${factura.id}/ver-documento/`,
                              {
                                method: "GET",
                                credentials: "include",
                                headers: {
                                  "X-CSRFToken": csrfToken,
                                },
                              }
                            );

                            if (!response.ok) {
                              throw new Error("Error al acceder al documento");
                            }

                            const data = await response.json();
                            window.open(data.url, "_blank");
                          } catch (error) {
                            console.error("Error:", error);
                            alert("Error al acceder al documento");
                          }
                        }}
                      >
                        <FileText className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500">Ver PDF</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Envíos */}
                {Array.isArray(factura.envios) && factura.envios.length > 0 ? (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Package className="w-5 h-5" />
                      Envíos ({factura.envios.length})
                    </h3>
                    <div className="grid gap-4">
                      {factura.envios.map((envio, envioIdx) => {
                        if (!envio) return null;

                        return (
                          <div
                            key={envioIdx}
                            className={`p-4 rounded-lg ${
                              envio.EnvioRecibido
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {envio.NombreEnvio || "Sin nombre"}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  Cantidad: {envio.CantidadEnvio || 0}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Total: ${envio.TotalEnvio || 0}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  envio.EnvioRecibido
                                    ? "bg-green-200 text-green-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                              >
                                {envio.EnvioRecibido
                                  ? "Recibido"
                                  : "En tránsito"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 border-t border-gray-200 pt-6 text-gray-500 text-center">
                    No hay envíos asociados a esta factura
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FacturaDetalle;
