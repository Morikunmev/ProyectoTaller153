import React from "react";
import {
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  FileText,
  Package,
} from "lucide-react";
import PaginacionModEnvio from "./PaginacionModEnvio";
import EnvioCreateModal from "./modals/EnvioCreateModal";
import { useEnvioState } from "./hooks/useEnvioState";
import EnvioDeleteModal from "./modals/EnvioDeleteModal";
import EnvioUpdateModal from "./modals/EnvioUpdateModal";
import EnvioGrid from "./layout/EnvioGrid";
import { exportToExcel } from "./utils/envioExport";

const EnvioListar = () => {
  const {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    isModalOpen,
    currentEnvios,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredEnvios,
    deleteModalOpen,
    envioToDelete,
    isDeleting,
    updateModalOpen,
    envioToUpdate,
    isUpdating,
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleEnvioCreated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleEnvioUpdated,
    setDeleteModalOpen,
    setEnvioToDelete,
  } = useEnvioState();

  const renderActionButtons = (envio) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleUpdateModalOpen(envio)}
        className="p-1.5 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm
                   transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
        title="Editar envío"
      >
        <Pencil className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
        Editar
      </button>
      <button
        onClick={() => handleDelete(envio)}
        className="p-1.5 text-red-600 hover:text-red-800 flex items-center gap-1 text-sm
                   relative overflow-hidden group transition-all duration-200 ease-in-out 
                   hover:scale-105 active:scale-95"
        title="Eliminar envío"
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

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {currentEnvios.map((envio) => (
        <EnvioGrid
          key={envio.id}
          envio={envio}
          onEdit={() => handleUpdateModalOpen(envio)}
          onDelete={() => handleDelete(envio)}
        />
      ))}
    </div>
  );

  const handleExportClick = async () => {
    try {
      await exportToExcel();
    } catch (error) {
      console.error("Error en la exportación:", error);
    }
  };
  const renderTableView = () => (
    <table className="w-full">
      <thead>
        <tr className="text-left text-gray-500 text-sm border-b bg-gray-50">
          <th className="p-4 font-medium w-16">FOTO</th>
          <th className="p-4 font-medium">NOMBRE</th>
          <th className="p-4 font-medium">TIPO</th>
          <th className="p-4 font-medium">CANTIDAD</th>
          <th className="p-4 font-medium">PRECIO</th>
          <th className="p-4 font-medium">TOTAL</th>
          <th className="p-4 font-medium">ESTADO</th>
          <th className="p-4 font-medium">DÍAS</th>
          <th className="p-4 font-medium">PROVEEDOR</th>
          <th className="p-4 font-medium text-center">ACCIONES</th>
        </tr>
      </thead>
      <tbody>
        {currentEnvios.map((envio) => (
          <tr
            key={envio.id}
            className="border-b last:border-b-0 hover:bg-gray-50"
          >
            <td className="p-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {envio.FotoEnvio ? (
                  <img
                    src={envio.FotoEnvio}
                    alt={`Envío: ${envio.NombreEnvio}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.parentNode.classList.add("bg-gray-200");
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            </td>
            <td className="p-4 font-medium">{envio.NombreEnvio}</td>
            <td className="p-4">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  envio.TipoEnvio === "material"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {envio.TipoEnvio === "material" ? "Material" : "Herramienta"}
              </span>
            </td>
            <td className="p-4">{envio.CantidadEnvio}</td>
            <td className="p-4">${envio.PrecioEnvio.toLocaleString()}</td>
            <td className="p-4">${envio.TotalEnvio.toLocaleString()}</td>
            <td className="p-4">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  envio.EnvioRecibido
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {envio.EnvioRecibido ? "Recibido" : "Pendiente"}
              </span>
            </td>
            <td className="p-4">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  envio.EnvioRecibido
                    ? "bg-gray-100 text-gray-800"
                    : envio.DiasTranscurridos > 30
                    ? "bg-red-100 text-red-800"
                    : envio.DiasTranscurridos > 15
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {envio.DiasTranscurridos} días
              </span>
            </td>
            <td className="p-4 text-gray-600">
              {envio.Proveedor.NombreProveedor}
            </td>
            <td className="p-4">
              <div className="flex justify-center">
                {renderActionButtons(envio)}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Título y contador del módulo */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Módulo Envío</h1>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
          {filteredEnvios.length} Envíos
        </span>
      </div>

      {/* Barra de herramientas */}
      <div className="flex max-[790px]:flex-col justify-between items-center mb-6 max-[790px]:gap-4">
        {/* Barra de búsqueda */}
        <div className="relative w-[300px] max-[790px]:w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, tipo o proveedor..."
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
          {/* Botón Generar Excel */}
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

          {/* Botón Crear Envío */}
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
              <span className="ml-1">Crear Envío</span>
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
        ) : filteredEnvios.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <p className="text-lg">No se encontraron envíos</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
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

            {/* Paginación */}
            <div className="border-t">
              <PaginacionModEnvio
                currentPage={currentPage}
                totalPages={totalPages}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredEnvios.length}
              />
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <EnvioCreateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleEnvioCreated}
      />

      <EnvioDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEnvioToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        envioId={envioToDelete?.id}
        isDeleting={isDeleting}
      />

      <EnvioUpdateModal
        isOpen={updateModalOpen}
        onClose={handleUpdateModalClose}
        envio={envioToUpdate}
        onEnvioUpdated={handleEnvioUpdated}
      />
    </div>
  );
};

export default EnvioListar;
