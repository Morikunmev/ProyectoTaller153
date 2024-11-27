import { useState, useEffect, useCallback } from "react";
import { exportToExcel } from "../utils/MaterialExport";

export const useMaterialState = () => {
  // Estados principales
  const [materials, setMaterials] = useState([]);
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
  const [materialToUpdate, setMaterialToUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para el proceso de eliminación
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  const procesarMateriales = (materialsData) => {
    return materialsData.sort((a, b) => {
      // Ordenar por fecha de compra más reciente primero
      return new Date(b.FechaCompraMaterial) - new Date(a.FechaCompraMaterial);
    });
  };
  // Añadir la función handleExportClick
  const handleExportClick = useCallback(async () => {
    try {
      await exportToExcel();
      // Opcionalmente puedes mostrar un mensaje de éxito
    } catch (error) {
      setError("Error al exportar materiales: " + error.message);
    }
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/material/listar/");

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Mapear solo los campos necesarios
        const materialsProcessed = data.materials.map((material) => ({
          id: material.id,
          NombreMaterial: material.NombreMaterial,
          StockMaterial: material.StockMaterial,
          PrecioMaterial: material.PrecioMaterial,
          TotalMaterial: material.TotalMaterial,
          FechaCompraMaterial: material.FechaCompraMaterial,
          DescripcionMaterial: material.DescripcionMaterial,
          FotoMaterial: material.FotoMaterial || null,
          Proveedor: material.Proveedor
            ? {
                id: material.Proveedor.id,
                NombreProveedor: material.Proveedor.NombreProveedor,
              }
            : null,
        }));

        const materialsOrdenados = procesarMateriales(materialsProcessed);
        setMaterials(materialsOrdenados);
      }
    } catch (error) {
      console.error("Error al cargar materiales:", error);
      setError("No se pudieron cargar los materiales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    return () => {
      setMaterials([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  const handleDelete = useCallback((material) => {
    setMaterialToDelete(material);
    setDeleteModalOpen(true);
  }, []);

  const handleUpdateModalOpen = useCallback((material) => {
    setMaterialToUpdate(material);
    setUpdateModalOpen(true);
  }, []);

  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setMaterialToUpdate(null);
  }, []);

  const handleMaterialUpdated = useCallback(async (updatedMaterial) => {
    try {
      const materialConFoto = {
        ...updatedMaterial,
        FotoMaterial: updatedMaterial.FotoMaterial || null,
      };

      setMaterials((prevMaterials) =>
        prevMaterials.map((m) =>
          m.id === materialConFoto.id ? materialConFoto : m
        )
      );

      await fetchMaterials();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setError("Error al actualizar el material");
    }
  }, []);

  const handleConfirmDelete = async () => {
    if (!materialToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/material/${materialToDelete.id}/eliminar/`,
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
        throw new Error(data.message || "Error al eliminar el material");
      }

      if (data.success) {
        setMaterials((prevMaterials) =>
          prevMaterials.filter((m) => m.id !== materialToDelete.id)
        );
        setDeleteModalOpen(false);
        setMaterialToDelete(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Error al eliminar el material: " + error.message);
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

  const handleMaterialCreated = async (nuevoMaterial) => {
    try {
      const materialConFoto = {
        ...nuevoMaterial,
        FotoMaterial: nuevoMaterial.FotoMaterial || null,
      };

      setMaterials((prevMaterials) => [...prevMaterials, materialConFoto]);
      await fetchMaterials();
      const newTotalPages = Math.ceil((materials.length + 1) / itemsPerPage);
      setCurrentPage(newTotalPages);
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear material:", error);
      setError("Error al crear el material");
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Filtrado optimizado para los campos específicos
  const filteredMaterials = materials.filter((material) => {
    const searchString = searchTerm.toLowerCase();
    return (
      material.NombreMaterial.toLowerCase().includes(searchString) ||
      (material.DescripcionMaterial &&
        material.DescripcionMaterial.toLowerCase().includes(searchString)) ||
      (material.Proveedor &&
        material.Proveedor.NombreProveedor.toLowerCase().includes(
          searchString
        )) ||
      String(material.id).includes(searchString)
    );
  });

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredMaterials.length
  );
  const currentMaterials = filteredMaterials.slice(startIndex, endIndex);

  return {
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    isModalOpen,
    currentMaterials,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredMaterials,
    deleteModalOpen,
    materialToDelete,
    isDeleting,
    updateModalOpen,
    materialToUpdate,
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleMaterialCreated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    handleConfirmDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleMaterialUpdated,
    handleExportClick, // Asegúrate de que esta línea esté presente
    setDeleteModalOpen,
    setMaterialToDelete,
  };
};
