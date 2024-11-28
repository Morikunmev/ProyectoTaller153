import React from "react";
import { Tag, FileText, Pencil, Trash2, Package, ShoppingCart, Trash } from "lucide-react";

const ProductoGrid = ({ producto, onEdit, onDelete, onVender, onDesechar }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="w-full h-36 bg-gray-100 relative">
        {producto.FotoProducto ? (
          <img
            src={producto.FotoProducto}
            alt={producto.NombreProducto}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            #{producto.id}
          </span>
        </div>

        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Stock: {producto.StockProductoActual}/{producto.StockProductoInicial}
          </span>
        </div>

        {producto.porcentaje_stock_disponible < 20 && (
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Stock Bajo
            </span>
          </div>
        )}
      </div>

      <div className="p-2.5">
        <div className="mb-2">
          <div className="flex items-center gap-1 text-gray-800">
            <Package className="w-4 h-4" />
            <h3 className="font-medium text-sm truncate" title={producto.NombreProducto}>
              {producto.NombreProducto}
            </h3>
          </div>
        </div>

        <div className="space-y-1 text-xs text-gray-600 mb-2">
          <div>Precio: ${producto.PrecioUnitarioProducto}</div>
          <div>Categoría: {producto.Categoria.NombreCategoria}</div>
          {producto.UbicacionProducto && <div>Ubicación: {producto.UbicacionProducto}</div>}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          {producto.StockProductoActual > 0 && (
            <>
              <button
                onClick={onVender}
                className="flex items-center justify-center gap-1 p-1 text-xs text-green-600 hover:text-green-800
                       border border-green-600 hover:border-green-800 rounded-lg
                       transition-all duration-200 ease-in-out hover:bg-green-50"
              >
                <ShoppingCart className="w-3 h-3" />
                <span>Vender</span>
              </button>
              <button
                onClick={onDesechar}
                className="flex items-center justify-center gap-1 p-1 text-xs text-yellow-600 hover:text-yellow-800
                       border border-yellow-600 hover:border-yellow-800 rounded-lg
                       transition-all duration-200 ease-in-out hover:bg-yellow-50"
              >
                <Trash className="w-3 h-3" />
                <span>Desechar</span>
              </button>
            </>
          )}
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

export default ProductoGrid;