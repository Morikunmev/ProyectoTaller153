import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  ShoppingCart,
  Trash,
  Package,
  FileText,
} from "lucide-react";
import PaginacionModProducto from "./PaginacionModProducto";
import ProductoCreateModal from "./modals/ProductoCreateModal";
import { useProductoState } from "./hooks/useProductoState";
import ProductoDeleteModal from "./modals/ProductoDeleteModal";
import ProductoUpdateModal from "./modals/ProductoUpdateModal";
import ProductoVenderModal from "./modals/ProductoVenderModal";
import ProductoPerdidaModal from "./modals/ProductoPerdidaModal"; // Cambia esta líneaimport ProductoGrid from "./layout/ProductoGrid";
import { exportToExcel } from "./utils/ProductoExport";
import ProductoGrid from "./layout/ProductoGrid";
import ProductoDetalle from "./ProductoDetalle";

const ProductoListar = () => {
  const [stockFilter, setStockFilter] = useState("all"); // 'all', 'inStock', 'outOfStock'
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    isModalOpen,
    currentProductos,
    totalPages,
    categorySearchTerm, // Agregar esto
    currentPage,
    startIndex,
    handleCategorySearch, // Agregar esto
    endIndex,
    filteredProductos,
    deleteModalOpen,
    productoToDelete,
    isDeleting,
    updateModalOpen,
    productoToUpdate,
    venderModalOpen,
    productoToVender,
    desecharModalOpen,
    productoToDesechar,
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleProductoCreated,
    handleProductoUpdated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleVenderOpen,
    handleVenderClose,
    handleDesecharOpen,
    handleDesecharClose,
    handleVender,
    handleDesechar,
    setDeleteModalOpen,
    setProductoToDelete,
  } = useProductoState();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const renderTableView = () => (
    
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b bg-gray-50 text-xs">
            <th className="px-2 py-1.5">ID</th>
            <th className="px-2 py-1.5">NOMBRE</th>
            <th className="px-2 py-1.5 w-10">FOTO</th>
            <th className="px-2 py-1.5">STOCK I.</th>
            <th className="px-2 py-1.5">STOCK A.</th>
            <th className="px-2 py-1.5">P.UNIT</th>
            <th className="px-2 py-1.5">P.TOTAL A</th>
            <th className="px-2 py-1.5">CATEGORÍA</th>
            <th className="px-2 py-1.5">FECHA</th>
            <th className="px-2 py-1.5">DÍAS</th>
            <th className="px-2 py-1.5">VEND.</th>
            <th className="px-2 py-1.5">DESC.</th>
            <th className="px-2 py-1.5 w-16 text-center">DETALLES</th>
            <th className="px-2 py-1.5 w-24 text-center">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {displayedProductos.map((producto) => (
            <tr
              key={producto.id}
              className={`border-b last:border-b-0 hover:bg-gray-50 text-xs
                ${
                  producto.StockProductoActual === 0
                    ? "bg-red-50 hover:bg-red-100"
                    : producto.StockProductoActual === 1
                    ? "bg-yellow-50 hover:bg-yellow-100"
                    : "bg-green-50 hover:bg-green-100"
                }`}
            >
              <td className="px-2 py-1.5">#{producto.id}</td>
              <td className="px-2 py-1.5">{producto.NombreProducto}</td>
              <td className="px-2 py-1.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {producto.FotoProducto ? (
                    <img
                      src={producto.FotoProducto}
                      alt={producto.NombreProducto}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        e.target.parentNode.classList.add("bg-gray-200");
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-2 py-1.5">{producto.StockProductoInicial}</td>
              <td className="px-2 py-1.5">{producto.StockProductoActual}</td>
              <td className="px-2 py-1.5">
                ${producto.PrecioUnitarioProducto}
              </td>
              <td className="px-2 py-1.5">${producto.PrecioTotalProducto}</td>
              <td className="px-2 py-1.5">
                {producto.Categoria?.NombreCategoria}
              </td>
              <td className="px-2 py-1.5">
                {new Date(producto.FechaProducto).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </td>
              <td className="px-2 py-1.5 text-gray-600">
                {producto.DiasProducto} días
              </td>
              <td className="px-2 py-1.5 text-green-600">
                {producto.CantidadProductoVendido}
              </td>
              <td className="px-2 py-1.5 text-yellow-600">
                {producto.CantidadProductoDesechado}
              </td>
              <td className="px-2 py-1.5 text-center">
                <button
                  onClick={() => handleDetailsClick(producto)}
                  className="inline-flex p-1 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </td>
              <td className="px-2 py-1.5">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => handleVenderOpen(producto)}
                    disabled={producto.StockProductoActual === 0}
                    className={`p-1 rounded ${
                      producto.StockProductoActual === 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDesecharOpen(producto)}
                    disabled={producto.StockProductoActual === 0}
                    className={`p-1 rounded ${
                      producto.StockProductoActual === 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-yellow-600 hover:bg-yellow-50"
                    }`}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateModalOpen(producto)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(producto)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
    
  );
  const handleExportClick = async () => {
    try {
      await exportToExcel();
    } catch (error) {
      console.error("Error en la exportación:", error);
    }
  };
  const handleDetailsClick = (producto) => {
    setSelectedProduct(producto);
    setDetalleModalOpen(true);
  };
  const displayedProductos = filteredProductos.filter((producto) => {
    switch (stockFilter) {
      case "inStock":
        return producto.StockProductoActual > 1;
      case "outOfStock":
        return producto.StockProductoActual === 0;
      case "lowStock":
        return producto.StockProductoActual === 1;
      default:
        return true;
    }
  });

  return (
    <div>
      <div
        className={`transition-all duration-300 ease-in-out mt-16
    ${
      isModalOpen ||
      updateModalOpen ||
      detalleModalOpen ||
      desecharModalOpen ||
      venderModalOpen
        ? "pr-[448px]"
        : ""
    }`}
      >
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Módulo Producto
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setStockFilter("all")}
                className={`px-3 py-1 rounded-full transition-colors duration-200 ${
                  stockFilter === "all"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filteredProductos.length} Total{" "}
                <span className="text-xs ml-1">
                  (Original: $
                  {filteredProductos
                    .reduce(
                      (sum, p) =>
                        sum + p.StockProductoInicial * p.PrecioUnitarioProducto,
                      0
                    )
                    .toLocaleString()}
                  ) (Actual: $
                  {filteredProductos
                    .reduce(
                      (sum, p) => sum + parseFloat(p.PrecioTotalProducto),
                      0
                    )
                    .toLocaleString()}
                  )
                </span>
              </button>
              <button
                onClick={() => setStockFilter("inStock")}
                className={`px-3 py-1 rounded-full transition-colors duration-200 ${
                  stockFilter === "inStock"
                    ? "bg-green-200 text-green-800"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {
                  filteredProductos.filter((p) => p.StockProductoActual > 1)
                    .length
                }{" "}
                Con Stock
              </button>
              <button
                onClick={() => setStockFilter("lowStock")}
                className={`px-3 py-1 rounded-full transition-colors duration-200 ${
                  stockFilter === "lowStock"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                {
                  filteredProductos.filter((p) => p.StockProductoActual === 1)
                    .length
                }{" "}
                Stock Bajo
              </button>
              <button
                onClick={() => setStockFilter("outOfStock")}
                className={`px-3 py-1 rounded-full transition-colors duration-200 ${
                  stockFilter === "outOfStock"
                    ? "bg-red-200 text-red-800"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {
                  filteredProductos.filter((p) => p.StockProductoActual === 0)
                    .length
                }{" "}
                Sin Stock
              </button>
            </div>
          </div>
          <div className="flex max-[790px]:flex-col justify-between items-center mb-6 max-[790px]:gap-4">
            {/* Búsquedas */}
            <div className="flex gap-4 max-[790px]:w-full">
              <div className="relative w-[300px] max-[790px]:flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                 focus:outline-none focus:ring-1 focus:ring-blue-500
                 transition-colors duration-200"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="relative w-[300px] max-[790px]:flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar categoría..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
           focus:outline-none focus:ring-1 focus:ring-blue-500
           transition-colors duration-200"
                  value={categorySearchTerm}
                  onChange={(e) => handleCategorySearch(e.target.value)} // Usar el handler del hook
                />
              </div>
            </div>

            {/* Vista Lista/Grid */}
            <div className="max-[790px]:w-full flex justify-center">
              <div className="flex bg-white border rounded-lg overflow-hidden">
                <button
                  onClick={() => handleViewChange(false)}
                  className={`p-2 transition-colors duration-200 ${
                    !isGridView
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Vista de lista"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleViewChange(true)}
                  className={`p-2 transition-colors duration-200 ${
                    isGridView
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Vista de cuadrícula"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center space-x-3 max-[790px]:w-full">
              <button
                onClick={handleExportClick}
                className="group relative bg-green-600 text-white px-4 py-2 rounded-lg 
               hover:bg-green-700 active:bg-green-800
               transition-all duration-200 ease-out 
               hover:shadow-lg active:shadow-none
               transform active:scale-95 max-[790px]:flex-1"
              >
                <span className="flex items-center max-[790px]:justify-center">
                  <svg
                    className="w-4 h-4 mr-2 inline-block transform transition-transform duration-200 group-hover:scale-110"
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Generar Excel</span>
                </span>
              </button>
              <button
                onClick={handleOpenModal}
                className="group relative bg-black text-white px-4 py-2 rounded-lg 
              hover:bg-gray-800 active:bg-gray-900
              transition-all duration-200 ease-out 
              hover:shadow-lg active:shadow-none
              transform active:scale-95 max-[790px]:flex-1"
              >
                <span className="flex items-center max-[790px]:justify-center">
                  <span className="inline-block transform transition-transform duration-200 group-hover:translate-x-[-2px]">
                    +
                  </span>
                  <span className="ml-1">Crear Producto</span>
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            {error ? (
              <div className="text-center p-8 text-red-500">
                <p className="text-lg">{error}</p>
              </div>
            ) : loading ? (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg">Cargando...</p>
              </div>
            ) : filteredProductos.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg">No se encontraron productos</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div
                    className={`transition-opacity duration-300 ease-in-out
                              ${
                                isChangingView || isSearching
                                  ? "opacity-0"
                                  : "opacity-100"
                              }`}
                  >
                    {isGridView ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                        {displayedProductos.map((producto) => (
                          <ProductoGrid
                            key={producto.id}
                            producto={producto}
                            onEdit={() => handleUpdateModalOpen(producto)}
                            onDelete={() => handleDelete(producto)}
                            onVender={() => handleVenderOpen(producto)}
                            onDesechar={() => handleDesecharOpen(producto)}
                          />
                        ))}
                      </div>
                    ) : (
                      renderTableView(displayedProductos)
                    )}
                  </div>
                </div>
                <div className="border-t">
                  <PaginacionModProducto
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePreviousPage={handlePreviousPage}
                    handleNextPage={handleNextPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={filteredProductos.length}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ProductoCreateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleProductoCreated}
      />
      <ProductoDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProductoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        productoId={productoToDelete?.id}
        producto={productoToDelete} // Asegurarnos que pasamos el producto completo
        isDeleting={isDeleting}
      />
      <ProductoUpdateModal
        isOpen={updateModalOpen}
        onClose={handleUpdateModalClose}
        producto={productoToUpdate}
        onProductoUpdated={handleProductoUpdated}
      />
      <ProductoVenderModal
        isOpen={venderModalOpen}
        onClose={handleVenderClose}
        onVender={handleVender}
        producto={productoToVender}
      />
      <ProductoPerdidaModal
        isOpen={desecharModalOpen}
        onClose={handleDesecharClose}
        onSubmit={handleDesechar}
        producto={productoToDesechar}
      />
      <ProductoDetalle
        isOpen={detalleModalOpen}
        onClose={() => setDetalleModalOpen(false)}
        producto={selectedProduct}
      />
    </div>
  );
};

export default ProductoListar;
