import { useState, useEffect } from "react";

export const useCategoriaCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    NombreCategoria: "",
    DescripcionCategoria: "",
    FotoCategoria: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        NombreCategoria: "",
        DescripcionCategoria: "",
        FotoCategoria: null,
      });
      setPreviewUrl(null);
      setErrors({});
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 1);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setFormData({
        NombreCategoria: "",
        DescripcionCategoria: "",
        FotoCategoria: null,
      });
      setPreviewUrl(null);
      setErrors({});
    }, 150);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar errores al editar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "image/tiff",
      "image/svg+xml",
    ];

    if (file.size > maxSize) {
      return "El archivo es demasiado grande. El tamaño máximo permitido es 10MB";
    }

    if (!allowedTypes.includes(file.type)) {
      return "Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG";
    }

    return null;
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setErrors((prev) => ({ ...prev, FotoCategoria: error }));
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, FotoCategoria: file }));
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      if (errors.FotoCategoria) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.FotoCategoria;
          return newErrors;
        });
      }
    }
  };

  const handleRemoveFoto = () => {
    setFormData((prev) => ({ ...prev, FotoCategoria: null }));
    setPreviewUrl(null);
    const fileInput = document.getElementById("foto-categoria");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.NombreCategoria.trim()) {
      newErrors.NombreCategoria = "El nombre de la categoría es requerido";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const data = new FormData();
      data.append("NombreCategoria", formData.NombreCategoria.trim());

      if (formData.DescripcionCategoria?.trim()) {
        data.append(
          "DescripcionCategoria",
          formData.DescripcionCategoria.trim()
        );
      }

      if (formData.FotoCategoria) {
        data.append("FotoCategoria", formData.FotoCategoria);
      }

      const csrfToken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      )?.value;
      if (!csrfToken) {
        throw new Error("Token CSRF no encontrado");
      }

      const response = await fetch("/api/categoria/crear/", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        // Manejar errores específicos del backend
        if (result.errors) {
          setErrors(result.errors);
          throw new Error(Object.values(result.errors)[0]);
        }
        throw new Error(result.error || "Error al crear la categoría");
      }

      if (result.success) {
        // Notificar éxito
        if (onSubmit) {
          onSubmit(result.categoria);
        }
        handleClose();
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error al crear categoría:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error al crear la categoría",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
  };
};
