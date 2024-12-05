import { useState, useEffect, useCallback } from "react";
import { exportToExcel } from "../utils/CategoriaExport";

export const useCategoriaState = () => {
  // Estados principales
  const [categorias, setCategorias] = useState([]);
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
  const [categoriaToUpdate, setCategoriaToUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para el proceso de eliminación
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  const procesarCategorias = (categoriasData) => {
    return categoriasData.sort((a, b) => {
      return a.NombreCategoria.localeCompare(b.NombreCategoria);
    });
  };

  const handleExportClick = useCallback(async () => {
    try {
      await exportToExcel();
    } catch (error) {
      setError("Error al exportar categorías: " + error.message);
    }
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/categoria/listar-completo/");

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const categoriasProcessed = data.categorias.map((categoria) => ({
          id: categoria.id,
          NombreCategoria: categoria.NombreCategoria,
          DescripcionCategoria: categoria.DescripcionCategoria,
          StockCategoria: categoria.StockCategoria,
          FotoCategoria: categoria.FotoCategoria || null,
          CantidadCategoriaPerdida: categoria.CantidadCategoriaPerdida,
          CantidadCategoriaVenta: categoria.CantidadCategoriaVenta,
          // Eliminados DineroCategoriaPerdida y DineroCategoriaVenta
          TotalCategoriaVenta: categoria.TotalCategoriaVenta,
          TotalCategoriaPerdida: categoria.TotalCategoriaPerdida,
        }));

        const categoriasOrdenadas = procesarCategorias(categoriasProcessed);
        setCategorias(categoriasOrdenadas);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setError("No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
    return () => {
      setCategorias([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  const handleDelete = useCallback((categoria) => {
    setCategoriaToDelete(categoria);
    setDeleteModalOpen(true);
  }, []);

  const handleUpdateModalOpen = useCallback((categoria) => {
    setCategoriaToUpdate(categoria);
    setUpdateModalOpen(true);
  }, []);

  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setCategoriaToUpdate(null);
  }, []);

  const handleCategoriaUpdated = useCallback(async (updatedCategoria) => {
    try {
      const categoriaConFoto = {
        ...updatedCategoria,
        FotoCategoria: updatedCategoria.FotoCategoria || null,
        CantidadCategoriaPerdida:
          updatedCategoria.CantidadCategoriaPerdida || 0,
        CantidadCategoriaVenta: updatedCategoria.CantidadCategoriaVenta || 0,
        TotalCategoriaVenta: updatedCategoria.TotalCategoriaVenta || "0",
        TotalCategoriaPerdida: updatedCategoria.TotalCategoriaPerdida || "0",
      };

      setCategorias((prevCategorias) =>
        prevCategorias.map((c) =>
          c.id === categoriaConFoto.id ? categoriaConFoto : c
        )
      );

      await fetchCategorias();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setError("Error al actualizar la categoría");
    }
  }, []);
  const handleConfirmDelete = async () => {
    if (!categoriaToDelete) return;

    setIsDeleting(true);
    try {
      // Primero enviamos la solicitud de eliminación por correo
      const response = await fetch(
        `/api/categoria/${categoriaToDelete.id}/solicitar-eliminacion/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
              .value,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al solicitar la eliminación");
      }

      if (data.success) {
        // Cerramos el modal y mostramos mensaje de éxito
        setDeleteModalOpen(false);
        setCategoriaToDelete(null);
        // Aquí podrías mostrar un mensaje al usuario indicando que revise su correo
        alert(
          "Se ha enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada."
        );
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Error al solicitar la eliminación: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };
  // Modificar el texto del modal de eliminación
  const modalContent = {
    title: "Confirmar Solicitud de Eliminación",
    message:
      "Se enviará un correo de confirmación para proceder con la eliminación de esta categoría. ¿Deseas continuar?",
    confirmButton: isDeleting ? "Enviando..." : "Enviar Confirmación",
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

  const handleCategoriaCreated = async (nuevaCategoria) => {
    try {
      const categoriaConFoto = {
        ...nuevaCategoria,
        FotoCategoria: nuevaCategoria.FotoCategoria || null,
        CantidadCategoriaPerdida: 0,
        CantidadCategoriaVenta: 0,
        TotalCategoriaVenta: "0",
        TotalCategoriaPerdida: "0",
      };

      setCategorias((prevCategorias) => [...prevCategorias, categoriaConFoto]);
      await fetchCategorias();
      const newTotalPages = Math.ceil((categorias.length + 1) / itemsPerPage);
      setCurrentPage(newTotalPages);
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear categoría:", error);
      setError("Error al crear la categoría");
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const filteredCategorias = categorias.filter((categoria) => {
    const searchString = searchTerm.toLowerCase();
    return (
      categoria.NombreCategoria.toLowerCase().includes(searchString) ||
      (categoria.DescripcionCategoria &&
        categoria.DescripcionCategoria.toLowerCase().includes(searchString)) ||
      String(categoria.id).includes(searchString)
    );
  });

  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredCategorias.length
  );
  const currentCategorias = filteredCategorias.slice(startIndex, endIndex);

  return {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    isModalOpen,
    currentCategorias,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredCategorias,
    deleteModalOpen,
    categoriaToDelete,
    isDeleting,
    updateModalOpen,
    categoriaToUpdate,
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleCategoriaCreated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleCategoriaUpdated,
    handleExportClick,
    setDeleteModalOpen,
    setCategoriaToDelete,
  };
};
