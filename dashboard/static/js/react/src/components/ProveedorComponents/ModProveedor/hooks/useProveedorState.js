import { useState, useEffect } from "react";

export const useProveedorState = () => {
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
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Manejador de búsqueda
  const handleSearch = (value) => {
    setSearchTerm(value);
    setIsSearching(true);
    setCurrentPage(1); // Reset a primera página

    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  };

  // Manejador de cambio de vista
  const handleViewChange = (isGrid) => {
    setIsChangingView(true);

    const timer = setTimeout(() => {
      setIsGridView(isGrid);
      setIsChangingView(false);
    }, 300);

    return () => clearTimeout(timer);
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
      setError("Error al crear el proveedor");
    }
  };

  // Manejadores de paginación
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Filtrado de proveedores
  const filteredProveedores = proveedores.filter((proveedor) =>
    [
      proveedor.NombreProveedor,
      proveedor.RutProveedor,
      proveedor.MarcaProveedor,
    ].some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredProveedores.length
  );
  const currentProveedores = filteredProveedores.slice(startIndex, endIndex);

  return {
    // Estados
    proveedores,
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    currentPage,
    isModalOpen,
    itemsPerPage,
    filteredProveedores,
    currentProveedores,
    totalPages,
    startIndex,
    endIndex,

    // Manejadores
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleProveedorCreated,
    handlePreviousPage,
    handleNextPage,
    fetchProveedores,
  };
};
