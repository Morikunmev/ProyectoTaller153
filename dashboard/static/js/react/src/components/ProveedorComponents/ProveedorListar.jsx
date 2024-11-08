import React, { useState, useEffect } from "react";
import {
  Search,
  UserCircle,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
} from "lucide-react";
import PaginacionModProveedor from "./PaginacionModProveedor";
import ProveedorModal from "./ProveedorModal";

const ProveedorListar = () => {
  // Estados principales
  const [proveedores, setProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGridView, setIsGridView] = useState(false);
  const [isChangingView, setIsChangingView] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 10;

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchProveedores();
    // Limpiar estados al desmontar
    return () => {
      setProveedores([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  // Manejadores del modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Manejador de búsqueda
  const handleSearch = (value) => {
    setSearchTerm(value);
    setIsSearching(true);
    setCurrentPage(1); // Reset a primera página

    // Usar cleanup function en el setTimeout
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  };

  const handleViewChange = (isGrid) => {
    setIsChangingView(true);

    const timer = setTimeout(() => {
      setIsGridView(isGrid);
      setIsChangingView(false);
    }, 300);

    return () => clearTimeout(timer);
  };

  // Fetch de datos
  const fetchProveedores = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/proveedor/listar/");
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProveedores(data.proveedores);
      } else {
        throw new Error(data.message || "Error al cargar los proveedores");
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setError("No se pudieron cargar los proveedores");
    } finally {
      setLoading(false);
    }
  };

  // Manejador para crear nuevo proveedor
  const handleProveedorCreated = async (nuevoProveedor) => {
    try {
      // Primero actualizar la UI optimisticamente
      setProveedores((prevProveedores) => [...prevProveedores, nuevoProveedor]);

      // Luego refrescar los datos del servidor
      await fetchProveedores();

      // Calcular la nueva página usando el length actualizado
      const newTotalPages = Math.ceil((proveedores.length + 1) / itemsPerPage);
      setCurrentPage(newTotalPages);

      // Cerrar el modal solo si todo fue exitoso
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear proveedor:", error);
      // Aquí podrías manejar el error en la UI
      setError("Error al crear el proveedor");
    }
  };

  // Manejadores de paginación
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Filtrado y paginación
  const filteredProveedores = proveedores.filter((proveedor) =>
    [
      proveedor.NombreProveedor,
      proveedor.RutProveedor,
      proveedor.MarcaProveedor,
    ].some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredProveedores.length
  );
  const currentProveedores = filteredProveedores.slice(startIndex, endIndex);

  // Renderizado de botones de acción
  const renderActionButtons = (proveedor) => (
    <div className="flex space-x-2">
      <button
        className="p-1.5 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
        title="Editar proveedor"
      >
        <Pencil className="w-4 h-4" />
        Editar
      </button>
      <button
        className="p-1.5 text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
        title="Eliminar proveedor"
      >
        <Trash2 className="w-4 h-4" />
        Eliminar
      </button>
    </div>
  );

  // Renderizado de vistas
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {currentProveedores.map((proveedor) => (
        <div
          key={proveedor.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
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
                    <UserCircle className="w-10 h-10 text-gray-400" />
                  </div>
                </>
              ) : (
                <UserCircle className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">
                {proveedor.NombreProveedor}
              </h3>
              <p className="text-gray-600 text-sm">
                {proveedor.MarcaProveedor}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">RUT:</span>
              <p className="text-gray-700">{proveedor.RutProveedor}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Ubicación:</span>
              <p className="text-gray-700">
                {[
                  proveedor.CiudadProveedor,
                  proveedor.RegionProveedor,
                  proveedor.PaisProveedor,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Teléfono:</span>
              <p className="text-gray-700">
                {proveedor.TelefonoProveedor || "-"}
              </p>
            </div>
            {proveedor.ComentarioProveedor && (
              <div>
                <span className="text-sm text-gray-500">Comentario:</span>
                <p
                  className="text-gray-700 truncate"
                  title={proveedor.ComentarioProveedor}
                >
                  {proveedor.ComentarioProveedor}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            {renderActionButtons(proveedor)}
          </div>
        </div>
      ))}
    </div>
  );

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

      {/* Modal de Crear Proveedor */}
      <ProveedorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleProveedorCreated}
      />
    </div>
  );
};
export default ProveedorListar;
