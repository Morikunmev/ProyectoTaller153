import React from "react";
import {
  RefreshCw,
  Pencil,
  DollarSign,
  Calendar,
  AlertCircle,
  User,
  Package,
  Clock,
} from "lucide-react";

const PerdidaGrid = ({ perdida, onEdit, onRestablecer }) => {
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
              #{perdida.id} - {perdida.nombre}
            </h3>
            <p className="text-sm text-gray-600 truncate max-w-[200px]">
              {perdida.producto.nombre}
            </p>
          </div>
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            {perdida.motivo}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Stock Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-xs text-gray-500 block">Stock Inicial</span>
              <span className="font-medium text-sm">
                {perdida.producto.StockProductoInicial} unidades
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-xs text-gray-500 block">Stock Actual</span>
              <span className="font-medium text-sm">
                {perdida.producto.StockProductoActual} unidades
              </span>
            </div>
          </div>
        </div>

        {/* Detalles financieros */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="w-4 h-4" />
              <span>Cantidad</span>
            </div>
            <span className="font-medium">{perdida.cantidad}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Valor Unitario</span>
            </div>
            <span className="font-medium">
              {formatCurrency(perdida.valor_unitario)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Valor Total Original</span>
            </div>
            <span className="font-medium">
              {formatCurrency(perdida.cantidad * perdida.valor_unitario)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Valor Total Actual</span>
            </div>
            <span className="font-medium">
              {formatCurrency(perdida.valor_total)}
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
            <span className="font-medium">{perdida.usuario.nombre}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Última Modificación</span>
            </div>
            <span className="font-medium">
              {formatDate(perdida.ultima_modificacion)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Fecha Registro</span>
            </div>
            <span className="font-medium">
              {formatDate(perdida.fecha_registro)}
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
            onClick={onRestablecer}
            className="flex items-center justify-center gap-1 p-1.5 text-xs text-blue-600 hover:text-blue-800
                     border border-blue-600 hover:border-blue-800 rounded-lg
                     transition-all duration-200 ease-in-out hover:bg-blue-50"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerdidaGrid;
