import React, { useState, useEffect } from "react";
import {
  Palette,
  Weight,
  Ruler,
  FileText,
  Box,
  Package,
  CircleDot,
  MapPin,
  AlertCircle,
  FileCheck,
  Loader,
} from "lucide-react";

const MaterialCard = ({ material: initialMaterial }) => {
  const [material, setMaterial] = useState(initialMaterial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDetallesMaterial = async () => {
      try {
        const response = await fetch(
          `/api/materiales/${initialMaterial.id}/detalles/`
        );

        if (!response.ok) {
          throw new Error("Error al cargar los detalles del material");
        }

        const data = await response.json();
        if (data.success && isMounted) {
          setMaterial({ ...initialMaterial, ...data.material });
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

    // Mostrar los datos iniciales inmediatamente
    setLoading(true);
    fetchDetallesMaterial();

    return () => {
      isMounted = false;
    };
  }, [initialMaterial.id]);

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
            {material.FotoMaterial ? (
              <img
                src={material.FotoMaterial}
                alt={material.NombreMaterial}
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
              {material.NombreMaterial}
            </h3>
            <p className="text-sm text-gray-500">ID: #{material.id}</p>
          </div>
        </div>
      </div>

      {/* Detalles */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mostramos todos los campos, incluso los null */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Palette className="w-4 h-4" />
            <span>Color: {material.ColorMaterial}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Weight className="w-4 h-4" />
            <span>Peso: {material.PesoMaterial}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Ruler className="w-4 h-4" />
            <span>Dimensiones: {material.DimensionesMaterial}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Ubicación: {material.UbicacionMaterial}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>Estado: {material.EstadoMaterial}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileCheck className="w-4 h-4" />
            <span>Registro Factura: {material.RegistroFacturaMaterial}</span>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <span className="block text-sm font-medium text-gray-900 mb-1">
                Detalles adicionales
              </span>
              <p className="text-sm text-gray-600 leading-relaxed">
                {material.DetalleMaterial}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
