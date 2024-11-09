import { useState, useEffect, useCallback } from "react";

export const useProveedorState = () => {
  // Estados principales

  // Estados para el manejo de datos principales
  const [proveedores, setProveedores] = useState([]); // Almacena la lista principal de proveedores obtenida del servidor
  const [searchTerm, setSearchTerm] = useState(""); // Almacena el texto que el usuario escribe en la barra de búsqueda

  // Estados para el manejo de carga y errores
  const [loading, setLoading] = useState(true); // Indica si se están cargando datos del servidor (true durante la carga, false cuando termina)
  const [error, setError] = useState(null); // Almacena mensajes de error si algo falla (null cuando no hay errores)

  // Estados para el control de la vista y animaciones
  const [isGridView, setIsGridView] = useState(false); // Controla el tipo de vista: true para cuadrícula (grid), false para tabla
  const [isChangingView, setIsChangingView] = useState(false); // Indica si se está cambiando entre vistas (para manejar animaciones de transición)
  const [isSearching, setIsSearching] = useState(false); // Indica si se está realizando una búsqueda (para mostrar estados de carga en la búsqueda)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1); // Controla la página actual que se está mostrando en la paginación

  // Estados para el manejo de modales
  const [isModalOpen, setIsModalOpen] = useState(false); // Controla la visibilidad del modal para crear nuevo proveedor
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Controla la visibilidad del modal de confirmación de eliminación

  // Estados para el proceso de eliminación
  const [proveedorToDelete, setProveedorToDelete] = useState(null); // Almacena el proveedor que se ha seleccionado para eliminar
  const [isDeleting, setIsDeleting] = useState(false); // Indica si se está procesando una eliminación (para mostrar estados de carga durante el borrado)

  const itemsPerPage = 10;

  // Función para manejar la apertura del modal de eliminación
  const handleDelete = useCallback((proveedor) => {
    setProveedorToDelete(proveedor);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!proveedorToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/proveedor/${proveedorToDelete.id}/eliminar/`,
        {
          method: "DELETE",
          headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
              .value,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar el proveedor");
      }

      // Si la eliminación fue exitosa
      if (data.success) {
        // Actualizar el estado local
        setProveedores((prevProveedores) =>
          prevProveedores.filter((p) => p.id !== proveedorToDelete.id)
        );

        // Cerrar el modal
        setDeleteModalOpen(false);
        setProveedorToDelete(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Error al eliminar el proveedor: " + error.message);
    } finally {
      setIsDeleting(false);
    }
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
    deleteModalOpen,
    proveedorToDelete,
    isDeleting, // Estado de carga durante la eliminación

    // Manejadores
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleProveedorCreated,
    handlePreviousPage,
    handleNextPage,
    fetchProveedores,
    handleDelete,
    handleConfirmDelete,

    // Setters
    setDeleteModalOpen,
    setProveedorToDelete,
  };
};
