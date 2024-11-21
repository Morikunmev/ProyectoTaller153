import React from "react";
import { FileText } from "lucide-react";

const FacturaDetalle = ({ facturas, loading, error }) => {
  if (loading) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Título y contador */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Detalle de Facturas
        </h1>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
          {facturas.length} Facturas
        </span>
      </div>

      {/* Contenido Principal */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {facturas.map((factura) => (
              <div
                key={factura.id}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Factura #{factura.NumeroFactura}
                      </h2>
                      <span className="text-sm text-gray-500">
                        ID: {factura.id}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      Proveedor: {factura.Proveedor.NombreProveedor}
                    </p>
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

                {/* Detalles adicionales */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha Emisión</p>
                    <p className="text-gray-700 font-medium">
                      {factura.FechaEmision}
                    </p>
                  </div>
                  {/* Aquí puedes agregar más campos si los necesitas */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacturaDetalle;
