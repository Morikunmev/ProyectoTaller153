import React from "react";
import { Calendar, FileText, Pencil, Trash2 } from "lucide-react";

const FacturaGrid = ({ factura, onEdit, onDelete }) => {
  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return "Fecha no disponible";
      }

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      return new Intl.DateTimeFormat("es-ES", options).format(date);
    } catch (error) {
      console.error("Error al formatear la fecha:", error, dateString);
      return "Fecha no disponible";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Imagen/Preview */}
      <div className="w-full h-48 bg-gray-100 relative">
        {factura.FotoFactura ? (
          <img
            src={factura.FotoFactura}
            alt={`Factura de ${factura.Proveedor.NombreProveedor}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Información del Proveedor */}
        <h3
          className="font-medium text-lg mb-2 truncate"
          title={factura.Proveedor.NombreProveedor}
        >
          {factura.Proveedor.NombreProveedor}
        </h3>

        {/* Fecha de Emisión */}
        <div className="space-y-2 mb-4">
          {/* Fecha de Emisión con icono */}
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Emitida el {formatDate(factura.FechaEmision)}</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-2 p-2 text-blue-600 hover:text-blue-800
                     border border-blue-600 hover:border-blue-800 rounded-lg
                     transition-all duration-200 ease-in-out hover:bg-blue-50"
          >
            <Pencil className="w-4 h-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 p-2 text-red-600 hover:text-red-800
                     border border-red-600 hover:border-red-800 rounded-lg
                     transition-all duration-200 ease-in-out hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacturaGrid;
