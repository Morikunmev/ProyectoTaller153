import { useState, useEffect, useCallback } from "react";

export const useFacturaState = () => {
  // Estados principales
  const [facturas, setFacturas] = useState([]);
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
  const [facturaToUpdate, setFacturaToUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para el proceso de eliminación
  const [facturaToDelete, setFacturaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  // Fetch de datos
  const fetchFacturas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/factura/listar/");
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Asegurarse de que los campos de archivos tengan URLs válidas
        const facturasConArchivos = data.facturas.map((factura) => ({
          ...factura,
          FotoFactura: factura.FotoFactura || null,
          DocumentoFactura: factura.DocumentoFactura || null,
        }));
        setFacturas(facturasConArchivos);
      } else {
        throw new Error(data.message || "Error al cargar las facturas");
      }
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      setError("No se pudieron cargar las facturas");
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchFacturas();
    return () => {
      setFacturas([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  // Función para manejar la apertura del modal de eliminación
  const handleDelete = useCallback((factura) => {
    setFacturaToDelete(factura);
    setDeleteModalOpen(true);
  }, []);

  // Manejador para abrir el modal de actualización
  const handleUpdateModalOpen = useCallback((factura) => {
    setFacturaToUpdate(factura);
    setUpdateModalOpen(true);
  }, []);

  // Manejador para cerrar el modal de actualización
  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setFacturaToUpdate(null);
  }, []);

  // Manejador para la actualización de la factura
  const handleFacturaUpdated = useCallback(
    async (updatedFactura) => {
      try {
        // Asegurarse de que los campos de archivos se mantengan
        const facturaConArchivos = {
          ...updatedFactura,
          FotoFactura: updatedFactura.FotoFactura || null,
          DocumentoFactura: updatedFactura.DocumentoFactura || null,
        };

        setFacturas((prevFacturas) =>
          prevFacturas.map((f) =>
            f.id === facturaConArchivos.id ? facturaConArchivos : f
          )
        );

        await fetchFacturas();
      } catch (error) {
        console.error("Error al actualizar el estado:", error);
        setError("Error al actualizar la factura");
      }
    },
    [fetchFacturas]
  );

  const handleConfirmDelete = async () => {
    if (!facturaToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/factura/${facturaToDelete.id}/eliminar/`,
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
        throw new Error(data.message || "Error al eliminar la factura");
      }

      if (data.success) {
        setFacturas((prevFacturas) =>
          prevFacturas.filter((f) => f.id !== facturaToDelete.id)
        );
        setDeleteModalOpen(false);
        setFacturaToDelete(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Error al eliminar la factura: " + error.message);
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

  // Manejador para crear nueva factura
  const handleFacturaCreated = async (nuevaFactura) => {
    try {
      const facturaConArchivos = {
        ...nuevaFactura,
        FotoFactura: nuevaFactura.FotoFactura || null,
        DocumentoFactura: nuevaFactura.DocumentoFactura || null,
      };

      setFacturas((prevFacturas) => [...prevFacturas, facturaConArchivos]);
      await fetchFacturas();
      const newTotalPages = Math.ceil((facturas.length + 1) / itemsPerPage);
      setCurrentPage(newTotalPages);
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear factura:", error);
      setError("Error al crear la factura");
    }
  };

  // Manejadores de paginación
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredFacturas.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Filtrado de facturas
  // Filtrado de facturas
  const filteredFacturas = facturas.filter(
    (factura) =>
      factura.Proveedor.NombreProveedor.toLowerCase().includes(
        searchTerm.toLowerCase()
      ) ||
      (factura.NumeroFactura &&
        factura.NumeroFactura.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      factura.id.toString().includes(searchTerm)
  );

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredFacturas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredFacturas.length);
  const currentFacturas = filteredFacturas.slice(startIndex, endIndex);

  return {
    // Estados
    facturas,
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    currentPage,
    isModalOpen,
    itemsPerPage,
    filteredFacturas,
    currentFacturas,
    totalPages,
    startIndex,
    endIndex,
    deleteModalOpen,
    facturaToDelete,
    isDeleting,
    updateModalOpen,
    facturaToUpdate,
    isUpdating,

    // Manejadores
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleFacturaCreated,
    handlePreviousPage,
    handleNextPage,
    fetchFacturas,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleFacturaUpdated,

    // Setters
    setDeleteModalOpen,
    setFacturaToDelete,
  };
};
