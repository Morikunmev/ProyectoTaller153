// useProveedorModal.js
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

  // // Efecto que maneja la visibilidad del modal
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 1);  // Inicia la animación
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]); // Se ejecuta cuando isOpen cambia

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.NombreProveedor || formData.NombreProveedor.length < 3) {
      newErrors.NombreProveedor = "El nombre debe tener al menos 3 caracteres";
    }
    if (
      !/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/.test(formData.RutProveedor)
    ) {
      newErrors.RutProveedor = "Formato inválido (XX.XXX.XXX-X)";
    }
    if (!formData.MarcaProveedor || formData.MarcaProveedor.length < 2) {
      newErrors.MarcaProveedor = "La marca debe tener al menos 2 caracteres";
    }
    if (formData.TelefonoProveedor && formData.TelefonoProveedor.length > 15) {
      newErrors.TelefonoProveedor =
        "El teléfono no puede tener más de 15 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle modal close
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      //Es una funcion que viene como prop desde el componente padre
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
    if (!validateForm()) return;

    //Se activa el estado que indica que el formulario se esta enviando, util para mostrar loading o deshabilitar el boton de envio
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
      if (data.success) {
        onSubmit(data.proveedor);
        handleClose();
      } else {
        setErrors(data.errors || { general: "Error al crear el proveedor" });
      }
    } catch (error) {
      setErrors({ general: error.message });
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
