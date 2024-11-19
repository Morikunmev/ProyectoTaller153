import { useState, useEffect, useCallback } from "react";

export const useProveedorState = () => {
  // Estados principales

  // Estados para el manejo de datos principales
  const [proveedores, setProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para el manejo de carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el control de la vista y animaciones
  const [isGridView, setIsGridView] = useState(false);
  const [isChangingView, setIsChangingView] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para el manejo de modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [proveedorToUpdate, setProveedorToUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentView, setCurrentView] = useState("list");

  // Estados para el proceso de eliminación
  const [proveedorToDelete, setProveedorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    return () => {
      setProveedores([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  

  // Función para manejar la apertura del modal de eliminación
  const handleDelete = useCallback((proveedor) => {
    setProveedorToDelete(proveedor);
    setDeleteModalOpen(true);
  }, []);

  // Manejador para abrir el modal de actualización
  const handleUpdateModalOpen = useCallback((proveedor) => {
    setProveedorToUpdate(proveedor);
    setUpdateModalOpen(true);
  }, []);

  // Manejador para cerrar el modal de actualización
  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setProveedorToUpdate(null);
  }, []);

  // Manejador simplificado para la actualización del proveedor
  const handleProveedorUpdated = useCallback(
    async (updatedProveedor) => {
      try {
        // Primero actualizamos localmente
        setProveedores((prevProveedores) =>
          prevProveedores.map((p) =>
            p.id === updatedProveedor.id ? updatedProveedor : p
          )
        );

        // Luego actualizamos desde el servidor
        await fetchProveedores();
      } catch (error) {
        console.error("Error al actualizar el estado:", error);
        setError("Error al actualizar el proveedor");
      }
    },
    [fetchProveedores]
  );

  const handleConfirmDelete = async () => {
    if (!proveedorToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/proveedor/${proveedorToDelete.id}/eliminar/`,
        {
          method: "DELETE",
          credentials: "include",
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

      if (data.success) {
        setProveedores((prevProveedores) =>
          prevProveedores.filter((p) => p.id !== proveedorToDelete.id)
        );
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

  // Manejadores del modal
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Manejador de búsqueda
  const handleSearch = (value) => {
    setSearchTerm(value);
    setIsSearching(true);
    setCurrentPage(1);

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
      setProveedores((prevProveedores) => [...prevProveedores, nuevoProveedor]);
      await fetchProveedores();
      const newTotalPages = Math.ceil((proveedores.length + 1) / itemsPerPage);
      setCurrentPage(newTotalPages);
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
    isDeleting,
    updateModalOpen,
    proveedorToUpdate,
    isUpdating,
    currentView,
    setCurrentView,

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
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleProveedorUpdated,

    // Setters
    setDeleteModalOpen,
    setProveedorToDelete,
  };
};
