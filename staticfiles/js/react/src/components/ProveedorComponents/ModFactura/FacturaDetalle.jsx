import React, { useState, useEffect } from "react";
import { FileText, Package, Calendar, RotateCw, Search } from "lucide-react";

const CACHE_KEY = "facturas_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const SearchBar = ({ onSearch, placeholder }) => (
  <div className="relative w-full max-w-md">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    <input
      type="text"
      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder={placeholder}
      onChange={(e) => onSearch(e.target.value)}
    />
  </div>
);

const FacturaDetalle = ({ loading: externalLoading, error: externalError }) => {
  const [facturas, setFacturas] = useState([]);
  const [filteredFacturas, setFilteredFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchEnvio, setSearchEnvio] = useState("");

  const fetchFacturas = async (force = false) => {
    try {
      if (!force) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const cacheAge = Date.now() - timestamp;
          if (cacheAge < CACHE_DURATION) {
            setFacturas(data);
            setFilteredFacturas(data);
            setLoading(false);
            setLastFetch(timestamp);
            return;
          }
        }
      }

      setLoading(true);
      const response = await fetch("/api/consultar_facturas_detalle/");
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setFacturas(data.facturas);
        setFilteredFacturas(data.facturas);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: data.facturas,
            timestamp: Date.now(),
          })
        );
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

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          const cacheAge = Date.now() - timestamp;
          if (cacheAge >= CACHE_DURATION) {
            fetchFacturas(true);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredFacturas(facturas);
      return;
    }

    const searchTermLower = term.toLowerCase();
    const filtered = facturas.filter((factura) => {
      return (
        factura.NumeroFactura?.toLowerCase().includes(searchTermLower) ||
        factura.Proveedor?.NombreProveedor?.toLowerCase().includes(
          searchTermLower
        )
      );
    });
    setFilteredFacturas(filtered);
  };

  const filterEnvios = (factura) => {
    if (!searchEnvio.trim()) return factura.envios;
    const searchTermLower = searchEnvio.toLowerCase();
    return factura.envios?.filter((envio) =>
      envio.NombreEnvio?.toLowerCase().includes(searchTermLower)
    );
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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Detalle de Facturas
            </h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {filteredFacturas?.length || 0} Facturas
            </span>
          </div>
          <button
            onClick={() => fetchFacturas(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors
                     flex items-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar por número de factura o proveedor..."
          />
          <SearchBar onSearch={setSearchEnvio} placeholder="Buscar envíos..." />
        </div>
      </div>

      {lastFetch && (
        <p className="text-sm text-gray-500">
          Última actualización: {new Date(lastFetch).toLocaleString()}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredFacturas?.map((factura) => {
          if (!factura) return null;
          const filteredEnvios = filterEnvios(factura);

          return (
            <div key={factura.id} className="bg-white rounded-lg shadow-lg p-6">
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
                  {/* Contenedor de documentos (similar al código anterior) */}
                </div>
              </div>

              {Array.isArray(filteredEnvios) && filteredEnvios.length > 0 ? (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5" />
                    Envíos ({filteredEnvios.length})
                  </h3>
                  <div className="grid gap-4">
                    {filteredEnvios.map((envio, envioIdx) => (
                      <div
                        key={envioIdx}
                        className={`p-4 rounded-lg ${
                          envio.EnvioRecibido ? "bg-green-100" : "bg-red-100"
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
                            {envio.EnvioRecibido ? "Recibido" : "En tránsito"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 border-t border-gray-200 pt-6 text-gray-500 text-center">
                  {searchEnvio
                    ? "No se encontraron envíos que coincidan con la búsqueda"
                    : "No hay envíos asociados a esta factura"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FacturaDetalle;
