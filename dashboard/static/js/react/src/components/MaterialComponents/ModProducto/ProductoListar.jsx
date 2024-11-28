import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  ShoppingCart,
  Trash,
} from "lucide-react";
import PaginacionModProducto from "./PaginacionModProducto";
import ProductoCreateModal from "./modals/ProductoCreateModal";
import { useProductoState } from "./hooks/useProductoState";
import ProductoDeleteModal from "./modals/ProductoDeleteModal";
import ProductoUpdateModal from "./modals/ProductoUpdateModal";
import ProductoVenderModal from "./modals/ProductoVenderModal";
import ProductoDesecharModal from "./modals/ProductoDesecharModal";
import ProductoGrid from "./layout/ProductoGrid";
import { exportToExcel } from "./utils/ProductoExport";

const ProductoListar = () => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
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
    currentPage,
    startIndex,
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
    <table className="w-full">
      <thead>
        <tr className="text-left text-gray-500 text-sm border-b bg-gray-50">
          <th className="p-2 font-medium">ID</th>
          <th className="p-2 font-medium">NOMBRE</th>
          <th className="p-2 font-medium w-12">FOTO</th>
          <th className="p-2 font-medium">STOCK INICIAL</th>
          <th className="p-2 font-medium">STOCK ACTUAL</th>
          <th className="p-2 font-medium">PRECIO UNITARIO</th>
          <th className="p-2 font-medium">PRECIO TOTAL</th>
          <th className="p-2 font-medium">CATEGORÍA</th>
          <th className="p-2 font-medium">FECHA</th>
          <th className="p-2 font-medium text-center w-20">ACCIONES</th>
        </tr>
      </thead>
      <tbody>
        {currentProductos.map((producto) => (
          <tr
            key={producto.id}
            className="border-b last:border-b-0 hover:bg-gray-50"
          >
            <td className="p-2 font-medium">#{producto.id}</td>
            <td className="p-2 font-medium">{producto.NombreProducto}</td>
            <td className="p-2">
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
                    <span className="text-gray-400 text-[10px]">Sin foto</span>
                  </div>
                )}
              </div>
            </td>
            <td className="p-2">{producto.StockProductoInicial}</td>
            <td className="p-2">{producto.StockProductoActual}</td>
            <td className="p-2">${producto.PrecioUnitarioProducto}</td>
            <td className="p-2">${producto.PrecioTotalProducto}</td>
            <td className="p-2">{producto.Categoria.NombreCategoria}</td>
            <td className="p-2">{producto.FechaProducto}</td>
            <td className="p-2 relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(
                    openMenuId === producto.id ? null : producto.id
                  );
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center mx-auto transition-colors"
                title="Acciones"
              >
                <span className="text-xl font-medium text-gray-600">+</span>
              </button>

              {openMenuId === producto.id && (
                <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <button
                    onClick={() => {
                      handleUpdateModalOpen(producto);
                      setOpenMenuId(null);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2 text-blue-600"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>

                  {producto.StockProductoActual > 0 && (
                    <>
                      <button
                        onClick={() => {
                          handleVenderOpen(producto);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2 text-green-600"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Vender
                      </button>
                      <button
                        onClick={() => {
                          handleDesecharOpen(producto);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2 text-yellow-600"
                      >
                        <Trash className="w-4 h-4" />
                        Desechar
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      handleDelete(producto);
                      setOpenMenuId(null);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const handleExportClick = async () => {
    try {
      await exportToExcel();
    } catch (error) {
      console.error("Error en la exportación:", error);
    }
  };

  return (
    <div>
      <div
        className={`transition-all duration-300 ease-in-out mt-16
          ${isModalOpen || updateModalOpen ? "pr-[448px]" : ""}`}
      >
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Módulo Producto
            </h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {filteredProductos.length} Productos
            </span>
          </div>

          <div className="flex max-[790px]:flex-col justify-between items-center mb-6 max-[790px]:gap-4">
            <div className="relative w-[300px] max-[790px]:w-full">
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
                        {currentProductos.map((producto) => (
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
                      renderTableView()
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
      <ProductoDesecharModal
        isOpen={desecharModalOpen}
        onClose={handleDesecharClose}
        onDesechar={handleDesechar}
        producto={productoToDesechar}
      />
    </div>
  );
};

export default ProductoListar;
