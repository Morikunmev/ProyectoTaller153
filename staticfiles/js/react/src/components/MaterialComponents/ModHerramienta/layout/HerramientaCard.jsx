import React, { useState, useEffect } from "react";
import {
  Box,
  FileText,
  Package,
  MapPin,
  FileCheck,
  Loader,
  Settings,
  Tag,
  Truck, // Añadido para el ícono de envío
} from "lucide-react";

const HerramientaCard = ({ herramienta: initialHerramienta }) => {
  const [herramienta, setHerramienta] = useState(initialHerramienta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDetallesHerramienta = async () => {
      try {
        const response = await fetch(
          `/api/herramientas/${initialHerramienta.id}/detalles/`
        );

        if (!response.ok) {
          throw new Error("Error al cargar los detalles de la herramienta");
        }

        const data = await response.json();
        if (data.success && isMounted) {
          setHerramienta({ ...initialHerramienta, ...data.herramienta });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          console.error("Error:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchDetallesHerramienta();

    return () => {
      isMounted = false;
    };
  }, [initialHerramienta.id]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Cargando detalles adicionales...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header con información básica */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
            {herramienta.FotoHerramienta ? (
              <img
                src={herramienta.FotoHerramienta}
                alt={herramienta.NombreHerramienta}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentNode.firstChild.style.display = "flex";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Box className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {herramienta.NombreHerramienta}
            </h3>
            <p className="text-sm text-gray-500">ID: #{herramienta.id}</p>
          </div>
        </div>
      </div>

      {/* Detalles */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Información del Envío */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Truck className="w-4 h-4" />
            <span>
              Envío:{" "}
              {herramienta.Envio ? `#${herramienta.Envio.id}` : "Sin envío"}
            </span>
          </div>

          {/* Información del Proveedor */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-4 h-4" />
            <span>
              Proveedor:{" "}
              {herramienta.Proveedor
                ? herramienta.Proveedor.NombreProveedor
                : "Sin proveedor"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="w-4 h-4" />
            <span>
              Marca: {herramienta.MarcaHerramienta || "No especificada"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Settings className="w-4 h-4" />
            <span>
              Modelo: {herramienta.ModeloHerramienta || "No especificado"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              Ubicación: {herramienta.UbicacionHerramienta || "No especificada"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileCheck className="w-4 h-4" />
            <span>
              Registro Factura: {herramienta.RegistroFacturaHerramienta || "No"}
            </span>
          </div>
        </div>

        {/* Descripción */}
        {herramienta.DescripcionHerramienta && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <span className="block text-sm font-medium text-gray-900 mb-1">
                  Descripción
                </span>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {herramienta.DescripcionHerramienta || "Sin descripción"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HerramientaCard;
