import { useState, useEffect, useCallback } from "react";

export const useEnvioState = () => {
  // Estados principales
  const [envios, setEnvios] = useState([]);
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
  const [envioToUpdate, setEnvioToUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para el proceso de eliminación
  const [envioToDelete, setEnvioToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  // Fetch de datos
  const fetchEnvios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/envio/listar/");
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Asegurarse de que los campos de archivos tengan URLs válidas
        const enviosConFotos = data.envios.map((envio) => ({
          ...envio,
          FotoEnvio: envio.FotoEnvio || null,
        }));
        setEnvios(enviosConFotos);
      } else {
        throw new Error(data.message || "Error al cargar los envíos");
      }
    } catch (error) {
      console.error("Error al cargar envíos:", error);
      setError("No se pudieron cargar los envíos");
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchEnvios();
    return () => {
      setEnvios([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  // Función para manejar la apertura del modal de eliminación
  const handleDelete = useCallback((envio) => {
    setEnvioToDelete(envio);
    setDeleteModalOpen(true);
  }, []);

  // Manejador para abrir el modal de actualización
  const handleUpdateModalOpen = useCallback((envio) => {
    setEnvioToUpdate(envio);
    setUpdateModalOpen(true);
  }, []);

  // Manejador para cerrar el modal de actualización
  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setEnvioToUpdate(null);
  }, []);

  // Manejador para la actualización del envío
  const handleEnvioUpdated = useCallback(
    async (updatedEnvio) => {
      try {
        // Asegurarse de que los campos de archivos se mantengan
        const envioConFoto = {
          ...updatedEnvio,
          FotoEnvio: updatedEnvio.FotoEnvio || null,
        };

        setEnvios((prevEnvios) =>
          prevEnvios.map((e) => (e.id === envioConFoto.id ? envioConFoto : e))
        );

        await fetchEnvios();
      } catch (error) {
        console.error("Error al actualizar el estado:", error);
        setError("Error al actualizar el envío");
      }
    },
    [fetchEnvios]
  );

  const handleConfirmDelete = async () => {
    if (!envioToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/envio/${envioToDelete.id}/eliminar/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
            .value,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar el envío");
      }

      if (data.success) {
        setEnvios((prevEnvios) =>
          prevEnvios.filter((e) => e.id !== envioToDelete.id)
        );
        setDeleteModalOpen(false);
        setEnvioToDelete(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Error al eliminar el envío: " + error.message);
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

  // Manejador para crear nuevo envío
  const handleEnvioCreated = async (nuevoEnvio) => {
    try {
      const envioConFoto = {
        ...nuevoEnvio,
        FotoEnvio: nuevoEnvio.FotoEnvio || null,
      };

      setEnvios((prevEnvios) => [...prevEnvios, envioConFoto]);
      await fetchEnvios();
      const newTotalPages = Math.ceil((envios.length + 1) / itemsPerPage);
      setCurrentPage(newTotalPages);
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear envío:", error);
      setError("Error al crear el envío");
    }
  };

  // Manejadores de paginación
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredEnvios.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Filtrado de envíos
  const filteredEnvios = envios.filter((envio) => {
    const searchString = searchTerm.toLowerCase();
    return (
      envio.NombreEnvio.toLowerCase().includes(searchString) ||
      envio.TipoEnvio.toLowerCase().includes(searchString) ||
      envio.Proveedor.NombreProveedor.toLowerCase().includes(searchString)
    );
  });

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredEnvios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredEnvios.length);
  const currentEnvios = filteredEnvios.slice(startIndex, endIndex);

  return {
    // Estados
    envios,
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    currentPage,
    isModalOpen,
    itemsPerPage,
    filteredEnvios,
    currentEnvios,
    totalPages,
    startIndex,
    endIndex,
    deleteModalOpen,
    envioToDelete,
    isDeleting,
    updateModalOpen,
    envioToUpdate,
    isUpdating,

    // Manejadores
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleEnvioCreated,
    handlePreviousPage,
    handleNextPage,
    fetchEnvios,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleEnvioUpdated,

    // Setters
    setDeleteModalOpen,
    setEnvioToDelete,
  };
};
