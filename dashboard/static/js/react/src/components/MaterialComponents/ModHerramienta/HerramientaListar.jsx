import React, { useState } from "react";
import {
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Box,
  Info,
  X,
} from "lucide-react";
import PaginacionModHerramienta from "./PaginacionModHerramienta";
import HerramientaCreateModal from "./modals/HerramientaCreateModal";
import { useHerramientaState } from "./hooks/useHerramientaState";
import HerramientaDeleteModal from "./modals/HerramientaDeleteModal";
import HerramientaUpdateModal from "./modals/HerramientaUpdateModal";
import HerramientaGrid from "./layout/HerramientaGrid";
import HerramientaCard from "./layout/HerramientaCard";

const HerramientaListar = ({ isModalOpen, setIsModalOpen }) => {
  const [selectedHerramienta, setSelectedHerramienta] = useState(null);

  const {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    currentHerramientas,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredHerramientas,
    deleteModalOpen,
    herramientaToDelete,
    isDeleting,
    updateModalOpen,
    herramientaToUpdate,
    handleSearch,
    handleViewChange,
    handleHerramientaCreated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleHerramientaUpdated,
    handleExportClick,
    setDeleteModalOpen,
    setHerramientaToDelete,
  } = useHerramientaState();

  const handleShowDetails = (herramienta) => {
    setSelectedHerramienta(
      selectedHerramienta?.id === herramienta.id ? null : herramienta
    );
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderTableView = () => (
    <table className="w-full">
      <thead>
        <tr className="text-left text-gray-500 text-sm border-b bg-gray-50">
          <th className="p-2 font-medium">ID</th>
          <th className="p-2 font-medium w-12">FOTO</th>
          <th className="p-2 font-medium">NOMBRE</th>
          <th className="p-2 font-medium">STOCK</th>
          <th className="p-2 font-medium">PRECIO</th>
          <th className="p-2 font-medium">TOTAL</th>
          <th className="p-2 font-medium">FECHA COMPRA</th>
          <th className="p-2 font-medium">DESCRIPCIÓN</th>
          <th className="p-2 font-medium">MARCA</th>
          <th className="p-2 font-medium">MODELO</th>
          <th className="p-2 font-medium">PROVEEDOR</th>
          <th className="p-2 font-medium text-center">ACCIONES</th>
        </tr>
      </thead>
      <tbody>
        {currentHerramientas.map((herramienta) => (
          <tr
            key={herramienta.id}
            className={`border-b last:border-b-0 hover:bg-gray-50 
                      ${
                        selectedHerramienta?.id === herramienta.id
                          ? "bg-gray-50"
                          : ""
                      }`}
          >
            <td className="p-2 font-medium text-gray-900">#{herramienta.id}</td>
            <td className="p-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {herramienta.FotoHerramienta ? (
                  <img
                    src={herramienta.FotoHerramienta}
                    alt={`Herramienta: ${herramienta.NombreHerramienta}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.parentNode.classList.add("bg-gray-200");
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Box className="w-4 h-4 text-gray-400" />{" "}
                    {/* Cambiar Box por Tool */}
                  </div>
                )}
              </div>
            </td>
            <td className="p-2 font-medium">{herramienta.NombreHerramienta}</td>
            <td className="p-2">{herramienta.StockHerramienta}</td>
            <td className="p-2">
              ${herramienta.PrecioHerramienta.toLocaleString()}
            </td>
            <td className="p-2">
              ${herramienta.TotalHerramienta.toLocaleString()}
            </td>
            <td className="p-2">
              {new Date(
                herramienta.FechaCompraHerramienta
              ).toLocaleDateString()}
            </td>
            <td
              className="p-2 max-w-xs truncate"
              title={herramienta.DescripcionHerramienta}
            >
              {herramienta.DescripcionHerramienta || "Sin descripción"}
            </td>
            <td className="p-2">
              {herramienta.MarcaHerramienta || "Sin marca"}
            </td>
            <td className="p-2">
              {herramienta.ModeloHerramienta || "Sin modelo"}
            </td>
            <td className="p-2 text-gray-600">
              {herramienta.Proveedor
                ? herramienta.Proveedor.NombreProveedor
                : "Sin proveedor"}
            </td>
            <td className="p-2">
              <div className="flex justify-center gap-1">
                <button
                  type="button"
                  onClick={() => handleShowDetails(herramienta)}
                  className={`p-1 flex items-center gap-0.5 text-xs
                           transition-all duration-200 ease-in-out hover:scale-105 active:scale-95
                           ${
                             selectedHerramienta?.id === herramienta.id
                               ? "text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg"
                               : "text-gray-600 hover:text-gray-800"
                           }`}
                  title={
                    selectedHerramienta?.id === herramienta.id
                      ? "Ocultar detalles"
                      : "Ver detalles"
                  }
                >
                  <Info
                    className={`w-3.5 h-3.5 ${
                      selectedHerramienta?.id === herramienta.id
                        ? "animate-pulse"
                        : ""
                    }`}
                  />
                  {selectedHerramienta?.id === herramienta.id
                    ? "Ocultar"
                    : "Detalles"}
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateModalOpen(herramienta)}
                  className="p-1 text-blue-600 hover:text-blue-800 flex items-center gap-0.5 text-xs
                           transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                  title="Editar herramienta"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(herramienta)}
                  className="p-1 text-red-600 hover:text-red-800 flex items-center gap-0.5 text-xs
                           relative overflow-hidden group transition-all duration-200 ease-in-out 
                           hover:scale-105 active:scale-95"
                  title="Eliminar herramienta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
        {selectedHerramienta && (
          <tr>
            <td colSpan="12" className="p-4">
              <div className="animate-fadeIn">
                <HerramientaCard herramienta={selectedHerramienta} />
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const renderGridView = () => (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {currentHerramientas.map((herramienta) => (
          <HerramientaGrid
            key={herramienta.id}
            herramienta={herramienta}
            onEdit={() => handleUpdateModalOpen(herramienta)}
            onDelete={() => handleDelete(herramienta)}
            onShowDetails={() => handleShowDetails(herramienta)}
            isSelected={selectedHerramienta?.id === herramienta.id}
          />
        ))}
      </div>
      {selectedHerramienta && (
        <div className="border-t mt-4">
          <div className="animate-fadeIn p-4 bg-gray-50 rounded-lg m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Detalles de la Herramienta
              </h3>
              <button
                onClick={() => setSelectedHerramienta(null)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-lg
                         hover:bg-gray-200 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <HerramientaCard herramienta={selectedHerramienta} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div
        className={`transition-all duration-300 ease-in-out mt-16
        ${isModalOpen || updateModalOpen ? "pr-[448px]" : ""}`}
      >
        <div className="max-w-7xl mx-auto p-6">
          {/* Título y contador del módulo */}
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Módulo Herramienta
            </h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {filteredHerramientas.length} Herramientas
            </span>
          </div>

          {/* Barra de herramientas */}
          <div className="flex max-[790px]:flex-col justify-between items-center mb-6 max-[790px]:gap-4">
            {/* Barra de búsqueda */}
            <div className="relative w-[300px] max-[790px]:w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, marca o proveedor..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                         focus:outline-none focus:ring-1 focus:ring-blue-500
                         transition-colors duration-200"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Botones de vista */}
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

            {/* Botones de acción */}
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
                  <span className="ml-1">Crear Herramienta</span>
                </span>
              </button>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="bg-white rounded-lg shadow">
            {error ? (
              <div className="text-center p-8 text-red-500">
                <p className="text-lg">{error}</p>
              </div>
            ) : loading ? (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg">Cargando...</p>
              </div>
            ) : filteredHerramientas.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg">No se encontraron herramientas</p>
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
                    {isGridView ? renderGridView() : renderTableView()}
                  </div>
                </div>
                <div className="border-t">
                  <PaginacionModHerramienta
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePreviousPage={handlePreviousPage}
                    handleNextPage={handleNextPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={filteredHerramientas.length}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <HerramientaCreateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleHerramientaCreated}
      />
      <HerramientaDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setHerramientaToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        herramientaId={herramientaToDelete?.id}
        isDeleting={isDeleting}
      />
      <HerramientaUpdateModal
        isOpen={updateModalOpen}
        onClose={handleUpdateModalClose}
        herramienta={herramientaToUpdate}
        onHerramientaUpdated={handleHerramientaUpdated}
      />
    </div>
  );
};

export default HerramientaListar;
