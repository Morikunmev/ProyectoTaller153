import React, { useState, useMemo } from "react";
import {
  Search,
  Pencil,
  Trash2,
  FileText,
  LayoutGrid,
  List,
  AlertCircle,
  Loader2,
} from "lucide-react";
import PaginacionModCliente from "./PaginacionModCliente";
import useClienteState from "./hooks/useClienteState";
import ClienteGrid from "./layout/ClienteGrid";
import ClienteUpdateModal from "./modals/ClienteUpdateModal";
import ClienteDeleteModal from "./modals/ClienteDeleteModal";
import ClienteCreateModal from "./modals/ClienteCreateModal";

// Componente para badge de estado
const StateBadge = ({ children, type = "default" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-800",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${styles[type]}`}>
      {children}
    </span>
  );
};

const StatsHeader = ({ clientes }) => {
  const totalValue = useMemo(
    () =>
      clientes.reduce(
        (sum, cliente) => sum + Number(cliente.total_dinero_compras),
        0
      ),
    [clientes]
  );

  return (
    <div className="flex items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Módulo Clientes</h1>
      <div className="flex items-center gap-2">
        <StateBadge>
          {clientes.length} {clientes.length === 1 ? "Cliente" : "Clientes"}
        </StateBadge>
        <StateBadge type="success">
          Total en compras: ${totalValue.toLocaleString("es-CL")}
        </StateBadge>
      </div>
    </div>
  );
};

// Componente para la barra de búsqueda y exportación
const SearchAndExport = ({
  searchTerm,
  onSearch,
  onExport,
  isGridView,
  onViewChange,
  onCreateClick,
}) => (
  <div className="flex max-[790px]:flex-col justify-between items-center mb-6 max-[790px]:gap-4">
    <div className="relative w-[300px] max-[790px]:w-full">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar por nombre o RUT..."
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                  focus:outline-none focus:ring-1 focus:ring-blue-500
                  transition-colors duration-200"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>

    <div className="flex items-center gap-4">
      <ViewToggle isGridView={isGridView} onViewChange={onViewChange} />
      <button
        onClick={onCreateClick}
        className="group bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
      >
        <span className="flex items-center justify-center">
          <span className="mr-2">+</span>
          <span>Crear Cliente</span>
        </span>
      </button>
      <button
        onClick={onExport}
        className="group bg-green-600 text-white px-4 py-2 rounded-lg 
                  hover:bg-green-700 active:bg-green-800
                  transition-all duration-200 ease-out 
                  hover:shadow-lg active:shadow-none
                  transform active:scale-95 max-[790px]:w-full"
      >
        <span className="flex items-center justify-center">
          <FileText className="w-4 h-4 mr-2" />
          <span>Generar Excel</span>
        </span>
      </button>
    </div>
  </div>
);

// Componente para el toggle de vista
const ViewToggle = ({ isGridView, onViewChange }) => (
  <div className="bg-white border rounded-lg shadow-sm p-1 flex gap-1">
    <button
      onClick={() => onViewChange(false)}
      className={`p-1.5 rounded flex items-center gap-1 transition-all duration-200 ${
        !isGridView
          ? "bg-blue-50 text-blue-600"
          : "text-gray-500 hover:bg-gray-50"
      }`}
      title="Vista de lista"
    >
      <List className="w-4 h-4" />
    </button>
    <button
      onClick={() => onViewChange(true)}
      className={`p-1.5 rounded flex items-center gap-1 transition-all duration-200 ${
        isGridView
          ? "bg-blue-50 text-blue-600"
          : "text-gray-500 hover:bg-gray-50"
      }`}
      title="Vista de cuadrícula"
    >
      <LayoutGrid className="w-4 h-4" />
    </button>
  </div>
);

// Componente para los botones de acción
const ActionButtons = ({ cliente, onEdit, onDelete }) => (
  <div className="flex justify-center gap-2">
    <button
      type="button"
      onClick={() => onEdit(cliente)}
      className="p-1 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs
                hover:bg-blue-50 rounded transition-all duration-200"
    >
      <Pencil className="w-3 h-3" />
      <span>Editar</span>
    </button>
    <button
      type="button"
      onClick={() => onDelete(cliente)}
      className="p-1 text-red-600 hover:text-red-800 flex items-center gap-1 text-xs
                hover:bg-red-50 rounded transition-all duration-200"
    >
      <Trash2 className="w-3 h-3" />
      <span>Eliminar</span>
    </button>
  </div>
);

// Componente para el contenido de la tabla
const TableContent = ({ clientes, onEdit, onDelete }) => {
  // Agrupar clientes por fecha de registro
  const groupedClientes = clientes.reduce((groups, cliente) => {
    const date = new Date(cliente.fecha_registro).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(cliente);
    return groups;
  }, {});

  // Esquema de colores para grupos
  const groupColors = {
    header: [
      "bg-indigo-50 border-indigo-100",
      "bg-cyan-50 border-cyan-100",
      "bg-teal-50 border-teal-100",
      "bg-lime-50 border-lime-100",
      "bg-fuchsia-50 border-fuchsia-100",
    ],
    row: [
      "hover:bg-indigo-50/70 bg-indigo-50/20",
      "hover:bg-cyan-50/70 bg-cyan-50/20",
      "hover:bg-teal-50/70 bg-teal-50/20",
      "hover:bg-lime-50/70 bg-lime-50/20",
      "hover:bg-fuchsia-50/70 bg-fuchsia-50/20",
    ],
  };

  return (
    <table className="w-full min-w-[1200px]">
      <thead>
        <tr className="text-left text-gray-500 text-xs border-b bg-gray-50">
          <th className="p-2 font-medium">ID</th>
          <th className="p-2 font-medium">NOMBRE</th>
          <th className="p-2 font-medium">APELLIDO</th>
          <th className="p-2 font-medium">RUT</th>
          <th className="p-2 font-medium">TIPO</th>
          <th className="p-2 font-medium">COMPAÑÍA</th>
          <th className="p-2 font-medium">TOTAL COMPRAS</th>
          <th className="p-2 font-medium">DINERO TOTAL</th>
          <th className="p-2 font-medium">TELÉFONO</th>
          <th className="p-2 font-medium">FECHA REGISTRO</th>
          <th className="p-2 font-medium">ÚLTIMA MODIFICACIÓN</th>
          <th className="p-2 font-medium text-center">ACCIONES</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {Object.entries(groupedClientes).map(
          ([date, clientesGroup], groupIndex) => {
            const colorIndex = groupIndex % groupColors.header.length;
            return (
              <React.Fragment key={date}>
                {/* Encabezado de grupo con color */}
                <tr className={`${groupColors.header[colorIndex]} border-y`}>
                  <td colSpan="12" className="p-2 font-medium text-gray-700">
                    {date}
                  </td>
                </tr>
                {/* Filas de clientes con color de fondo y hover */}
                {clientesGroup.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className={`border-b transition-colors duration-150 ${groupColors.row[colorIndex]}`}
                  >
                    <td className="p-2 font-medium text-gray-900">
                      #{cliente.id}
                    </td>
                    <td className="p-2">{cliente.nombre}</td>
                    <td className="p-2">{cliente.apellido}</td>
                    <td className="p-2">{cliente.rut}</td>
                    <td className="p-2">
                      <StateBadge
                        type={
                          cliente.tipo === "empresa" ? "success" : "default"
                        }
                      >
                        {cliente.tipo === "empresa" ? "Empresa" : "Particular"}
                      </StateBadge>
                    </td>
                    <td className="p-2">{cliente.nombre_compania || "-"}</td>
                    <td className="p-2">{cliente.cantidad_total_compras}</td>
                    <td className="p-2">
                      ${Number(cliente.total_dinero_compras).toLocaleString()}
                    </td>
                    <td className="p-2">{cliente.telefono || "-"}</td>
                    <td className="p-2 whitespace-nowrap">
                      {new Date(cliente.fecha_registro).toLocaleString()}
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      {new Date(cliente.ultima_modificacion).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <ActionButtons
                        cliente={cliente}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          }
        )}
      </tbody>
    </table>
  );
};

const ClienteListar = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const {
    searchTerm,
    loading,
    error,
    isChangingView,
    isSearching,
    currentClientes,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredClientes,
    updateModalOpen,
    clienteToUpdate,
    handleSearch,
    handlePreviousPage,
    handleNextPage,
    handleExportClick,
    handleUpdateModalOpen,
    handleClienteUpdated,
    setUpdateModalOpen,

    handleClienteCreated,
    setClienteToUpdate,
    handleDelete,
  } = useClienteState();

  const handleViewChange = (gridView) => {
    setIsGridView(gridView);
  };
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };
  const handleDeleteClick = (cliente) => {
    setClienteToDelete(cliente);
    setDeleteModalOpen(true);
  };

  return (
    <main className="relative">
      <div
        className={`transition-all duration-300 ease-in-out mt-16 ${
          updateModalOpen || createModalOpen ? "pr-[448px]" : ""
        }`}
      >
        <div className="max-w-full mx-auto p-6">
          <StatsHeader clientes={filteredClientes} />

          <SearchAndExport
            searchTerm={searchTerm}
            onSearch={handleSearch}
            onExport={handleExportClick}
            isGridView={isGridView}
            onViewChange={handleViewChange}
            onCreateClick={handleOpenCreateModal}
          />

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {error ? (
              <div className="text-center p-8 text-red-500 flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-lg">{error}</p>
              </div>
            ) : loading ? (
              <div className="text-center p-8 text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-lg">Cargando...</p>
              </div>
            ) : currentClientes.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg">No se encontraron clientes</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div
                    className={`transition-all duration-300 ease-in-out transform
                    ${
                      isChangingView || isSearching
                        ? "opacity-0 scale-95"
                        : "opacity-100 scale-100"
                    }`}
                  >
                    {isGridView ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                        {currentClientes.map((cliente) => (
                          <ClienteGrid
                            key={cliente.id}
                            cliente={cliente}
                            onEdit={() => handleUpdateModalOpen(cliente)}
                            onDelete={() => handleDeleteClick(cliente)} // Cambiar esto
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <TableContent
                          clientes={currentClientes}
                          onEdit={handleUpdateModalOpen}
                          onDelete={handleDeleteClick} // Cambiado de handleDelete a handleDeleteClick
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t">
                  <PaginacionModCliente
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePreviousPage={handlePreviousPage}
                    handleNextPage={handleNextPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={filteredClientes.length}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ClienteUpdateModal
        isOpen={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setClienteToUpdate(null);
        }}
        cliente={clienteToUpdate}
        onClienteUpdated={handleClienteUpdated}
      />

      <ClienteDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setClienteToDelete(null);
        }}
        onConfirm={async () => {
          try {
            setIsDeleting(true);
            await handleDelete(clienteToDelete.id);
            setDeleteModalOpen(false);
            setClienteToDelete(null);
          } catch (error) {
            console.error("Error:", error);
          } finally {
            setIsDeleting(false);
          }
        }}
        clienteId={clienteToDelete?.id}
        isDeleting={isDeleting}
        cliente={clienteToDelete}
      />
      <ClienteCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onClienteCreated={handleClienteCreated}
      />
    </main>
  );
};

export default ClienteListar;
