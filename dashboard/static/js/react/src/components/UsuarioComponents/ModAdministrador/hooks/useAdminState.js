import { useState, useEffect, useCallback } from "react";
import { exportToExcel } from "../utils/AdministradorExport";

export const useAdminState = () => {
  // Estados principales
  const [administradores, setAdministradores] = useState([]);
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
  const [adminToUpdate, setAdminToUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para el proceso de eliminación
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  const processAdmins = (adminsData) => {
    return adminsData.sort((a, b) => {
      // Ordenar por ID de manera descendente
      return b.id - a.id;
    });
  };

  const handleExportClick = useCallback(async () => {
    try {
      await exportToExcel();
    } catch (error) {
      setError("Error al exportar administradores: " + error.message);
    }
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/administradores/listar/");

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.administradores) {
        const adminsProcessed = data.administradores.map((admin) => ({
          id: admin.id,
          user_id: admin.user_id,
          username: admin.username,
          email: admin.email,
          rut: admin.rut,
          telefono: admin.telefono,
          edad: admin.edad,
          foto: admin.foto,
        }));

        const adminsOrdenados = processAdmins(adminsProcessed);
        setAdministradores(adminsOrdenados);
      }
    } catch (error) {
      console.error("Error al cargar administradores:", error);
      setError("No se pudieron cargar los administradores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    return () => {
      setAdministradores([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  const handleDelete = useCallback((admin) => {
    setAdminToDelete(admin);
    setDeleteModalOpen(true);
  }, []);

  const handleUpdateModalOpen = useCallback((admin) => {
    setAdminToUpdate(admin);
    setUpdateModalOpen(true);
  }, []);

  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setAdminToUpdate(null);
  }, []);

  const handleAdminUpdated = useCallback(async (updatedAdmin) => {
    try {
      const adminConFoto = {
        ...updatedAdmin,
        foto: updatedAdmin.foto || null,
      };

      setAdministradores((prevAdmins) =>
        prevAdmins.map((a) =>
          a.id === adminConFoto.id ? adminConFoto : a
        )
      );

      await fetchAdmins();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setError("Error al actualizar el administrador");
    }
  }, []);

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/administrador/${adminToDelete.id}/eliminar/`,
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
        throw new Error(data.message || "Error al eliminar el administrador");
      }

      if (data.success) {
        setAdministradores((prevAdmins) =>
          prevAdmins.filter((a) => a.id !== adminToDelete.id)
        );
        setDeleteModalOpen(false);
        setAdminToDelete(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Error al eliminar el administrador: " + error.message);
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

  const handleAdminCreated = async (nuevoAdmin) => {
    try {
      const adminConFoto = {
        ...nuevoAdmin,
        foto: nuevoAdmin.foto || null,
      };

      setAdministradores((prevAdmins) => [...prevAdmins, adminConFoto]);
      await fetchAdmins();
      const newTotalPages = Math.ceil((administradores.length + 1) / itemsPerPage);
      setCurrentPage(newTotalPages);
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear administrador:", error);
      setError("Error al crear el administrador");
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const filteredAdmins = administradores.filter((admin) => {
    const searchString = searchTerm.toLowerCase();
    return (
      admin.username.toLowerCase().includes(searchString) ||
      admin.email.toLowerCase().includes(searchString) ||
      admin.rut.toLowerCase().includes(searchString) ||
      String(admin.id).includes(searchString)
    );
  });

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredAdmins.length);
  const currentAdmins = filteredAdmins.slice(startIndex, endIndex);

  return {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    isModalOpen,
    currentAdmins,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredAdmins,
    deleteModalOpen,
    adminToDelete,
    isDeleting,
    updateModalOpen,
    adminToUpdate,
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleAdminCreated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleAdminUpdated,
    handleExportClick,
    setDeleteModalOpen,
    setAdminToDelete,
  };
};