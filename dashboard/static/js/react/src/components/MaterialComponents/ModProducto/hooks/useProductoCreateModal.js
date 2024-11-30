import { useState, useEffect } from "react";

export const useProductoCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
  materialesAgregados,
}) => {
  const [formData, setFormData] = useState({
    NombreProducto: "",
    StockProductoInicial: "",
    PrecioUnitarioProducto: "",
    Categoria: "",
    DescripcionProducto: "",
    UbicacionProducto: "",
    EstadoProducto: "",
    FotoProducto: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [materiales, setMateriales] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
      fetchCategorias();
      fetchMateriales();
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [isOpen]);

  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/categorias/listar/");
      if (!response.ok) throw new Error("Error al cargar categorías");
      const data = await response.json();
      if (data.success) {
        setCategorias(data.categorias);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchMateriales = async () => {
    try {
      const response = await fetch("/api/materiales/producto/");
      if (!response.ok) throw new Error("Error al cargar materiales");
      const data = await response.json();
      if (data.success) {
        setMateriales(data.materiales);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFormData((prev) => ({
        ...prev,
        FotoProducto: file,
      }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFormData((prev) => ({
      ...prev,
      FotoProducto: null,
    }));
    setPreviewUrl(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.NombreProducto)
      newErrors.NombreProducto = "El nombre es requerido";
    if (!formData.StockProductoInicial)
      newErrors.StockProductoInicial = "El stock inicial es requerido";
    if (!formData.PrecioUnitarioProducto)
      newErrors.PrecioUnitarioProducto = "El precio unitario es requerido";

    if (formData.StockProductoInicial <= 0) {
      newErrors.StockProductoInicial = "El stock inicial debe ser mayor a 0";
    } else if (!Number.isInteger(Number(formData.StockProductoInicial))) {
      newErrors.StockProductoInicial = "El stock debe ser un número entero";
    }

    const precioUnitario = Number(formData.PrecioUnitarioProducto);
    if (isNaN(precioUnitario) || precioUnitario <= 0) {
      newErrors.PrecioUnitarioProducto =
        "El precio debe ser un número mayor a 0";
    }

    if (formData.StockProductoInicial > 9999) {
      newErrors.StockProductoInicial = "El stock no puede ser mayor a 9999";
    }

    if (precioUnitario > 999999) {
      newErrors.PrecioUnitarioProducto =
        "El precio no puede ser mayor a 999,999";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Agregar materiales al FormData
      if (materialesAgregados?.length > 0) {
        formDataToSend.append(
          "materiales",
          JSON.stringify(
            materialesAgregados.map((m) => ({
              material_id: m.id,
              cantidad: m.cantidad,
              descripcion: m.descripcion,
            }))
          )
        );
      }

      const response = await fetch("/api/producto/crear/", {
        method: "POST",
        headers: {
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
            .value,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear el producto");
      }

      if (data.success) {
        await onSubmit(data.producto);
        handleClose();
      } else {
        setErrors(data.errors || { general: "Error al crear el producto" });
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      NombreProducto: "",
      StockProductoInicial: "",
      PrecioUnitarioProducto: "",
      Categoria: "",
      DescripcionProducto: "",
      UbicacionProducto: "",
      EstadoProducto: "",
      FotoProducto: null,
    });
    setErrors({});
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onClose();
  };

  return {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    categorias,
    materiales,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
  };
};
