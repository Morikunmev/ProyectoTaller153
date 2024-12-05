import { useState, useEffect, useCallback } from "react";
import { exportToExcel } from "../utils/VentaExport";

const useVentaState = () => {
  // Main state
  // Modal states
  const [restablecerModalOpen, setRestablecerModalOpen] = useState(false);
  const [ventaToRestablecer, setVentaToRestablecer] = useState(null);
  const [isRestabling, setIsRestabling] = useState(false);
  const [ventas, setVentas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isGridView, setIsGridView] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation states
  const [isChangingView, setIsChangingView] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Modal states
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [ventaToUpdate, setVentaToUpdate] = useState(null);

  const itemsPerPage = 10;

  // Filter ventas based on search term
  const filteredVentas = ventas.filter((venta) => {
    const searchString = searchTerm.toLowerCase();
    return (
      venta.nombre.toLowerCase().includes(searchString) ||
      venta.producto.nombre.toLowerCase().includes(searchString) ||
      (venta.cliente?.nombre || "").toLowerCase().includes(searchString) ||
      String(venta.id).includes(searchString)
    );
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredVentas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredVentas.length);
  const currentVentas = filteredVentas.slice(startIndex, endIndex);

  const procesarVentas = useCallback((ventasData) => {
    return ventasData.sort(
      (a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro)
    );
  }, []);

  const fetchVentas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/ventas/listar/");
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setVentas(procesarVentas(data.ventas));
      }
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      setError("No se pudieron cargar las ventas");
    } finally {
      setLoading(false);
    }
  }, [procesarVentas]);

  useEffect(() => {
    fetchVentas();
    return () => {
      setVentas([]);
      setLoading(true);
      setError(null);
    };
  }, [fetchVentas]);
  // Nuevos manejadores para restablecer
  const handleRestablecer = useCallback((venta) => {
    setVentaToRestablecer(venta);
    setRestablecerModalOpen(true);
  }, []);

  const handleConfirmRestablecer = useCallback(
    async (ventaId) => {
      setIsRestabling(true);
      try {
        const response = await fetch(`/api/venta/${ventaId}/eliminar/`, {
          method: "POST",
          headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
              .value,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.errors || "Error al restablecer la venta");
        }

        await fetchVentas();
        setRestablecerModalOpen(false);
        setVentaToRestablecer(null);
      } catch (error) {
        setError("Error al restablecer la venta: " + error.message);
      } finally {
        setIsRestabling(false);
      }
    },
    [fetchVentas]
  );

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setIsSearching(true);
    setCurrentPage(1);

    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleViewChange = useCallback((gridView) => {
    setIsChangingView(true);
    setIsGridView(gridView);

    const timer = setTimeout(() => {
      setIsChangingView(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleExportClick = useCallback(async () => {
    try {
      await exportToExcel();
    } catch (error) {
      setError("Error al exportar ventas: " + error.message);
    }
  }, []);

  const handleUpdateModalOpen = useCallback((venta) => {
    setVentaToUpdate(venta);
    setUpdateModalOpen(true);
  }, []);

  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setVentaToUpdate(null);
  }, []);

  const handleVentaUpdated = useCallback(async () => {
    try {
      await fetchVentas();
      handleUpdateModalClose();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setError("Error al actualizar la venta");
    }
  }, [fetchVentas, handleUpdateModalClose]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  return {
    searchTerm,
    loading,
    error,
    isChangingView,
    isSearching,
    currentVentas,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredVentas,
    updateModalOpen,
    ventaToUpdate,
    isGridView,
    restablecerModalOpen,
    ventaToRestablecer,
    isRestabling,
    handleRestablecer,
    handleConfirmRestablecer,
    setRestablecerModalOpen,
    setVentaToRestablecer,
    handleSearch,
    handleViewChange,
    handlePreviousPage,
    handleNextPage,
    handleExportClick,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleVentaUpdated,
    setUpdateModalOpen,
    setVentaToUpdate,
  };
};

export default useVentaState;
