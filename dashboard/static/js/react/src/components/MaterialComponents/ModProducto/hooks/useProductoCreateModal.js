import { useState, useEffect } from "react";

export const useProductoCreateModal = ({ isOpen, onClose, onSubmit }) => {
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

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
      fetchCategorias();
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
    // Validación numérica del stock inicial
    if (formData.StockProductoInicial <= 0) {
      newErrors.StockProductoInicial = "El stock inicial debe ser mayor a 0";
    } else if (!Number.isInteger(Number(formData.StockProductoInicial))) {
      newErrors.StockProductoInicial = "El stock debe ser un número entero";
    }

    // Validación de precio unitario
    const precioUnitario = Number(formData.PrecioUnitarioProducto);
    if (isNaN(precioUnitario) || precioUnitario <= 0) {
      newErrors.PrecioUnitarioProducto =
        "El precio debe ser un número mayor a 0";
    }

    // Validación de límites
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
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

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
        await onSubmit(data.producto); // Esperar a que termine
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
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
  };
};
