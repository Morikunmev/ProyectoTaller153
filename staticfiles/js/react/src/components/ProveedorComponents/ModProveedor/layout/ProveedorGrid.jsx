import React from "react";
import { Calendar, UserCircle, Pencil, Trash2 } from "lucide-react";

const ProveedorGrid = ({ proveedor, onEdit, onDelete }) => {
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
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      return new Intl.DateTimeFormat("es-ES", options).format(date);
    } catch (error) {
      console.error("Error al formatear la fecha:", error, dateString);
      return "Fecha no disponible";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Imagen/Preview */}
      <div className="w-full h-48 bg-gray-100 relative">
        {proveedor.FotoProveedor ? (
          <img
            src={proveedor.FotoProveedor}
            alt={`Vista previa de ${proveedor.NombreProveedor}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserCircle className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Contenido con scroll automático */}
      <div className="p-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {/* Nombre */}
        <h3
          className="font-medium text-lg mb-2"
          title={proveedor.NombreProveedor}
        >
          {proveedor.NombreProveedor}
        </h3>

        {/* RUT y Fecha de Creación */}
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-500">RUT: {proveedor.RutProveedor}</p>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="break-words">
              Creado el {formatDate(proveedor.FechaCreacionProveedor)}
            </span>
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

export default ProveedorGrid;
