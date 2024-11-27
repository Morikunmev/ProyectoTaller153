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
        const response = await fetch(
          `/api/proveedores/${proveedor.id}/actualizar`,
          {
            method: "POST",
            headers: {
              "X-CSRFToken": document.querySelector(
                "[name=csrfmiddlewaretoken]"
              ).value,
            },
            body: submitData,
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (data.errors) {
            setErrors(data.errors);
            throw new Error(Object.values(data.errors)[0]);
          }
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
    [formData, proveedor, handleClose, onProveedorUpdated]
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
