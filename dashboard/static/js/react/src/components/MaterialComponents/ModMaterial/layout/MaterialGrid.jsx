import React from "react";
import {
  Calendar,
  Box,
  Pencil,
  Trash2,
  DollarSign,
  PackageCheck,
  MapPin,
} from "lucide-react";

const MaterialGrid = ({ material, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha no disponible";
      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short",
      }).format(date);
    } catch (error) {
      console.error("Error al formatear la fecha:", error, dateString);
      return "Fecha no disponible";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStockStyle = () => {
    if (material.StockMaterial === 0) return "bg-red-100 text-red-800";
    if (material.StockMaterial < 5) return "bg-orange-100 text-orange-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Imagen/Preview */}
      <div className="w-full h-36 bg-gray-100 relative">
        {material.FotoMaterial ? (
          <img
            src={material.FotoMaterial}
            alt={`Material: ${material.NombreMaterial}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Box className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Badge de stock */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStockStyle()}`}
          >
            Stock: {material.StockMaterial}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-2.5">
        {/* Título y estado */}
        <div className="mb-2">
          <h3
            className="font-medium text-sm truncate"
            title={material.NombreMaterial}
          >
            {material.NombreMaterial}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium 
                         ${
                           material.EstadoMaterial === "Activo"
                             ? "bg-green-100 text-green-800"
                             : "bg-red-100 text-red-800"
                         }`}
            >
              {material.EstadoMaterial}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800
                        flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" />
              {material.UbicacionMaterial}
            </span>
          </div>
          {material.Proveedor && (
            <div
              className="mt-1 text-xs text-gray-600 truncate"
              title={material.Proveedor.NombreProveedor}
            >
              Proveedor: {material.Proveedor.NombreProveedor}
            </div>
          )}
        </div>

        {/* Detalles en grid */}
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <PackageCheck className="w-3 h-3" />
            <span>{material.StockMaterial} unidades</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>{formatCurrency(material.TotalMaterial)}</span>
          </div>
          {material.FechaCompraMaterial && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(material.FechaCompraMaterial)}</span>
            </div>
          )}
          {material.ColorMaterial && (
            <div className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: material.ColorMaterial }}
              />
              <span>{material.ColorMaterial}</span>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
            className="flex items-center justify-center gap-1 p-1 text-xs text-blue-600 hover:text-blue-800
                     border border-blue-600 hover:border-blue-800 rounded-lg
                     transition-all duration-200 ease-in-out hover:bg-blue-50"
          >
            <Pencil className="w-3 h-3" />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="flex items-center justify-center gap-1 p-1 text-xs text-red-600 hover:text-red-800
                     border border-red-600 hover:border-red-800 rounded-lg
                     transition-all duration-200 ease-in-out hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialGrid;