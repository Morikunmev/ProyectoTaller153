import React, { useState } from "react";
import { X, FileText, XCircle, Trash2 } from "lucide-react";
import { useProductoCreateModal } from "../hooks/useProductoCreateModal";
const ProductoCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const [materialSeleccionado, setMaterialSeleccionado] = useState("");
  const [cantidadMaterial, setCantidadMaterial] = useState("");
  const [descripcionMaterial, setDescripcionMaterial] = useState("");
  const [materialesAgregados, setMaterialesAgregados] = useState([]);
  const {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    categorias,
    materiales,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
  } = useProductoCreateModal({
    isOpen,
    onClose,
    onSubmit,
    materialesAgregados, // Añadir esta línea
  });

  const handleModalClose = () => {
    setMaterialSeleccionado("");
    setCantidadMaterial("");
    setDescripcionMaterial("");
    setMaterialesAgregados([]);
    handleClose();
  };

  const getInputBorderClass = (value) => {
    if (value && value.toString().trim() !== "") return "border-green-400";
    return "border-gray-300";
  };
  const handleAddMaterial = () => {
    if (!materialSeleccionado || !cantidadMaterial) return;

    const material = materiales.find(
      (m) => m.id === parseInt(materialSeleccionado)
    );
    if (!material) return;

    setMaterialesAgregados([
      ...materialesAgregados,
      {
        id: material.id,
        nombre: material.NombreMaterial,
        cantidad: cantidadMaterial,
        descripcion: descripcionMaterial,
      },
    ]);

    setMaterialSeleccionado("");
    setCantidadMaterial("");
    setDescripcionMaterial("");
  };

  const handleRemoveMaterial = (index) => {
    setMaterialesAgregados(materialesAgregados.filter((_, i) => i !== index));
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-16 right-0 bottom-0 w-[448px] bg-white shadow-xl z-40
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isAnimating ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex-none border-b">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nuevo Producto</h2>
          <button
            onClick={handleModalClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  Categoría
                </label>
                <select
                  name="Categoria"
                  value={formData.Categoria || ""}
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

              <div>
                <label className="text-sm font-medium block mb-1">
                  Estado del Producto
                </label>
                <input
                  type="text"
                  name="EstadoProducto"
                  value={formData.EstadoProducto}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900">
                  Materiales Utilizados
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Material
                    </label>
                    <select
                      value={materialSeleccionado}
                      onChange={(e) => setMaterialSeleccionado(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Seleccionar material</option>
                      {materiales?.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.NombreMaterial}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={cantidadMaterial}
                      onChange={(e) => setCantidadMaterial(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Descripción del uso
                  </label>
                  <textarea
                    value={descripcionMaterial}
                    onChange={(e) => setDescripcionMaterial(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    rows="2"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded font-medium"
                >
                  Agregar Material
                </button>

                {/* Lista de materiales agregados */}
                <div className="space-y-2">
                  {materialesAgregados.map((mat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{mat.nombre}</p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {mat.cantidad}
                        </p>
                        {mat.descripcion && (
                          <p className="text-sm text-gray-500">
                            {mat.descripcion}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(index)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Foto del Producto
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                  id="foto-producto"
                />
                <label
                  htmlFor="foto-producto"
                  className="px-3 py-1.5 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
                    transition-colors duration-150 text-sm"
                >
                  Seleccionar imagen
                </label>
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="h-10 w-10 object-cover rounded"
                    />
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
            onClick={handleModalClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm border rounded font-medium hover:bg-gray-50
    transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-black text-white rounded font-medium hover:bg-gray-800
              transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creando..." : "Crear Producto"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoCreateModal;
