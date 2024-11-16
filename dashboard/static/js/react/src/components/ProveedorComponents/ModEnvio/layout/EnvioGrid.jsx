import React from "react";
import {
  Calendar,
  Package,
  Pencil,
  Trash2,
  DollarSign,
  ShoppingCart,
  Clock,
} from "lucide-react";

const EnvioGrid = ({ envio, onEdit, onDelete }) => {
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

  const getDiasTranscurridosStyle = () => {
    if (envio.EnvioRecibido) return "bg-gray-100 text-gray-800";
    if (envio.DiasTranscurridos > 30) return "bg-red-100 text-red-800";
    if (envio.DiasTranscurridos > 15) return "bg-orange-100 text-orange-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Imagen/Preview */}
      <div className="w-full h-36 bg-gray-100 relative">
        {envio.FotoEnvio ? (
          <img
            src={envio.FotoEnvio}
            alt={`Envío: ${envio.NombreEnvio}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Badges en columna */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              envio.EnvioRecibido
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {envio.EnvioRecibido ? "Recibido" : "Pendiente"}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDiasTranscurridosStyle()}`}
          >
            {envio.DiasTranscurridos} días
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-2.5">
        {/* Título y tipo */}
        <div className="mb-2">
          <h3
            className="font-medium text-sm truncate"
            title={envio.NombreEnvio}
          >
            {envio.NombreEnvio}
          </h3>
          <div className="flex items-center mt-1">
            <span
              className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${
                envio.TipoEnvio === "material"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {envio.TipoEnvio === "material" ? "Material" : "Herramienta"}
            </span>
          </div>
          <div
            className="mt-1 text-xs text-gray-600 truncate"
            title={envio.Proveedor.NombreProveedor}
          >
            Proveedor: {envio.Proveedor.NombreProveedor}
          </div>
        </div>

        {/* Detalles en grid */}
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <ShoppingCart className="w-3 h-3" />
            <span>{envio.CantidadEnvio}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>{formatCurrency(envio.TotalEnvio)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(envio.FechaCompraEnvio)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{envio.DiasTranscurridos}d</span>
          </div>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1 p-1 text-xs text-blue-600 hover:text-blue-800
                     border border-blue-600 hover:border-blue-800 rounded-lg
                     transition-all duration-200 ease-in-out hover:bg-blue-50"
          >
            <Pencil className="w-3 h-3" />
            <span>Editar</span>
          </button>
          <button
            onClick={onDelete}
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

export default EnvioGrid;
