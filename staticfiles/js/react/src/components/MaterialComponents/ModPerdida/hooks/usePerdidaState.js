import { useState, useEffect, useCallback } from "react";
import { exportToExcel } from "../utils/PerdidaExport";

const usePerdidaState = () => {
  // Main state
  const [perdidas, setPerdidas] = useState([]);
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
  const [restablecerModalOpen, setRestablecerModalOpen] = useState(false);
  const [perdidaToRestablecer, setPerdidaToRestablecer] = useState(null);
  const [isRestabling, setIsRestabling] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [perdidaToUpdate, setPerdidaToUpdate] = useState(null);

  const itemsPerPage = 10;

  // Filter perdidas based on search term
  const filteredPerdidas = perdidas.filter((perdida) => {
    const searchString = searchTerm.toLowerCase();
    return (
      perdida.nombre.toLowerCase().includes(searchString) ||
      perdida.producto.nombre.toLowerCase().includes(searchString) ||
      perdida.motivo.toLowerCase().includes(searchString) ||
      String(perdida.id).includes(searchString)
    );
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredPerdidas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredPerdidas.length);
  const currentPerdidas = filteredPerdidas.slice(startIndex, endIndex);

  const procesarPerdidas = useCallback((perdidasData) => {
    return perdidasData.sort(
      (a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro)
    );
  }, []);

  const fetchPerdidas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/perdidas/listar/");
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setPerdidas(procesarPerdidas(data.perdidas));
      }
    } catch (error) {
      console.error("Error al cargar pérdidas:", error);
      setError("No se pudieron cargar las pérdidas");
    } finally {
      setLoading(false);
    }
  }, [procesarPerdidas]);

  useEffect(() => {
    fetchPerdidas();
    return () => {
      setPerdidas([]);
      setLoading(true);
      setError(null);
    };
  }, [fetchPerdidas]);

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
    }, 300); // Sincronizado con la duración de la transición CSS
  
    return () => clearTimeout(timer);
  }, []);

  const handleExportClick = useCallback(async () => {
    try {
      await exportToExcel();
    } catch (error) {
      setError("Error al exportar pérdidas: " + error.message);
    }
  }, []);

  const handleRestablecer = useCallback((perdida) => {
    setPerdidaToRestablecer(perdida);
    setRestablecerModalOpen(true);
  }, []);

  const handleConfirmRestablecer = useCallback(
    async (perdidaId) => {
      setIsRestabling(true);
      try {
        const response = await fetch(`/api/perdida/${perdidaId}/eliminar/`, {
          method: "POST",
          headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
              .value,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.errors || "Error al restablecer la pérdida");
        }

        await fetchPerdidas();
        setRestablecerModalOpen(false);
        setPerdidaToRestablecer(null);
      } catch (error) {
        setError("Error al restablecer la pérdida: " + error.message);
      } finally {
        setIsRestabling(false);
      }
    },
    [fetchPerdidas]
  );

  const handleUpdateModalOpen = useCallback((perdida) => {
    setPerdidaToUpdate(perdida);
    setUpdateModalOpen(true);
  }, []);

  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setPerdidaToUpdate(null);
  }, []);

  const handlePerdidaUpdated = useCallback(async () => {
    try {
      await fetchPerdidas();
      handleUpdateModalClose();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setError("Error al actualizar la pérdida");
    }
  }, [fetchPerdidas, handleUpdateModalClose]);

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
    currentPerdidas,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredPerdidas,
    restablecerModalOpen,
    perdidaToRestablecer,
    isRestabling,
    updateModalOpen,
    perdidaToUpdate,
    isGridView,
    handleSearch,
    handleViewChange,
    handlePreviousPage,
    handleNextPage,
    handleExportClick,
    handleRestablecer,
    handleConfirmRestablecer,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handlePerdidaUpdated,
    setRestablecerModalOpen,
    setPerdidaToRestablecer,
    setUpdateModalOpen,
    setPerdidaToUpdate,
  };
};

export default usePerdidaState;