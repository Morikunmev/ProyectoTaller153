import React from "react";
import { Calendar, Package, Pencil, Trash2, DollarSign, ShoppingCart } from "lucide-react";

const EnvioGrid = ({ envio, onEdit, onDelete }) => {
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

  // Función para formatear el precio
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Imagen/Preview */}
      <div className="w-full h-48 bg-gray-100 relative">
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
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Badge de estado */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium
                      ${envio.EnvioRecibido 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'}`}>
          {envio.EnvioRecibido ? 'Recibido' : 'Pendiente'}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título y tipo */}
        <div className="mb-3">
          <h3
            className="font-medium text-lg mb-1 truncate"
            title={envio.NombreEnvio}
          >
            {envio.NombreEnvio}
          </h3>
          <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium
                        ${envio.TipoEnvio === 'material' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'}`}>
            {envio.TipoEnvio === 'material' ? 'Material' : 'Herramienta'}
          </span>
        </div>

        {/* Detalles del envío */}
        <div className="space-y-2 text-sm text-gray-600">
          {/* Proveedor */}
          <div className="truncate" title={envio.Proveedor.NombreProveedor}>
            Proveedor: {envio.Proveedor.NombreProveedor}
          </div>

          {/* Cantidad y Precio */}
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            <span>{envio.CantidadEnvio} unidades</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(envio.TotalEnvio)}</span>
          </div>

          {/* Fechas */}
          {envio.FechaCompraEnvio && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Compra: {formatDate(envio.FechaCompraEnvio)}</span>
            </div>
          )}
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

export default EnvioGrid;