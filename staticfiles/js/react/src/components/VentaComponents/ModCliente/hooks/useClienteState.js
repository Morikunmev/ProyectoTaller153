import { useState, useEffect, useCallback } from "react";
import { exportToExcel } from "../utils/ClienteExport";

const useClienteState = () => {
  // Main state
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isGridView, setIsGridView] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation states
  const [isChangingView, setIsChangingView] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Modal states
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [clienteToUpdate, setClienteToUpdate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  // Filter clientes based on search term
  const filteredClientes = clientes.filter((cliente) => {
    const searchString = searchTerm.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(searchString) ||
      cliente.apellido.toLowerCase().includes(searchString) ||
      cliente.rut.toLowerCase().includes(searchString) ||
      (cliente.nombre_compania &&
        cliente.nombre_compania.toLowerCase().includes(searchString)) ||
      String(cliente.id).includes(searchString)
    );
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredClientes.length);
  const currentClientes = filteredClientes.slice(startIndex, endIndex);

  const procesarClientes = useCallback((clientesData) => {
    return clientesData.sort(
      (a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro)
    );
  }, []);
  const handleClienteCreated = useCallback(async () => {
    try {
      await fetchClientes();
      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setError("Error al crear el cliente");
    }
  }, [fetchClientes]);

  const handleOpenCreateModal = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/clientes/listar/");
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setClientes(procesarClientes(data.clientes));
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      setError("No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  }, [procesarClientes]);

  useEffect(() => {
    fetchClientes();
    return () => {
      setClientes([]);
      setLoading(true);
      setError(null);
    };
  }, [fetchClientes]);

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
      setError("Error al exportar clientes: " + error.message);
    }
  }, []);
  const handleDelete = async (clienteId) => {
    try {
      const response = await fetch(`/api/cliente/${clienteId}/eliminar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
            .value,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors || "Error al eliminar el cliente");
      }

      // Recargar la lista de clientes
      await fetchClientes(); // Asegúrate de que esta función existe

      return true;
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      throw error;
    }
  };

  const handleUpdateModalOpen = useCallback((cliente) => {
    setClienteToUpdate(cliente);
    setUpdateModalOpen(true);
  }, []);

  const handleClienteUpdated = useCallback(async () => {
    try {
      await fetchClientes();
      setUpdateModalOpen(false);
      setClienteToUpdate(null);
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setError("Error al actualizar el cliente");
    }
  }, [fetchClientes]);

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
    currentClientes,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredClientes,
    updateModalOpen,
    clienteToUpdate,
    isGridView,
    isDeleting,
    handleSearch,
    handleViewChange,
    handlePreviousPage,
    handleNextPage,
    handleExportClick,
    createModalOpen,
    handleClienteCreated,
    handleOpenCreateModal,
    setCreateModalOpen,
    handleDelete,
    handleUpdateModalOpen,
    handleClienteUpdated,
    setUpdateModalOpen,
    setClienteToUpdate,
  };
};

export default useClienteState;
