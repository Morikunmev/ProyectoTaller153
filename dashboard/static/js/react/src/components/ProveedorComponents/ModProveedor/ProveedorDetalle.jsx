import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Phone, Building2 } from "lucide-react";

const ProveedorDetalle = ({ onBack }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await fetch("/api/consultar_proveedores");
        const data = await response.json();
        setProveedores(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProveedores();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proveedores.map((proveedor, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Imagen/Preview */}
            <div className="w-full h-48 bg-gray-100 relative">
              {proveedor.FotoProveedor ? (
                <img
                  src={proveedor.FotoProveedor}
                  alt={proveedor.NombreProveedor}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
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
