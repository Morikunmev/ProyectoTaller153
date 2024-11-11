import React from "react";
import {
  Search,
  UserCircle,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
} from "lucide-react";
import PaginacionModProveedor from "./PaginacionModProveedor";
import ProveedorCreateModal from "./modals/ProveedorCreateModal";
import { useProveedorState } from "./hooks/useProveedorState";
import ProveedorDeleteModal from "./modals/ProveedorDeleteModal";
import ProveedorUpdateModal from "./modals/ProveedorUpdateModal";
import ProveedorGrid from "./layout/ProveedorGrid";
import { exportToExcel } from "./utils/proveedorExport";

const ProveedorListar = () => {
  const {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    isModalOpen,
    currentProveedores,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredProveedores,
    // Estados de eliminación
    deleteModalOpen,
    proveedorToDelete,
    isDeleting,
    // Estados de actualización
    updateModalOpen,
    proveedorToUpdate,
    isUpdating,
    // Manejadores
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleProveedorCreated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleProveedorUpdated,
    setDeleteModalOpen,
    setProveedorToDelete,
  } = useProveedorState();

  // Renderizado de botones de acción
  const renderActionButtons = (proveedor) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleUpdateModalOpen(proveedor)}
        className="p-1.5 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm
                   transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
        title="Editar proveedor"
      >
        <Pencil className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
        Editar
      </button>
      <button
        onClick={() => handleDelete(proveedor)}
        className="p-1.5 text-red-600 hover:text-red-800 flex items-center gap-1 text-sm
                   relative overflow-hidden group transition-all duration-200 ease-in-out 
                   hover:scale-105 active:scale-95"
        title="Eliminar proveedor"
      >
        <span
          className="absolute inset-0 bg-red-100 opacity-0 group-hover:opacity-100 
                       transition-opacity duration-200 rounded-md"
        ></span>
        <Trash2
          className="w-4 h-4 relative z-10 transition-transform duration-200 
                          group-hover:scale-110 group-hover:rotate-12"
        />
        <span className="relative z-10">Eliminar</span>
      </button>
    </div>
  );

  // Renderizado de vistas
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {currentProveedores.map((proveedor) => (
        <ProveedorGrid
          key={proveedor.id}
          proveedor={proveedor}
          onEdit={() => handleUpdateModalOpen(proveedor)}
          onDelete={() => handleDelete(proveedor)}
        />
      ))}
    </div>
  );
  const handleExportClick = async () => {
    try {
      await exportToExcel();
    } catch (error) {
      // Aquí podrías mostrar una notificación de error al usuario
      console.error("Error en la exportación:", error);
    }
  };

  const renderTableView = () => (
    <table className="w-full">
      <thead>
        <tr className="text-left text-gray-500 text-sm border-b bg-gray-50">
          <th className="p-4 font-medium w-16">FOTO</th>
          <th className="p-4 font-medium">NOMBRE</th>
          <th className="p-4 font-medium">RUT</th>
          <th className="p-4 font-medium">MARCA</th>
          <th className="p-4 font-medium">COMENTARIO</th>
          <th className="p-4 font-medium">CIUDAD</th>
          <th className="p-4 font-medium">REGIÓN</th>
          <th className="p-4 font-medium">PAÍS</th>
          <th className="p-4 font-medium">TELÉFONO</th>
          <th className="p-4 font-medium text-center">ACCIONES</th>
        </tr>
      </thead>
      <tbody>
        {currentProveedores.map((proveedor) => (
          <tr
            key={proveedor.id}
            className="border-b last:border-b-0 hover:bg-gray-50"
          >
            <td className="p-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {proveedor.FotoProveedor ? (
                  <>
                    <img
                      src={proveedor.FotoProveedor}
                      alt={`Foto de ${proveedor.NombreProveedor}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center">
                      <UserCircle className="w-6 h-6 text-gray-400" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            </td>
            <td className="p-4 font-medium">{proveedor.NombreProveedor}</td>
            <td className="p-4 text-gray-600">{proveedor.RutProveedor}</td>
            <td className="p-4 text-gray-600">{proveedor.MarcaProveedor}</td>
            <td className="p-4 text-gray-600">
              {proveedor.ComentarioProveedor ? (
                <div
                  className="max-w-xs truncate"
                  title={proveedor.ComentarioProveedor}
                >
                  {proveedor.ComentarioProveedor}
                </div>
              ) : (
                "-"
              )}
            </td>
            <td className="p-4 text-gray-600">
              {proveedor.CiudadProveedor || "-"}
            </td>
            <td className="p-4 text-gray-600">
              {proveedor.RegionProveedor || "-"}
            </td>
            <td className="p-4 text-gray-600">
              {proveedor.PaisProveedor || "-"}
            </td>
            <td className="p-4 text-gray-600">
              {proveedor.TelefonoProveedor || "-"}
            </td>
            <td className="p-4">
              <div className="flex justify-center">
                {renderActionButtons(proveedor)}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header: Búsqueda, Vista y Botón Crear */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Barra de búsqueda */}
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proveedor..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                 focus:outline-none focus:ring-1 focus:ring-blue-500
                 transition-colors duration-200"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Botones de vista */}
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

        {/* Contenedor para los botones de acción */}
        <div className="flex items-center space-x-3">
          {/* Botón Generar Excel */}
          <button
            onClick={handleExportClick}
            className="group relative bg-green-600 text-white px-4 py-2 rounded-lg 
                 hover:bg-green-700 active:bg-green-800
                 transition-all duration-200 ease-out 
                 hover:shadow-lg active:shadow-none
                 transform active:scale-95"
          >
            <span className="flex items-center">
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

          {/* Botón Crear Proveedor */}
          <button
            onClick={handleOpenModal}
            className="group relative bg-black text-white px-4 py-2 rounded-lg 
               hover:bg-gray-800 active:bg-gray-900
               transition-all duration-200 ease-out 
               hover:shadow-lg active:shadow-none
               transform active:scale-95"
          >
            <span className="flex items-center">
              <span className="inline-block transform transition-transform duration-200 group-hover:translate-x-[-2px]">
                +
              </span>
              <span className="ml-1">Crear Proveedor</span>
            </span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error ? (
          <div className="text-center p-8 text-red-500">
            <p className="text-lg">{error}</p>
          </div>
        ) : loading ? (
          <div className="text-center p-8 text-gray-500">
            <p className="text-lg">Cargando...</p>
          </div>
        ) : filteredProveedores.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <p className="text-lg">No se encontraron proveedores</p>
          </div>
        ) : (
          <>
            {/* Vista de Proveedores */}
            <div className="overflow-x-auto">
              <div
                className={`transition-opacity duration-300 ease-in-out
                  ${
                    isChangingView || isSearching ? "opacity-0" : "opacity-100"
                  }`}
              >
                {isGridView ? renderGridView() : renderTableView()}
              </div>
            </div>

            {/* Paginación */}
            <div className="border-t">
              <PaginacionModProveedor
                currentPage={currentPage}
                totalPages={totalPages}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredProveedores.length}
              />
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <ProveedorCreateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleProveedorCreated}
      />

      <ProveedorDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProveedorToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        proveedorName={proveedorToDelete?.NombreProveedor}
        isDeleting={isDeleting}
      />

      <ProveedorUpdateModal
        isOpen={updateModalOpen}
        onClose={handleUpdateModalClose}
        proveedor={proveedorToUpdate}
        onProveedorUpdated={handleProveedorUpdated} // Cambiado de onSubmit a onProveedorUpdated
      />
    </div>
  );
};

export default ProveedorListar;
