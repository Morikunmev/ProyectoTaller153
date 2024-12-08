import React from "react";
import {
  Trash2,
  Pencil,
  DollarSign,
  Calendar,
  User,
  Phone,
  Building2,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

const ClienteGrid = ({ cliente, onEdit, onDelete }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error al formatear la fecha:", error);
      return "Fecha no disponible";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Encabezado */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              #{cliente.id} - {cliente.nombre} {cliente.apellido}
            </h3>
            <p className="text-sm text-gray-600 truncate max-w-[200px]">
              {cliente.rut}
            </p>
          </div>
          <span className={`px-2 py-0.5 ${cliente.tipo === 'empresa' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} rounded-full text-xs`}>
            {cliente.tipo === 'empresa' ? 'Empresa' : 'Particular'}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Información de Cliente */}
        {cliente.tipo === 'empresa' && (
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-xs text-gray-500 block">Compañía</span>
              <span className="font-medium text-sm">{cliente.nombre_compania || 'No especificado'}</span>
            </div>
          </div>
        )}

        {/* Detalles de contacto */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>Teléfono</span>
            </div>
            <span className="font-medium">{cliente.telefono || 'No especificado'}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <ShoppingBag className="w-4 h-4" />
              <span>Total Compras</span>
            </div>
            <span className="font-medium">{cliente.cantidad_total_compras}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Total Dinero</span>
            </div>
            <span className="font-medium">
              {formatCurrency(cliente.total_dinero_compras)}
            </span>
          </div>
        </div>

        {/* Info adicional */}
        <div className="space-y-2 text-sm border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>Usuario Registro</span>
            </div>
            <span className="font-medium">{cliente.usuario?.nombre || 'Sistema'}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Fecha Registro</span>
            </div>
            <span className="font-medium">
              {formatDate(cliente.fecha_registro)}
            </span>
          </div>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center justify-center gap-1 p-1.5 text-xs text-blue-600 hover:text-blue-800
                     border border-blue-600 hover:border-blue-800 rounded-lg
                     transition-all duration-200 ease-in-out hover:bg-blue-50"
          >
            <Pencil className="w-3 h-3" />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
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

export default ClienteGrid;