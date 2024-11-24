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
import PaginacionModMaterial from "./PaginacionModMaterial";
import MaterialCreateModal from "./modals/MaterialCreateModal";
import { useMaterialState } from "./hooks/useMaterialState";
import MaterialDeleteModal from "./modals/MaterialDeleteModal";
import MaterialUpdateModal from "./modals/MaterialUpdateModal";
import MaterialGrid from "./layout/MaterialGrid";
import MaterialCard from "./layout/MaterialCard";

const MaterialListar = ({ isModalOpen, setIsModalOpen }) => {
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    currentMaterials,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredMaterials,
    deleteModalOpen,
    materialToDelete,
    isDeleting,
    updateModalOpen,
    materialToUpdate,
    handleSearch,
    handleViewChange,
    handleMaterialCreated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleMaterialUpdated,
    handleExportClick,
    setDeleteModalOpen,
    setMaterialToDelete,
  } = useMaterialState();

  const handleShowDetails = (material) => {
    setSelectedMaterial(selectedMaterial?.id === material.id ? null : material);
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
          <th className="p-2 font-medium">PROVEEDOR</th>
          <th className="p-2 font-medium text-center">ACCIONES</th>
        </tr>
      </thead>
      <tbody>
        {currentMaterials.map((material) => (
          <tr
            key={material.id}
            className={`border-b last:border-b-0 hover:bg-gray-50 
                      ${
                        selectedMaterial?.id === material.id ? "bg-gray-50" : ""
                      }`}
          >
            <td className="p-2 font-medium text-gray-900">#{material.id}</td>
            <td className="p-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {material.FotoMaterial ? (
                  <img
                    src={material.FotoMaterial}
                    alt={`Material: ${material.NombreMaterial}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.parentNode.classList.add("bg-gray-200");
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Box className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            </td>
            <td className="p-2 font-medium">{material.NombreMaterial}</td>
            <td className="p-2">{material.StockMaterial}</td>
            <td className="p-2">${material.PrecioMaterial.toLocaleString()}</td>
            <td className="p-2">${material.TotalMaterial.toLocaleString()}</td>
            <td className="p-2">
              {new Date(material.FechaCompraMaterial).toLocaleDateString()}
            </td>
            <td
              className="p-2 max-w-xs truncate"
              title={material.DescripcionMaterial}
            >
              {material.DescripcionMaterial || "Sin descripción"}
            </td>
            <td className="p-2 text-gray-600">
              {material.Proveedor
                ? material.Proveedor.NombreProveedor
                : "Sin proveedor"}
            </td>
            <td className="p-2">
              <div className="flex justify-center gap-1">
                <button
                  type="button"
                  onClick={() => handleShowDetails(material)}
                  className={`p-1 flex items-center gap-0.5 text-xs
                           transition-all duration-200 ease-in-out hover:scale-105 active:scale-95
                           ${
                             selectedMaterial?.id === material.id
                               ? "text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg"
                               : "text-gray-600 hover:text-gray-800"
                           }`}
                  title={
                    selectedMaterial?.id === material.id
                      ? "Ocultar detalles"
                      : "Ver detalles"
                  }
                >
                  <Info
                    className={`w-3.5 h-3.5 ${
                      selectedMaterial?.id === material.id
                        ? "animate-pulse"
                        : ""
                    }`}
                  />
                  {selectedMaterial?.id === material.id
                    ? "Ocultar"
                    : "Detalles"}
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateModalOpen(material)}
                  className="p-1 text-blue-600 hover:text-blue-800 flex items-center gap-0.5 text-xs
                           transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                  title="Editar material"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(material)}
                  className="p-1 text-red-600 hover:text-red-800 flex items-center gap-0.5 text-xs
                           relative overflow-hidden group transition-all duration-200 ease-in-out 
                           hover:scale-105 active:scale-95"
                  title="Eliminar material"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
        {selectedMaterial && (
          <tr>
            <td colSpan="10" className="p-4">
              <div className="animate-fadeIn">
                <MaterialCard material={selectedMaterial} />
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
        {currentMaterials.map((material) => (
          <MaterialGrid
            key={material.id}
            material={material}
            onEdit={() => handleUpdateModalOpen(material)}
            onDelete={() => handleDelete(material)}
            onShowDetails={() => handleShowDetails(material)}
            isSelected={selectedMaterial?.id === material.id}
          />
        ))}
      </div>
      {selectedMaterial && (
        <div className="border-t mt-4">
          <div className="animate-fadeIn p-4 bg-gray-50 rounded-lg m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Detalles del Material
              </h3>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-lg
                         hover:bg-gray-200 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <MaterialCard material={selectedMaterial} />
          </div>
        </div>
      )}
    </div>
  );
  return (
    <div>
      {/* Contenido principal que se comprimirá */}
      <div
        className={`transition-all duration-300 ease-in-out mt-16
        ${isModalOpen || updateModalOpen ? "pr-[448px]" : ""}`}
      >
        <div className="max-w-7xl mx-auto p-6">
          {/* Título y contador del módulo */}
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Módulo Material
            </h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {filteredMaterials.length} Materiales
            </span>
          </div>

          {/* Barra de herramientas */}
          <div className="flex max-[790px]:flex-col justify-between items-center mb-6 max-[790px]:gap-4">
            {/* Barra de búsqueda */}
            <div className="relative w-[300px] max-[790px]:w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o proveedor..."
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
                  <span className="ml-1">Crear Material</span>
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
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg">No se encontraron materiales</p>
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
                  <PaginacionModMaterial
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePreviousPage={handlePreviousPage}
                    handleNextPage={handleNextPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={filteredMaterials.length}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <MaterialCreateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleMaterialCreated}
      />
      <MaterialDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMaterialToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        materialId={materialToDelete?.id}
        isDeleting={isDeleting}
      />
      <MaterialUpdateModal
        isOpen={updateModalOpen}
        onClose={handleUpdateModalClose}
        material={materialToUpdate}
        onMaterialUpdated={handleMaterialUpdated}
      />
    </div>
  );
};

export default MaterialListar;
