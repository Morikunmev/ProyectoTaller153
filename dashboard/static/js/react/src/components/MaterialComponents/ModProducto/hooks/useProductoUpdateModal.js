import { useState, useEffect, useCallback } from "react";

export const useProductoUpdateModal = ({
  isOpen,
  onClose,
  producto,
  onProductoUpdated,
}) => {
  const [formData, setFormData] = useState({
    NombreProducto: "",
    StockProductoInicial: "",
    PrecioUnitarioProducto: "",
    Categoria: "",
    DescripcionProducto: "",
    UbicacionProducto: "",
    EstadoProducto: "",
    FotoProducto: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [removedFiles, setRemovedFiles] = useState({
    foto: false
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
      fetchCategorias();
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 150);
    }
  }, [isOpen]);

  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/categorias/listar/");
      const data = await response.json();
      if (data.success) {
        setCategorias(data.categorias);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setErrors(prev => ({ ...prev, general: "Error al cargar categorías" }));
    }
  };

  useEffect(() => {
    if (producto && isOpen) {
      setFormData({
        NombreProducto: producto.NombreProducto || "",
        StockProductoInicial: producto.StockProductoInicial || "",
        PrecioUnitarioProducto: producto.PrecioUnitarioProducto || "",
        Categoria: producto.Categoria?.id || "",
        DescripcionProducto: producto.DescripcionProducto || "",
        UbicacionProducto: producto.UbicacionProducto || "",
        EstadoProducto: producto.EstadoProducto || "",
        FotoProducto: null
      });
      setPreviewUrl(producto.FotoProducto || "");
      setRemovedFiles({ foto: false });
    }
  }, [producto, isOpen]);

  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) return "El archivo es demasiado grande. Máximo 10MB";

    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/bmp", 
      "image/webp", "image/tiff", "image/svg+xml"
    ];
    if (!allowedTypes.includes(file.type)) {
      return "Formato no válido. Use: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG";
    }
    return null;
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }, [errors]);

  const handleFotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, FotoProducto: error }));
      e.target.value = "";
      return;
    }

    setFormData(prev => ({ ...prev, FotoProducto: file }));
    setRemovedFiles(prev => ({ ...prev, foto: false }));
    setPreviewUrl(URL.createObjectURL(file));
  }, [validateFile]);

  const handleRemoveFoto = useCallback(() => {
    setFormData(prev => ({ ...prev, FotoProducto: null }));
    setPreviewUrl("");
    setRemovedFiles(prev => ({ ...prev, foto: true }));
  }, []);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setErrors({});
      onClose();
    }, 150);
  }, [onClose]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const newErrors = {};
      if (!formData.NombreProducto) newErrors.NombreProducto = "Nombre requerido";
      if (!formData.StockProductoInicial) newErrors.StockProductoInicial = "Stock inicial requerido";
      if (!formData.PrecioUnitarioProducto) newErrors.PrecioUnitarioProducto = "Precio unitario requerido";
      if (!formData.Categoria) newErrors.Categoria = "Categoría requerida";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error("Complete todos los campos requeridos");
      }

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) submitData.append(key, formData[key]);
      });
      submitData.append("eliminar_FotoProducto", removedFiles.foto.toString());

      const response = await fetch(`/api/producto/${producto.id}/actualizar/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
        },
        body: submitData,
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
          throw new Error(Object.values(data.errors)[0]);
        }
        throw new Error(data.message || "Error al actualizar");
      }

      handleClose();
      if (onProductoUpdated) await onProductoUpdated(data.producto);
    } catch (error) {
      console.error("Error:", error);
      setErrors(prev => ({
        ...prev,
        general: error.message || "Error al actualizar el producto"
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, producto, handleClose, onProductoUpdated, removedFiles]);

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
    handleRemoveFoto
  };
};