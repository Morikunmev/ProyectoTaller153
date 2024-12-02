import { useState, useEffect, useCallback } from "react";

export const useProductoState = () => {
  // Estados principales
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de vista
  const [isGridView, setIsGridView] = useState(false);
  const [isChangingView, setIsChangingView] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [venderModalOpen, setVenderModalOpen] = useState(false);
  const [desecharModalOpen, setDesecharModalOpen] = useState(false);

  // Estados de productos seleccionados
  const [productoToUpdate, setProductoToUpdate] = useState(null);
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [productoToVender, setProductoToVender] = useState(null);
  const [productoToDesechar, setProductoToDesechar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 10;

  // Fetch productos
  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/producto/listar/");
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setProductos(data.productos);
        console.log("Productos actualizados:", data.productos); // Para debug
      } else {
        throw new Error(data.message || "Error al cargar los productos");
      }
    } catch (error) {
      console.error("Error en fetchProductos:", error); // Para debug
      setError("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
    return () => {
      setProductos([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  // Manejadores CRUD
  const handleDelete = useCallback((producto) => {
    if (!producto) return;
    setProductoToDelete(producto);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!productoToDelete?.id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/producto/${productoToDelete.id}/eliminar/`,
        {
          method: "DELETE",
          headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
              .value,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al eliminar");

      if (data.success) {
        setProductos((prev) =>
          prev.filter((p) => p.id !== productoToDelete.id)
        );
        setDeleteModalOpen(false);
        setProductoToDelete(null);
      }
    } catch (error) {
      setError("Error al eliminar el producto: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProductoCreated = async (nuevoProducto) => {
    try {
      setProductos((prevProductos) => [...prevProductos, nuevoProducto]);
      await fetchProductos();
      setCurrentPage(Math.ceil((productos.length + 1) / itemsPerPage));
      handleCloseModal();
      setError(null);
    } catch (error) {
      setError("Error al crear el producto");
      console.error("Error:", error);
    }
  };

  const handleProductoUpdated = async (updatedProduct) => {
    try {
      const updatedProductWithFiles = {
        ...updatedProduct,
        FotoProducto: updatedProduct.FotoProducto || null,
      };

      setProductos((prevProductos) =>
        prevProductos.map((p) =>
          p.id === updatedProductWithFiles.id ? updatedProductWithFiles : p
        )
      );

      await fetchProductos();
      setUpdateModalOpen(false);
      setProductoToUpdate(null);
    } catch (error) {
      console.error("Error al actualizar:", error);
      setError("Error al actualizar el producto");
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setIsSearching(true);
    setCurrentPage(1);
    setTimeout(() => setIsSearching(false), 300);
  };

  const handleViewChange = (isGrid) => {
    setIsChangingView(true);
    setTimeout(() => {
      setIsGridView(isGrid);
      setIsChangingView(false);
    }, 300);
  };

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Handlers modales
  const handleUpdateModalOpen = useCallback((producto) => {
    console.log("Estado antes de actualizar:", { producto });
    if (!producto) {
      console.log("No hay producto para editar");
      return;
    }
    setProductoToUpdate(producto);
    console.log("Abriendo modal con producto:", producto);
    setUpdateModalOpen(true);
  }, []);

  const handleUpdateModalClose = useCallback(() => {
    setUpdateModalOpen(false);
    setTimeout(() => {
      setProductoToUpdate(null);
    }, 300);
  }, []);

  // Manejadores de venta y desecho
  const handleVender = async (productoId, data) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Preparar los datos según si hay cliente o no
      const ventaData = {
        NombreVenta: data.NombreVenta,
        CantidadVenta: parseInt(data.CantidadVenta),
        PrecioVenta: parseFloat(data.PrecioVenta),
      };

      // Si hay datos de cliente, añadirlos
      if (data.cliente) {
        if (data.cliente.tipo === "existente") {
          ventaData.cliente = {
            tipo: "existente",
            id: data.cliente.id,
          };
        } else if (data.cliente.tipo === "nuevo") {
          ventaData.cliente = {
            tipo: "nuevo",
            NombreCliente: data.cliente.NombreCliente,
            ApellidoCliente: data.cliente.ApellidoCliente,
            RutCliente: data.cliente.RutCliente,
            TipoCliente: data.cliente.TipoCliente,
            NombreCompañia: data.cliente.NombreCompañia,
            TelefonoCliente: data.cliente.TelefonoCliente,
          };
        }
      }

      const response = await fetch(`/api/producto/${productoId}/venta/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
            .value,
        },
        body: JSON.stringify(ventaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors || "Error al vender producto");
      }

      await fetchProductos();
      setVenderModalOpen(false);
      setProductoToVender(null);
    } catch (error) {
      console.error("Error completo:", error);
      setError("Error al vender: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDesechar = async (productoId, data) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log("Datos a enviar:", data); // Para depuración

      const response = await fetch(`/api/producto/${productoId}/perdida/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
            .value,
        },
        body: JSON.stringify({
          nombre_perdida: data.NombrePerdida,
          cantidad: parseInt(data.CantidadPerdida),
          valor_unitario: parseFloat(data.ValorUnitarioPerdida),
          motivo: data.MotivoPerdida,
          descripcion: data.DescripcionPerdida,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors || "Error al registrar pérdida");
      }

      await fetchProductos();
      setDesecharModalOpen(false);
      setProductoToDesechar(null);
    } catch (error) {
      console.error("Error completo:", error);
      setError("Error al registrar pérdida: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleVenderOpen = useCallback((producto) => {
    if (!producto) return;
    setProductoToVender(producto);
    setVenderModalOpen(true);
  }, []);

  const handleVenderClose = useCallback(() => {
    setVenderModalOpen(false);
    setProductoToVender(null);
  }, []);

  const handleDesecharOpen = useCallback((producto) => {
    if (!producto) return;
    setProductoToDesechar(producto);
    setDesecharModalOpen(true);
  }, []);

  const handleDesecharClose = useCallback(() => {
    setDesecharModalOpen(false);
    setProductoToDesechar(null);
  }, []);

  // Filtrado y paginación
  const filteredProductos = productos.filter(
    (producto) =>
      producto.NombreProducto.toLowerCase().includes(
        searchTerm.toLowerCase()
      ) || producto.id.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredProductos.length
  );
  const currentProductos = filteredProductos.slice(startIndex, endIndex);

  return {
    // Estados
    searchTerm,
    loading,
    error,
    isGridView,
    isChangingView,
    isSearching,
    currentPage,
    isModalOpen,
    currentProductos,
    totalPages,
    startIndex,
    endIndex,
    filteredProductos,
    deleteModalOpen,
    productoToDelete,
    isDeleting,
    updateModalOpen,
    productoToUpdate,
    venderModalOpen,
    productoToVender,
    desecharModalOpen,
    productoToDesechar,

    // Manejadores
    handleOpenModal,
    handleCloseModal,
    handleSearch,
    handleViewChange,
    handleProductoCreated,
    handleProductoUpdated,
    handlePreviousPage,
    handleNextPage,
    handleDelete,
    isSubmitting,
    handleConfirmDelete,
    handleVender,
    handleDesechar,
    setDeleteModalOpen,
    setProductoToDelete,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handleVenderOpen,
    handleVenderClose,
    handleDesecharOpen,
    handleDesecharClose,
  };
};
