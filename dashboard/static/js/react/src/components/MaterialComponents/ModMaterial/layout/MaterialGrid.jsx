import React from "react";
import {
  Calendar,
  Box,
  Pencil,
  Trash2,
  DollarSign,
  PackageCheck,
  Info,
} from "lucide-react";

const MaterialGrid = ({ material, onEdit, onDelete, onShowDetails, isSelected }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha no disponible";
      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
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
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200
                    ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
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
      <div className="p-4">
        {/* Título y proveedor */}
        <div className="mb-3">
          <h3
            className="font-medium text-sm truncate mb-1"
            title={material.NombreMaterial}
          >
            {material.NombreMaterial}
          </h3>
          {material.Proveedor && (
            <div
              className="text-xs text-gray-600 truncate"
              title={material.Proveedor.NombreProveedor}
            >
              Proveedor: {material.Proveedor.NombreProveedor}
            </div>
          )}
        </div>

        {/* Detalles */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <PackageCheck className="w-3 h-3" />
            <span>{material.StockMaterial} unidades</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>{formatCurrency(material.PrecioMaterial)}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>Total: {formatCurrency(material.TotalMaterial)}</span>
          </div>
          {material.FechaCompraMaterial && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(material.FechaCompraMaterial)}</span>
            </div>
          )}
        </div>

        {/* Descripción */}
        {material.DescripcionMaterial && (
          <div className="mb-3">
            <p
              className="text-xs text-gray-600 line-clamp-2"
              title={material.DescripcionMaterial}
            >
              {material.DescripcionMaterial}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onShowDetails();
            }}
            className={`flex items-center justify-center gap-1 p-1.5 text-xs
                     border rounded-lg transition-all duration-200 ease-in-out
                     ${
                       isSelected
                         ? "text-blue-600 border-blue-600 bg-blue-50 hover:bg-blue-100"
                         : "text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                     }`}
          >
            <Info className="w-3 h-3" />
            <span>{isSelected ? "Ocultar" : "Detalles"}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
            className="flex items-center justify-center gap-1 p-1.5 text-xs text-blue-600 hover:text-blue-800
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
            className="flex items-center justify-center gap-1 p-1.5 text-xs text-red-600 hover:text-red-800
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