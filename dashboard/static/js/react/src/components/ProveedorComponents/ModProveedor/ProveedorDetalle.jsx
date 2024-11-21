import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Phone,
  Building2,
  Search,
  FileText,
  Package,
  RotateCw,
} from "lucide-react";

const CACHE_KEY = "proveedores_cache";
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

const ProveedorDetalle = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [facturaSearch, setFacturaSearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchProveedores = async (force = false) => {
    try {
      if (!force) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            const processed = processProveedores(data);
            setProveedores(processed);
            setFilteredResults(processed);
            setLoading(false);
            setLastFetch(timestamp);
            return;
          }
        }
      }

      const response = await fetch("/api/consultar_proveedores_detalle/");
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const result = await response.json();
      if (result.success) {
        const processedData = processProveedores(result.proveedores);
        const cacheData = {
          data: result.proveedores,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        setProveedores(processedData);
        setFilteredResults(processedData);
        setLastFetch(Date.now());
      } else {
        throw new Error(result.message || "Error al cargar los proveedores");
      }
    } catch (error) {
      setError("No se pudieron cargar los proveedores");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const processProveedores = (provs) => {
    return provs.map((proveedor) => ({
      ...proveedor,
      facturas: (proveedor.facturas || []).sort(
        (a, b) => new Date(b.FechaEmision) - new Date(a.FechaEmision)
      ),
    }));
  };

  useEffect(() => {
    fetchProveedores();
    setIsVisible(true);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchProveedores(true);
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const filtered = proveedores
      .map((proveedor) => {
        // Primero filtra las facturas que tienen envíos que coinciden
        const filteredFacturas = proveedor.facturas.filter((factura) => {
          const facturaMatch =
            facturaSearch === "" ||
            factura.NumeroFactura.toLowerCase().includes(
              facturaSearch.toLowerCase()
            );

          const enviosMatch =
            materialSearch === "" ||
            factura.envios?.some((envio) =>
              envio.NombreEnvio.toLowerCase().includes(
                materialSearch.toLowerCase()
              )
            );

          return facturaMatch || enviosMatch;
        });

        return {
          ...proveedor,
          facturas: filteredFacturas,
        };
      })
      .filter((proveedor) => {
        const proveedorMatch = proveedor.NombreProveedor.toLowerCase().includes(
          searchTerm.toLowerCase()
        );
        return (
          proveedorMatch &&
          (materialSearch === "" || proveedor.facturas.length > 0)
        );
      });

    setFilteredResults(filtered);
  }, [searchTerm, facturaSearch, materialSearch, proveedores]);
  const handleRefresh = () => {
    setLoading(true);
    fetchProveedores(true);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-600">Cargando proveedores...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-red-600">{error}</p>
      </div>
    );

  if (!proveedores.length)
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-600">No hay proveedores disponibles</p>
      </div>
    );

  return (
    <div
      className={`space-y-6 transition-all duration-300 ease-in-out
      ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Detalle Proveedores
        </h1>
        <RefreshButton onClick={handleRefresh} />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar proveedor..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                    focus:outline-none focus:ring-1 focus:ring-blue-500
                    transition-colors duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar factura..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                    focus:outline-none focus:ring-1 focus:ring-blue-500
                    transition-colors duration-200"
            value={facturaSearch}
            onChange={(e) => setFacturaSearch(e.target.value)}
          />
        </div>

        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar material..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                    focus:outline-none focus:ring-1 focus:ring-blue-500
                    transition-colors duration-200"
            value={materialSearch}
            onChange={(e) => setMaterialSearch(e.target.value)}
          />
        </div>
      </div>

      {lastFetch && (
        <p className="text-sm text-gray-500">
          Última actualización: {new Date(lastFetch).toLocaleString()}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults.map((proveedor, index) => (
          <div
            key={index}
            className="bg-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 h-auto"
          >
            <div className="relative">
              {proveedor.FotoProveedor ? (
                <img
                  src={proveedor.FotoProveedor}
                  alt={`Vista previa de ${proveedor.NombreProveedor}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                  <Building2 className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Creado:{" "}
                    {new Date(
                      proveedor.FechaCreacionProveedor
                    ).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2">
                {proveedor.NombreProveedor}
              </h3>

              <div className="space-y-3 text-gray-600">
                <p>
                  <span className="font-medium">RUT:</span>{" "}
                  {proveedor.RutProveedor}
                </p>
                <p>
                  <span className="font-medium">Marca:</span>{" "}
                  {proveedor.MarcaProveedor}
                </p>

                {proveedor.CiudadProveedor && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>
                      {[
                        proveedor.CiudadProveedor,
                        proveedor.RegionProveedor,
                        proveedor.PaisProveedor,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}

                {proveedor.TelefonoProveedor && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{proveedor.TelefonoProveedor}</span>
                  </div>
                )}
              </div>

              {proveedor.ComentarioProveedor && (
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                  {proveedor.ComentarioProveedor}
                </div>
              )}

              {proveedor.facturas && proveedor.facturas.length > 0 ? (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Facturas ({proveedor.facturas.length})
                  </h4>
                  {proveedor.facturas.map((factura, facturaIdx) => {
                    const allEnviosRecibidos = factura.envios?.every(
                      (envio) => envio.EnvioRecibido
                    );

                    return (
                      <div
                        key={facturaIdx}
                        className={`mb-4 p-3 ${
                          allEnviosRecibidos ? "bg-green-200" : "bg-red-200"
                        } rounded relative`}
                      >
                        <div
                          className="absolute top-2 right-2 w-6 h-6 bg-blue-100 rounded-full 
                     flex items-center justify-center text-xs font-medium text-blue-600"
                        >
                          {facturaIdx + 1}
                        </div>
                        <p className="font-medium">#{factura.NumeroFactura}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(factura.FechaEmision).toLocaleDateString(
                            "es-ES"
                          )}
                        </p>

                        {factura.envios && factura.envios.length > 0 && (
                          <div className="mt-3 border-t border-gray-200 pt-3">
                            <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
                              <Package className="w-4 h-4" />
                              Envíos ({factura.envios.length})
                            </h5>
                            {factura.envios.map((envio, envioIdx) => (
                              <div
                                key={envioIdx}
                                className="text-sm p-2 bg-white rounded mb-2 last:mb-0"
                              >
                                <p className="font-medium">
                                  {envio.NombreEnvio}
                                </p>
                                <p className="text-gray-600">
                                  Cantidad: {envio.CantidadEnvio} - Total: $
                                  {envio.TotalEnvio}
                                </p>
                                <p className="text-gray-600">
                                  Estado:{" "}
                                  {envio.EnvioRecibido
                                    ? "Recibido"
                                    : "En tránsito"}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProveedorDetalle;
