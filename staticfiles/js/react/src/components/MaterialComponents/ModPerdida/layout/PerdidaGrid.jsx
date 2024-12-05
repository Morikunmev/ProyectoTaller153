import React from "react";
import { RefreshCw, Pencil } from "lucide-react";

const PerdidaGrid = ({ perdida, onEdit, onRestablecer }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="mb-4">
        <h3 className="font-medium text-gray-900">
          #{perdida.id} - {perdida.nombre}
        </h3>
        <p className="text-sm text-gray-500 truncate max-w-[200px]">
          {perdida.producto.nombre}
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500 block">Stock Inicial</span>
            <span className="font-medium">
              {perdida.producto.StockProductoInicial}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Stock Actual</span>
            <span className="font-medium">
              {perdida.producto.StockProductoActual}
            </span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Cantidad:</span>
          <span className="font-medium">{perdida.cantidad}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Valor Unitario:</span>
          <span className="font-medium">
            $
            {Number(perdida.valor_unitario).toLocaleString("es-CL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Valor Total Original:</span>
          <span className="font-medium">
            $
            {(perdida.cantidad * perdida.valor_unitario).toLocaleString(
              "es-CL",
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Valor Total Actual:</span>
          <span className="font-medium">
            $
            {Number(perdida.valor_total).toLocaleString("es-CL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Motivo:</span>
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            {perdida.motivo}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Usuario:</span>
          <span className="font-medium">{perdida.usuario.nombre}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Última Modificación:</span>
          <span className="font-medium">
            {new Date(perdida.ultima_modificacion).toLocaleDateString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Fecha Registro:</span>
          <span className="font-medium">
            {new Date(perdida.fecha_registro).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onEdit}
          className="p-1.5 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs
                   hover:bg-blue-50 rounded-lg transition-all duration-200"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </button>
        <button
          onClick={onRestablecer}
          className="p-1.5 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs
                   hover:bg-blue-50 rounded-lg transition-all duration-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Restablecer
        </button>
      </div>
    </div>
  );
};

export default PerdidaGrid;
