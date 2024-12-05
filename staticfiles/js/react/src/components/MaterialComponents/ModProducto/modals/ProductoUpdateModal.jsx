import React, { useEffect } from "react";
import { X, FileText, XCircle } from "lucide-react";
import { useProductoUpdateModal } from "../hooks/useProductoUpdateModal";

const ProductoUpdateModal = ({
  isOpen,
  onClose,
  producto,
  onProductoUpdated,
}) => {
  console.log("Modal props received:", { isOpen, producto });

  useEffect(() => {
    console.log("Modal props changed:", { isOpen, producto });
  }, [isOpen, producto]);

  const {
    formData,
    stockActual, // Agregamos esta línea
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    categorias,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
  } = useProductoUpdateModal({
    isOpen,
    onClose,
    producto,
    onProductoUpdated,
  });

  const getInputBorderClass = (value) => {
    if (value && value.toString().trim() !== "") {
      return "border-green-400";
    }
    return "border-gray-300";
  };

  if (!isOpen || !producto) return null;

  return (
    <div
      className={`fixed top-16 right-0 bottom-0 w-[448px] bg-white shadow-xl z-40
      transform transition-transform duration-300 ease-in-out flex flex-col
      ${isAnimating ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex-none border-b">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Editar Producto</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Principal */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Información Principal
              </h3>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Nombre*
                </label>
                <input
                  type="text"
                  name="NombreProducto"
                  value={formData.NombreProducto}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none
                    transition-colors duration-200 ${getInputBorderClass(
                      formData.NombreProducto
                    )}`}
                />
                {errors.NombreProducto && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.NombreProducto}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Categoría*
                </label>
                <select
                  name="Categoria"
                  value={formData.Categoria}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none
      transition-colors duration-200 ${getInputBorderClass(
        formData.Categoria
      )}`}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.NombreCategoria}
                    </option>
                  ))}
                </select>
                {errors.Categoria && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.Categoria}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Descripción
                </label>
                <textarea
                  name="DescripcionProducto"
                  value={formData.DescripcionProducto}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  rows="3"
                />
              </div>
            </div>

            {/* Información de Stock y Precios */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Stock y Precios
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Stock Inicial*
                  </label>
                  <input
                    type="number"
                    name="StockProductoInicial"
                    value={formData.StockProductoInicial}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none
                      transition-colors duration-200 ${getInputBorderClass(
                        formData.StockProductoInicial
                      )}`}
                  />
                  {errors.StockProductoInicial && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.StockProductoInicial}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    name="StockProductoActual"
                    value={stockActual} // Cambiamos esto de producto.StockProductoActual a stockActual
                    disabled
                    className="w-full px-3 py-1.5 border rounded bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Precio Unitario*
                  </label>
                  <input
                    type="number"
                    name="PrecioUnitarioProducto"
                    value={formData.PrecioUnitarioProducto}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none
                      transition-colors duration-200 ${getInputBorderClass(
                        formData.PrecioUnitarioProducto
                      )}`}
                  />
                  {errors.PrecioUnitarioProducto && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.PrecioUnitarioProducto}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Precio Total
                  </label>
                  <input
                    type="number"
                    name="PrecioTotalProducto"
                    value={producto.PrecioTotalProducto}
                    disabled
                    className="w-full px-3 py-1.5 border rounded bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Estado y Ubicación */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Estado y Ubicación
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="EstadoProducto"
                    value={formData.EstadoProducto}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="UbicacionProducto"
                    value={formData.UbicacionProducto}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Fecha de Producto
                  </label>
                  <input
                    type="date"
                    name="FechaProducto"
                    value={formData.FechaProducto}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dentro del componente ProductoUpdateModal, reemplazar la sección del checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="ProductoAgotado"
                  checked={formData.ProductoAgotado}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "ProductoAgotado",
                        value: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label className="text-sm font-medium">Producto Agotado</label>
              </div>

              {formData.ProductoAgotado && stockActual > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Cantidad Vendida
                    </label>
                    <input
                      type="number"
                      name="CantidadProductoVendido"
                      value={formData.CantidadProductoVendido}
                      onChange={handleInputChange}
                      min="0"
                      max={stockActual}
                      className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    {errors.CantidadProductoVendido && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.CantidadProductoVendido}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Cantidad Desechada
                    </label>
                    <input
                      type="number"
                      name="CantidadProductoDesechado"
                      value={formData.CantidadProductoDesechado}
                      onChange={handleInputChange}
                      min="0"
                      max={stockActual}
                      className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    {errors.CantidadProductoDesechado && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.CantidadProductoDesechado}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Foto del Producto */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Foto del Producto
              </h3>

              <div>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                    id="foto-producto-update"
                  />
                  <label
                    htmlFor="foto-producto-update"
                    className="px-3 py-1.5 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
                    transition-colors duration-150 text-sm"
                  >
                    Seleccionar imagen
                  </label>
                  {(previewUrl || formData.FotoProducto) && (
                    <div className="relative">
                      {formData.FotoProducto?.type?.startsWith("image/") ||
                      (!formData.FotoProducto?.type && previewUrl) ? (
                        <img
                          src={previewUrl}
                          alt="Vista previa"
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveFoto}
                        className="absolute -top-1 -right-1 bg-white rounded-full shadow-md 
                        hover:bg-gray-100 p-0.5 transition-colors duration-150"
                      >
                        <XCircle className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
                {errors.FotoProducto && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.FotoProducto}
                  </p>
                )}
              </div>
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                {errors.general}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="flex-none border-t bg-white p-4">
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm border rounded font-medium
                   hover:bg-gray-50 transition-all duration-150
                   disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-black text-white rounded font-medium
                   hover:bg-gray-800 transition-all duration-150
                   disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoUpdateModal;
