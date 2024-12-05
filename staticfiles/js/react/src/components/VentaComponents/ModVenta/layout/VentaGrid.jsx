import React from "react";
import {
  Pencil,
  DollarSign,
  Calendar,
  User,
  Package,
  Clock,
  ShoppingCart,
  Users,
} from "lucide-react";

const VentaGrid = ({ venta, onEdit }) => {
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
              #{venta.id} - {venta.nombre}
            </h3>
            <p className="text-sm text-gray-600 truncate max-w-[200px]">
              {venta.producto.nombre}
            </p>
          </div>
          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
            Venta Realizada
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Cliente Info */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-gray-500" />
          <div>
            <span className="text-xs text-gray-500 block">Cliente</span>
            <span className="font-medium text-sm">
              {venta.cliente?.nombre || "Cliente no especificado"}
            </span>
          </div>
        </div>

        {/* Detalles de la venta */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="w-4 h-4" />
              <span>Cantidad</span>
            </div>
            <span className="font-medium">{venta.cantidad}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Precio Unitario</span>
            </div>
            <span className="font-medium">
              {formatCurrency(venta.precio_venta)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Precio Total</span>
            </div>
            <span className="font-medium">
              {formatCurrency(venta.precio_total)}
            </span>
          </div>
        </div>

        {/* Info adicional */}
        <div className="space-y-2 text-sm border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>Usuario</span>
            </div>
            <span className="font-medium">{venta.usuario.nombre}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Fecha Venta</span>
            </div>
            <span className="font-medium">
              {formatDate(venta.fecha)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Fecha Registro</span>
            </div>
            <span className="font-medium">
              {formatDate(venta.fecha_registro)}
            </span>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-4 pt-4 border-t">
          <button
            type="button"
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-1 p-1.5 text-xs text-blue-600 hover:text-blue-800
                     border border-blue-600 hover:border-blue-800 rounded-lg
                     transition-all duration-200 ease-in-out hover:bg-blue-50"
          >
            <Pencil className="w-3 h-3" />
            <span>Editar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VentaGrid;