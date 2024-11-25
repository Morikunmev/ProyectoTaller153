import { useState, useEffect, useCallback } from "react";
import { exportToExcel } from "../utils/HerramientaExport";

export const useHerramientaState = () => {
  // Estados principales
  const [herramientas, setHerramientas] = useState([]);
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
  const [herramientaToUpdate, setHerramientaToUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para el proceso de eliminación
  const [herramientaToDelete, setHerramientaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  const procesarHerramientas = (herramientasData) => {
    return herramientasData.sort((a, b) => {
      // Ordenar por fecha de compra más reciente primero
      return (
        new Date(b.FechaCompraHerramienta) - new Date(a.FechaCompraHerramienta)
      );
    });
  };

  const handleExportClick = useCallback(async () => {
    try {
      await exportToExcel();
    } catch (error) {
      setError("Error al exportar herramientas: " + error.message);
    }
  }, []);

  const fetchHerramientas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/herramientas/listar/");

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const herramientasProcessed = data.herramientas.map((herramienta) => ({
          id: herramienta.id,
          NombreHerramienta: herramienta.NombreHerramienta,
          StockHerramienta: herramienta.StockHerramienta,
          PrecioHerramienta: herramienta.PrecioHerramienta,
          TotalHerramienta: herramienta.TotalHerramienta,
          FechaCompraHerramienta: herramienta.FechaCompraHerramienta,
          DescripcionHerramienta: herramienta.DescripcionHerramienta,
          MarcaHerramienta: herramienta.MarcaHerramienta,
          ModeloHerramienta: herramienta.ModeloHerramienta,
          FotoHerramienta: herramienta.FotoHerramienta || null,
          Proveedor: herramienta.Proveedor
            ? {
                id: herramienta.Proveedor.id,
                NombreProveedor: herramienta.Proveedor.NombreProveedor,
              }
            : null,
        }));

        const herramientasOrdenadas = procesarHerramientas(
          herramientasProcessed
        );
        setHerramientas(herramientasOrdenadas);
      }
    } catch (error) {
      console.error("Error al cargar herramientas:", error);
      setError("No se pudieron cargar las herramientas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHerramientas();
    return () => {
      setHerramientas([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  const handleDelete = useCallback((herramienta) => {
    setHerramientaToDelete(herramienta);
    setDeleteModalOpen(true);
  }, []);

  const handleUpdateModalOpen = useCallback((herramienta) => {
    setHerramientaToUpdate(herramienta);
    setUpdateModalOpen(true);
  }, []);

  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setHerramientaToUpdate(null);
  }, []);

  const handleHerramientaUpdated = useCallback(async (updatedHerramienta) => {
    try {
      const herramientaConFoto = {
        ...updatedHerramienta,
        FotoHerramienta: updatedHerramienta.FotoHerramienta || null,
      };

      setHerramientas((prevHerramientas) =>
        prevHerramientas.map((h) =>
          h.id === herramientaConFoto.id ? herramientaConFoto : h
        )
      );

      await fetchHerramientas();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setError("Error al actualizar la herramienta");
    }
  }, []);

  const handleConfirmDelete = async () => {
    if (!herramientaToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/herramientas/${herramientaToDelete.id}/eliminar/`,
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
        throw new Error(data.message || "Error al eliminar la herramienta");
      }

      if (data.success) {
        setHerramientas((prevHerramientas) =>
          prevHerramientas.filter((h) => h.id !== herramientaToDelete.id)
        );
        setDeleteModalOpen(false);
        setHerramientaToDelete(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Error al eliminar la herramienta: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setIsSearching(true);
    setCurrentPage(1);

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

  const handleHerramientaCreated = async (nuevaHerramienta) => {
    try {
      const herramientaConFoto = {
        ...nuevaHerramienta,
        FotoHerramienta: nuevaHerramienta.FotoHerramienta || null,
      };

      setHerramientas((prevHerramientas) => [
        ...prevHerramientas,
        herramientaConFoto,
      ]);
      await fetchHerramientas();
      const newTotalPages = Math.ceil((herramientas.length + 1) / itemsPerPage);
      setCurrentPage(newTotalPages);
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear herramienta:", error);
      setError("Error al crear la herramienta");
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredHerramientas.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const filteredHerramientas = herramientas.filter((herramienta) => {
    const searchString = searchTerm.toLowerCase();
    return (
      herramienta.NombreHerramienta.toLowerCase().includes(searchString) ||
      (herramienta.DescripcionHerramienta &&
        herramienta.DescripcionHerramienta.toLowerCase().includes(
          searchString
        )) ||
      (herramienta.MarcaHerramienta &&
        herramienta.MarcaHerramienta.toLowerCase().includes(searchString)) ||
      (herramienta.ModeloHerramienta &&
        herramienta.ModeloHerramienta.toLowerCase().includes(searchString)) ||
      (herramienta.Proveedor &&
        herramienta.Proveedor.NombreProveedor.toLowerCase().includes(
          searchString
        )) ||
      String(herramienta.id).includes(searchString)
    );
  });

  const totalPages = Math.ceil(filteredHerramientas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredHerramientas.length
  );
  const currentHerramientas = filteredHerramientas.slice(startIndex, endIndex);

  return {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    isModalOpen,
    currentHerramientas,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredHerramientas,
    deleteModalOpen,
    herramientaToDelete,
    isDeleting,
    updateModalOpen,
    herramientaToUpdate,
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleHerramientaCreated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleHerramientaUpdated,
    handleExportClick,
    setDeleteModalOpen,
    setHerramientaToDelete,
  };
};
