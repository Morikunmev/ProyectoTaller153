import React from "react";
import {
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import PaginacionModFactura from "./PaginacionModFactura";
import FacturaCreateModal from "./modals/FacturaCreateModal";
import { useFacturaState } from "./hooks/useFacturaState";
import FacturaDeleteModal from "./modals/FacturaDeleteModal";
import FacturaUpdateModal from "./modals/FacturaUpdateModal";
import FacturaGrid from "./layout/FacturaGrid";
import { exportToExcel } from "./utils/facturaExport";

const FacturaListar = () => {
  const {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    isModalOpen,
    currentFacturas,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredFacturas,
    deleteModalOpen,
    facturaToDelete,
    isDeleting,
    updateModalOpen,
    facturaToUpdate,
    isUpdating,
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleFacturaCreated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleFacturaUpdated,
    setDeleteModalOpen,
    setFacturaToDelete,
  } = useFacturaState();

  const renderActionButtons = (factura) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleUpdateModalOpen(factura)}
        className="p-1.5 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm
                   transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
        title="Editar factura"
      >
        <Pencil className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
        Editar
      </button>
      <button
        onClick={() => handleDelete(factura)}
        className="p-1.5 text-red-600 hover:text-red-800 flex items-center gap-1 text-sm
                   relative overflow-hidden group transition-all duration-200 ease-in-out 
                   hover:scale-105 active:scale-95"
        title="Eliminar factura"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {currentFacturas.map((factura) => (
        <FacturaGrid
          key={factura.id}
          factura={factura}
          onEdit={() => handleUpdateModalOpen(factura)}
          onDelete={() => handleDelete(factura)}
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
          <th className="p-4 font-medium">ID</th>
          <th className="p-4 font-medium">Nº FACTURA</th>
          <th className="p-4 font-medium w-16">FOTO</th>
          <th className="p-4 font-medium w-16">DOC</th>
          <th className="p-4 font-medium">FECHA EMISIÓN</th>
          <th className="p-4 font-medium">PROVEEDOR</th>
          <th className="p-4 font-medium text-center">ACCIONES</th>
        </tr>
      </thead>
      <tbody>
        {currentFacturas.map((factura) => (
          <tr
            key={factura.id}
            className="border-b last:border-b-0 hover:bg-gray-50"
          >
            <td className="p-4 font-medium">{factura.id}</td>
            <td className="p-4 font-medium">{factura.NumeroFactura}</td>
            <td className="p-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {factura.FotoFactura ? (
                  <img
                    src={factura.FotoFactura}
                    alt={`Factura del ${factura.FechaEmision}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.parentNode.classList.add("bg-gray-200");
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400 text-xs">Sin foto</span>
                  </div>
                )}
              </div>
            </td>
            <td className="p-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {factura.DocumentoFactura ? (
                  <button
                    onClick={async () => {
                      try {
                        // Obtener el token CSRF
                        const csrfToken = document.querySelector(
                          "[name=csrfmiddlewaretoken]"
                        )?.value;
                        if (!csrfToken) {
                          throw new Error("Token CSRF no encontrado");
                        }

                        // Realizar la petición
                        const response = await fetch(
                          `/api/factura/${factura.id}/ver-documento/`,
                          {
                            method: "GET",
                            credentials: "include",
                            headers: {
                              "X-CSRFToken": csrfToken,
                            },
                          }
                        );

                        if (!response.ok) {
                          const contentType =
                            response.headers.get("content-type");
                          if (
                            contentType &&
                            contentType.includes("application/json")
                          ) {
                            const errorData = await response.json();
                            throw new Error(
                              errorData.error || "Error al acceder al documento"
                            );
                          } else {
                            throw new Error(
                              `Error ${response.status}: ${response.statusText}`
                            );
                          }
                        }

                        // Obtener la URL del documento
                        const data = await response.json();

                        // Abrir el documento en una nueva pestaña
                        window.open(data.url, "_blank");
                      } catch (error) {
                        console.error("Error al acceder al documento:", error);

                        // Mostrar error al usuario
                        if (typeof showAlert === "function") {
                          showAlert({
                            type: "error",
                            title: "Error al acceder al documento",
                            message:
                              error.message ||
                              "Hubo un problema al acceder al documento",
                          });
                        } else {
                          alert(
                            error.message ||
                              "Hubo un problema al acceder al documento. Por favor, inténtelo de nuevo."
                          );
                        }
                      }
                    }}
                    className="flex items-center justify-center w-full h-full hover:bg-gray-200 transition-colors group relative"
                    title="Ver documento"
                  >
                    <FileText className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />

                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Ver documento
                    </span>
                  </button>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400 text-xs">Sin doc</span>
                  </div>
                )}
              </div>
            </td>
            <td className="p-4 font-medium">{factura.FechaEmision}</td>
            <td className="p-4 text-gray-600">
              {factura.Proveedor.NombreProveedor}
            </td>
            <td className="p-4">
              <div className="flex justify-center">
                {renderActionButtons(factura)}
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
        <h1 className="text-2xl font-bold text-gray-900">Módulo Factura</h1>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
          {filteredFacturas.length} Facturas
        </span>
      </div>
      <div className="flex max-[790px]:flex-col justify-between items-center mb-6 max-[790px]:gap-4">
        {/* Barra de búsqueda */}
        <div className="relative w-[300px] max-[790px]:w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar factura..."
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

        {/* Contenedor para los botones de acción */}
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

          {/* Botón Crear Factura */}
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
              <span className="ml-1">Crear Factura</span>
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
        ) : filteredFacturas.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <p className="text-lg">No se encontraron facturas</p>
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

            <div className="border-t">
              <PaginacionModFactura
                currentPage={currentPage}
                totalPages={totalPages}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredFacturas.length}
              />
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <FacturaCreateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFacturaCreated}
      />

      <FacturaDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFacturaToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        facturaId={facturaToDelete?.id}
        isDeleting={isDeleting}
      />

      <FacturaUpdateModal
        isOpen={updateModalOpen}
        onClose={handleUpdateModalClose}
        factura={facturaToUpdate}
        onFacturaUpdated={handleFacturaUpdated}
      />
    </div>
  );
};

export default FacturaListar;
