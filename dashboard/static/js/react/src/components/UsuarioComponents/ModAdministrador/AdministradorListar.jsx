import React, { useState } from "react";
import {
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  User,
  Info,
  X,
} from "lucide-react";
import PaginacionModAdmin from "./PaginacionModAdmin";
import AdminCreateModal from "./modals/AdminCreateModal";
import { useAdminState } from "./hooks/useAdminState";
import AdminDeleteModal from "./modals/AdminDeleteModal";
import AdminUpdateModal from "./modals/AdminUpdateModal";
import AdminGrid from "./layout/AdminGrid";

const AdministradorListar = ({ isModalOpen, setIsModalOpen }) => {
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    currentAdmins,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredAdmins,
    deleteModalOpen,
    adminToDelete,
    isDeleting,
    updateModalOpen,
    adminToUpdate,
    handleSearch,
    handleViewChange,
    handleAdminCreated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleAdminUpdated,
    handleExportClick,
    setDeleteModalOpen,
    setAdminToDelete,
  } = useAdminState();

  const handleShowDetails = (admin) => {
    setSelectedAdmin(selectedAdmin?.id === admin.id ? null : admin);
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
          <th className="p-2 font-medium">USUARIO</th>
          <th className="p-2 font-medium">EMAIL</th>
          <th className="p-2 font-medium">RUT</th>
          <th className="p-2 font-medium">TELÉFONO</th>
          <th className="p-2 font-medium">EDAD</th>
          <th className="p-2 font-medium text-center">ACCIONES</th>
        </tr>
      </thead>
      <tbody>
        {currentAdmins.map((admin) => {
          const isSelected = selectedAdmin?.id === admin.id;

          return (
            <React.Fragment key={admin.id}>
              <tr className={`border-b ${isSelected ? "border-b-0" : "last:border-b-0"} hover:bg-gray-50
                ${isSelected ? "bg-gray-50" : ""}`}>
                <td className="p-2 font-medium text-gray-900">
                  #{admin.id}
                </td>
                <td className="p-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {admin.foto ? (
                      <img
                        src={admin.foto}
                        alt={`Admin: ${admin.username}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.parentNode.classList.add("bg-gray-200");
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-2 font-medium">{admin.username}</td>
                <td className="p-2">{admin.email}</td>
                <td className="p-2">{admin.rut}</td>
                <td className="p-2">{admin.telefono || "No especificado"}</td>
                <td className="p-2">{admin.edad || "No especificada"}</td>
                <td className="p-2">
                  <div className="flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateModalOpen(admin)}
                      className="p-1 text-blue-600 hover:text-blue-800 flex items-center gap-0.5 text-xs
                        transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                      title="Editar administrador"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(admin)}
                      className="p-1 text-red-600 hover:text-red-800 flex items-center gap-0.5 text-xs
                        relative overflow-hidden group transition-all duration-200 ease-in-out 
                        hover:scale-105 active:scale-95"
                      title="Eliminar administrador"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {currentAdmins.map((admin) => (
        <div key={admin.id} className="space-y-4">
          <div className="relative bg-white rounded-lg shadow-sm">
            <AdminGrid
              admin={admin}
              onEdit={() => handleUpdateModalOpen(admin)}
              onDelete={() => handleDelete(admin)}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className={`transition-all duration-300 ease-in-out mt-16
        ${isModalOpen || updateModalOpen ? "pr-[448px]" : ""}`}>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Módulo Administrador
            </h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {filteredAdmins.length} Administradores
            </span>
          </div>

          <div className="flex max-[790px]:flex-col justify-between items-center mb-6 max-[790px]:gap-4">
            <div className="relative w-[300px] max-[790px]:w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
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
                  <span className="ml-1">Crear Administrador</span>
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
            ) : filteredAdmins.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg">No se encontraron administradores</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className={`transition-opacity duration-300 ease-in-out
                              ${isChangingView || isSearching ? "opacity-0" : "opacity-100"}`}>
                    {isGridView ? renderGridView() : renderTableView()}
                  </div>
                </div>
                <div className="border-t">
                  <PaginacionModAdmin
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePreviousPage={handlePreviousPage}
                    handleNextPage={handleNextPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={filteredAdmins.length}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AdminCreateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAdminCreated}
      />
      <AdminDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAdminToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        adminId={adminToDelete?.id}
        isDeleting={isDeleting}
      />
      <AdminUpdateModal
        isOpen={updateModalOpen}
        onClose={handleUpdateModalClose}
        admin={adminToUpdate}
        onAdminUpdated={handleAdminUpdated}
      />
    </div>
  );
};

export default AdministradorListar;