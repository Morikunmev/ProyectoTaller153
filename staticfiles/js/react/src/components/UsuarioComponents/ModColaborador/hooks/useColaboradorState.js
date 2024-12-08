import { useState, useEffect, useCallback } from "react";
import { exportToExcel } from "../utils/ColaboradorExport";

export const useColaboradorState = () => {
  // Estados principales
  const [colaboradores, setColaboradores] = useState([]);
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
  const [colaboradorToUpdate, setColaboradorToUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para el proceso de eliminación
  const [colaboradorToDelete, setColaboradorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  const processColaboradores = (colabsData) => {
    return colabsData.sort((a, b) => {
      // Ordenar por ID de manera descendente
      return b.id - a.id;
    });
  };

  const handleExportClick = useCallback(async () => {
    try {
      await exportToExcel();
    } catch (error) {
      setError("Error al exportar colaboradores: " + error.message);
    }
  }, []);

  const fetchColaboradores = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/colaboradores/listar/");

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.colaboradores) {
        const colaboradoresProcessed = data.colaboradores.map((colab) => ({
          id: colab.id,
          user_id: colab.user_id,
          username: colab.username,
          email: colab.email,
          rut: colab.rut,
          telefono: colab.telefono,
          edad: colab.edad,
          foto: colab.foto,
        }));

        const colaboradoresOrdenados = processColaboradores(colaboradoresProcessed);
        setColaboradores(colaboradoresOrdenados);
      }
    } catch (error) {
      console.error("Error al cargar colaboradores:", error);
      setError("No se pudieron cargar los colaboradores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColaboradores();
    return () => {
      setColaboradores([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  const handleDelete = useCallback((colab) => {
    setColaboradorToDelete(colab);
    setDeleteModalOpen(true);
  }, []);

  const handleUpdateModalOpen = useCallback((colab) => {
    setColaboradorToUpdate(colab);
    setUpdateModalOpen(true);
  }, []);

  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setColaboradorToUpdate(null);
  }, []);

  const handleColaboradorUpdated = useCallback(async (updatedColab) => {
    try {
      const colabConFoto = {
        ...updatedColab,
        foto: updatedColab.foto || null,
      };

      setColaboradores((prevColabs) =>
        prevColabs.map((c) =>
          c.id === colabConFoto.id ? colabConFoto : c
        )
      );

      await fetchColaboradores();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setError("Error al actualizar el colaborador");
    }
  }, []);

  const handleConfirmDelete = async () => {
    if (!colaboradorToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/colaborador/${colaboradorToDelete.id}/eliminar/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar el colaborador");
      }

      if (data.success) {
        setColaboradores((prevColabs) =>
          prevColabs.filter((c) => c.id !== colaboradorToDelete.id)
        );
        setDeleteModalOpen(false);
        setColaboradorToDelete(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Error al eliminar el colaborador: " + error.message);
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

  const handleColaboradorCreated = async (nuevoColab) => {
    try {
      const colabConFoto = {
        ...nuevoColab,
        foto: nuevoColab.foto || null,
      };

      setColaboradores((prevColabs) => [...prevColabs, colabConFoto]);
      await fetchColaboradores();
      const newTotalPages = Math.ceil((colaboradores.length + 1) / itemsPerPage);
      setCurrentPage(newTotalPages);
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear colaborador:", error);
      setError("Error al crear el colaborador");
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredColaboradores.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const filteredColaboradores = colaboradores.filter((colab) => {
    const searchString = searchTerm.toLowerCase();
    return (
      colab.username.toLowerCase().includes(searchString) ||
      colab.email.toLowerCase().includes(searchString) ||
      colab.rut.toLowerCase().includes(searchString) ||
      String(colab.id).includes(searchString)
    );
  });

  const totalPages = Math.ceil(filteredColaboradores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredColaboradores.length);
  const currentColaboradores = filteredColaboradores.slice(startIndex, endIndex);

  return {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    isModalOpen,
    currentColaboradores,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredColaboradores,
    deleteModalOpen,
    colaboradorToDelete,
    isDeleting,
    updateModalOpen,
    colaboradorToUpdate,
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleColaboradorCreated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleColaboradorUpdated,
    handleExportClick,
    setDeleteModalOpen,
    setColaboradorToDelete,
  };
};