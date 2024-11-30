import React, { useState, useEffect } from "react";
import { X, Package } from "lucide-react";

const ProductoDetalle = ({ isOpen, onClose, producto }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;
  if (!producto) return null;

  return (
    <div
      className={`fixed top-16 right-0 bottom-0 w-[448px] bg-white shadow-xl z-40 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      onTransitionEnd={() => !isOpen && setIsAnimating(false)}
    >
      <div className="flex-none border-b">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Detalles del Producto</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Info Básica */}
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {producto.FotoProducto ? (
                <img
                  src={producto.FotoProducto}
                  alt={producto.NombreProducto}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Producto</h3>
                <p className="text-lg">{producto.NombreProducto}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Categoría</h3>
                <p>{producto.Categoria?.NombreCategoria}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                <p>{producto.ProductoAgotado ? "Agotado" : "Disponible"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Ubicación</h3>
                <p>{producto.UbicacionProducto || "No especificada"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Estado del Producto
                </h3>
                <p>{producto.EstadoProducto || "No especificado"}</p>
              </div>
            </div>
          </div>

          {/* Stock y Precios */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Stock Inicial</p>
              <p className="text-lg font-medium">
                {producto.StockProductoInicial}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Stock Actual</p>
              <p className="text-lg font-medium">
                {producto.StockProductoActual}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Precio Unit.</p>
              <p className="text-lg font-medium">
                ${producto.PrecioUnitarioProducto}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Precio Total</p>
              <p className="text-lg font-medium">
                ${producto.PrecioTotalProducto}
              </p>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Fecha Creación</p>
              <p className="text-lg font-medium">
                {new Date(producto.FechaProducto).toLocaleDateString()}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Hora Creación</p>
              <p className="text-lg font-medium">
                {new Date(producto.HoraCreacion).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Materiales */}
          <div>
            <h3 className="text-sm font-medium mb-2">Materiales Utilizados</h3>
            <div className="space-y-2">
              {producto.materiales?.map((material) => (
                <div key={material.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{material.material.nombre}</p>
                  <p className="text-sm text-gray-600">
                    Cantidad: {material.cantidad}
                  </p>
                  {material.descripcion && (
                    <p className="text-sm text-gray-500">
                      {material.descripcion}
                    </p>
                  )}
                </div>
              ))}
              {(!producto.materiales || producto.materiales.length === 0) && (
                <p className="text-gray-500 text-sm">
                  No hay materiales registrados
                </p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-sm font-medium mb-2">Descripción</h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
              {producto.DescripcionProducto || "Sin descripción"}
            </p>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 p-2 rounded-lg text-center">
              <p className="text-sm text-green-600">Vendidos</p>
              <p className="text-lg font-medium text-green-700">
                {producto.CantidadProductoVendido}
              </p>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg text-center">
              <p className="text-sm text-yellow-600">Desechados</p>
              <p className="text-lg font-medium text-yellow-700">
                {producto.CantidadProductoDesechado}
              </p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg text-center">
              <p className="text-sm text-blue-600">Disponible</p>
              <p className="text-lg font-medium text-blue-700">
                {producto.porcentaje_stock_disponible?.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Días en Stock */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Días en Stock</p>
            <p className="text-lg font-medium">{producto.DiasProducto} días</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;
