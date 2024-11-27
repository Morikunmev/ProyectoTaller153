import { useState, useEffect, useCallback } from "react";

export const useProveedorCreateModal = ({ isOpen, onClose, onSubmit }) => {
  // Form Data State
  const [formData, setFormData] = useState({
    NombreProveedor: "",
    RutProveedor: "",
    MarcaProveedor: "",
    ComentarioProveedor: "",
    CiudadProveedor: "",
    RegionProveedor: "",
    PaisProveedor: "",
    TelefonoProveedor: "",
    FotoProveedor: null,
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Efecto que maneja la visibilidad del modal
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 1);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Validación de archivos
  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "El archivo es demasiado grande. El tamaño máximo permitido es 10MB";
    }

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

    if (!allowedTypes.includes(file.type)) {
      return "Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG";
    }

    return null;
  }, []);

  // Handle modal close
  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setFormData({
        NombreProveedor: "",
        RutProveedor: "",
        MarcaProveedor: "",
        ComentarioProveedor: "",
        CiudadProveedor: "",
        RegionProveedor: "",
        PaisProveedor: "",
        TelefonoProveedor: "",
        FotoProveedor: null,
      });
      setPreviewUrl(null);
      setErrors({});
    }, 150);
  }, [onClose]);

  // Handle input changes
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Limpiar errores al modificar un campo
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    },
    [errors]
  );

  // Handle file input
  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const error = validateFile(file);
        if (error) {
          setErrors((prev) => ({ ...prev, FotoProveedor: error }));
          e.target.value = "";
          return;
        }

        setFormData((prev) => ({ ...prev, FotoProveedor: file }));
        setPreviewUrl(URL.createObjectURL(file));

        // Limpiar error si existe
        if (errors.FotoProveedor) {
          setErrors((prev) => ({ ...prev, FotoProveedor: null }));
        }
      }
    },
    [errors, validateFile]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      setIsSubmitting(true);

      try {
        // Validaciones
        const newErrors = {};
        if (!formData.NombreProveedor.trim()) {
          newErrors.NombreProveedor = "El nombre es requerido";
        }
        if (!formData.RutProveedor.trim()) {
          newErrors.RutProveedor = "El RUT es requerido";
        }
        if (!formData.MarcaProveedor.trim()) {
          newErrors.MarcaProveedor = "La marca es requerida";
        }

        // Validar formato de teléfono si se proporciona
        if (
          formData.TelefonoProveedor &&
          !/^\+?[\d\s-]+$/.test(formData.TelefonoProveedor)
        ) {
          newErrors.TelefonoProveedor = "Formato de teléfono no válido";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setIsSubmitting(false);
          return;
        }

        const formDataToSend = new FormData();
        Object.keys(formData).forEach((key) => {
          if (formData[key] !== null && formData[key] !== "") {
            formDataToSend.append(key, formData[key]);
          }
        });

        const response = await fetch("/api/proveedor/crear/", {
          method: "POST",
          headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
              .value,
          },
          body: formDataToSend,
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.errors) {
            setErrors(data.errors);
            throw new Error(Object.values(data.errors)[0]);
          }
          throw new Error(data.message || "Error al crear el proveedor");
        }

        if (data.success) {
          onSubmit(data.proveedor);
          handleClose();
        }
      } catch (error) {
        console.error("Error al crear proveedor:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error al crear el proveedor",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, handleClose, onSubmit]
  );

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
    handleFileChange,
  };
};
