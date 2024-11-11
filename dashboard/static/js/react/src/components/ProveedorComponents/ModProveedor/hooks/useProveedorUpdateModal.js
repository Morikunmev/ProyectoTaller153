import { useState, useEffect, useCallback } from "react";

export const useProveedorUpdateModal = ({
  isOpen,
  onClose,
  proveedor,
  onProveedorUpdated,
}) => {
  // Estados del formulario y modal
  const [formData, setFormData] = useState({
    NombreProveedor: "",
    RutProveedor: "",
    MarcaProveedor: "",
    ComentarioProveedor: "",
    CiudadProveedor: "",
    RegionProveedor: "",
    PaisProveedor: "",
    TelefonoProveedor: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // Efecto para manejar la animación de apertura/cierre
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 150);
    }
  }, [isOpen]);

  // Efecto para cargar los datos del proveedor cuando se abre el modal
  useEffect(() => {
    if (proveedor && isOpen) {
      setFormData({
        NombreProveedor: proveedor.NombreProveedor || "",
        RutProveedor: proveedor.RutProveedor || "",
        MarcaProveedor: proveedor.MarcaProveedor || "",
        ComentarioProveedor: proveedor.ComentarioProveedor || "",
        CiudadProveedor: proveedor.CiudadProveedor || "",
        RegionProveedor: proveedor.RegionProveedor || "",
        PaisProveedor: proveedor.PaisProveedor || "",
        TelefonoProveedor: proveedor.TelefonoProveedor || "",
      });
      setPreviewUrl(proveedor.FotoProveedor || "");
    }
  }, [proveedor, isOpen]);

  // Manejador de cambios en los inputs
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Manejador de cambios en el archivo de imagen
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData((prev) => ({
          ...prev,
          FotoProveedor: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Validación del formulario
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validación del nombre (requerido y único)
    if (!formData.NombreProveedor.trim()) {
      newErrors.NombreProveedor = "El nombre es requerido";
    } else if (formData.NombreProveedor.length > 100) {
      newErrors.NombreProveedor =
        "El nombre no puede exceder los 100 caracteres";
    }

    // Validación del RUT (requerido, único y formato específico)
    if (!formData.RutProveedor.trim()) {
      newErrors.RutProveedor = "El RUT es requerido";
    } else {
      const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/;
      if (!rutRegex.test(formData.RutProveedor)) {
        newErrors.RutProveedor = "El RUT debe tener formato XX.XXX.XXX-X";
      }
      if (formData.RutProveedor.length > 12) {
        newErrors.RutProveedor = "El RUT no puede exceder los 12 caracteres";
      }
    }

    // Validación de la marca (requerida y única)
    if (!formData.MarcaProveedor.trim()) {
      newErrors.MarcaProveedor = "La marca es requerida";
    } else if (formData.MarcaProveedor.length > 100) {
      newErrors.MarcaProveedor = "La marca no puede exceder los 100 caracteres";
    }

    // Validaciones de campos opcionales
    if (formData.CiudadProveedor && formData.CiudadProveedor.length > 100) {
      newErrors.CiudadProveedor =
        "La ciudad no puede exceder los 100 caracteres";
    }

    if (formData.RegionProveedor && formData.RegionProveedor.length > 100) {
      newErrors.RegionProveedor =
        "La región no puede exceder los 100 caracteres";
    }

    if (formData.PaisProveedor && formData.PaisProveedor.length > 100) {
      newErrors.PaisProveedor = "El país no puede exceder los 100 caracteres";
    }

    // Validación del teléfono
    if (formData.TelefonoProveedor) {
      if (formData.TelefonoProveedor.length > 15) {
        newErrors.TelefonoProveedor =
          "El teléfono no puede exceder los 15 caracteres";
      }
      const phoneRegex = /^\+?[\d\s-]+$/;
      if (!phoneRegex.test(formData.TelefonoProveedor)) {
        newErrors.TelefonoProveedor = "Formato de teléfono inválido";
      }
    }

    // Validación de la imagen
    if (formData.FotoProveedor && formData.FotoProveedor instanceof File) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(formData.FotoProveedor.type)) {
        newErrors.FotoProveedor =
          "El archivo debe ser una imagen (JPEG, PNG o GIF)";
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (formData.FotoProveedor.size > maxSize) {
        newErrors.FotoProveedor = "La imagen no puede exceder los 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Manejador de cierre del modal
  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setErrors({});
      onClose();
    }, 150);
  }, [onClose]);

  // Manejador de envío del formulario
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        // Crear FormData para enviar archivos
        const submitData = new FormData();
        for (const [key, value] of Object.entries(formData)) {
          if (value instanceof File || value) {
            submitData.append(key, value);
          }
        }

        // Realizar la petición de actualización
        const response = await fetch(`/api/proveedores/${proveedor.id}/`, {
          method: "POST",
          headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
              .value,
          },
          body: submitData,
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al actualizar el proveedor");
        }

        // Primero cerramos el modal
        handleClose();

        // Luego notificamos al componente padre del éxito
        if (onProveedorUpdated) {
          await onProveedorUpdated(data.proveedor);
        }
      } catch (error) {
        console.error("Error al actualizar el proveedor:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error al actualizar el proveedor",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, proveedor, handleClose, onProveedorUpdated]
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

export default useProveedorUpdateModal;
