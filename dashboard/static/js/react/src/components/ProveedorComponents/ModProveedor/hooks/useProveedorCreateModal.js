import { useState, useEffect } from "react";

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

  // Handle modal close
  const handleClose = () => {
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
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, FotoProveedor: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
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
  };

  return {
    // States
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,

    // Event Handlers
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFileChange,
  };
};
