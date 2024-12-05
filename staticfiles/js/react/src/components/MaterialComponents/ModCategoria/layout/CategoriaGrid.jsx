import React from "react";
import { Box, Pencil, Trash2 } from "lucide-react";

const CategoriaGrid = ({ categoria, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {categoria.FotoCategoria ? (
            <img
              src={categoria.FotoCategoria}
              alt={categoria.NombreCategoria}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
                e.target.parentNode.classList.add("bg-gray-200");
              }}
            />
          ) : (
            <Box className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            {categoria.NombreCategoria}
          </h3>
          <p className="text-sm text-gray-500 truncate max-w-[200px]">
            {categoria.DescripcionCategoria || "Sin descripción"}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Stock:</span>
          <span className="font-medium">{categoria.StockCategoria}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Productos Perdidos:</span>
          <span className="font-medium">
            {categoria.CantidadCategoriaPerdida}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Productos Vendidos:</span>
          <span className="font-medium">
            {categoria.CantidadCategoriaVenta}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total Ventas:</span>
          <span className="font-medium">
            ${categoria.TotalCategoriaVenta.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total Pérdidas:</span>
          <span className="font-medium">
            ${categoria.TotalCategoriaPerdida.toLocaleString()}
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
          onClick={onDelete}
          className="p-1.5 text-red-600 hover:text-red-800 flex items-center gap-1 text-xs
                   hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default CategoriaGrid;
