import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Phone, Building2 } from "lucide-react";

const ProveedorDetalle = ({ onBack }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await fetch("/api/consultar_proveedores");
        const data = await response.json();

        if (data.success && data.proveedores) {
          console.log("Datos recibidos:", data.proveedores);
          setProveedores(data.proveedores);
        } else {
          throw new Error("Formato de respuesta inválido");
        }
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
        setError("Error al cargar los proveedores");
      } finally {
        setLoading(false);
      }
    };

    fetchProveedores();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-600">Cargando proveedores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!proveedores.length) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-600">No hay proveedores disponibles</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proveedores.map((proveedor, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            {/* Imagen/Preview */}
            <div className="w-full h-48 bg-gray-100 relative">
              {proveedor.FotoProveedor ? (
                <img
                  src={proveedor.FotoProveedor}
                  alt={`Vista previa de ${proveedor.NombreProveedor}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(
                      "Error cargando imagen:",
                      proveedor.FotoProveedor
                    );
                    const fallbackDiv = document.createElement("div");
                    fallbackDiv.className =
                      "w-full h-full flex items-center justify-center";
                    fallbackDiv.innerHTML =
                      '<svg class="w-16 h-16 text-gray-400" ...></svg>';
                    e.target.parentNode.replaceChild(fallbackDiv, e.target);
                  }}
                  onLoad={() =>
                    console.log(
                      "Imagen cargada correctamente:",
                      proveedor.FotoProveedor
                    )
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="p-4">
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

              <div className="mt-4 pt-4 border-t text-sm text-gray-500">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProveedorDetalle;
