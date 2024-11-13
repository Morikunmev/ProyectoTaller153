import { useState, useEffect, useCallback } from "react";

export const useFacturaUpdateModal = ({
  isOpen,
  onClose,
  factura,
  onFacturaUpdated,
}) => {
  // Estados del formulario y modal
  const [formData, setFormData] = useState({
    FechaEmision: "",
    Proveedor: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [proveedores, setProveedores] = useState([]);

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

  // Efecto para cargar la lista de proveedores
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await fetch("/api/proveedor/listar/");
        const data = await response.json();
        if (data.success) {
          setProveedores(data.proveedores);
        }
      } catch (error) {
        console.error("Error al cargar los proveedores:", error);
        setErrors((prev) => ({
          ...prev,
          general: "Error al cargar la lista de proveedores",
        }));
      }
    };

    if (isOpen) {
      fetchProveedores();
    }
  }, [isOpen]);

  // Efecto para cargar los datos de la factura cuando se abre el modal
  useEffect(() => {
    if (factura && isOpen) {
      setFormData({
        FechaEmision: factura.FechaEmision || "",
        Proveedor: factura.Proveedor?.id || "",
      });
      setPreviewUrl(factura.FotoFactura || "");
    }
  }, [factura, isOpen]);

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
          FotoFactura: file,
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
        // Validar campos requeridos
        const newErrors = {};
        if (!formData.FechaEmision) {
          newErrors.FechaEmision = "La fecha de emisión es requerida";
        }
        if (!formData.Proveedor) {
          newErrors.Proveedor = "Debe seleccionar un proveedor";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          throw new Error("Por favor complete todos los campos requeridos");
        }

        // Crear FormData para enviar archivos
        const submitData = new FormData();
        for (const [key, value] of Object.entries(formData)) {
          if (value instanceof File || value) {
            submitData.append(key, value);
          }
        }

        // Realizar la petición de actualización
        const response = await fetch(`/api/factura/${factura.id}/actualizar/`, {
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
          if (data.errors) {
            setErrors(data.errors);
            throw new Error(Object.values(data.errors)[0]);
          }
          throw new Error(data.message || "Error al actualizar la factura");
        }

        // Primero cerramos el modal
        handleClose();

        // Luego notificamos al componente padre del éxito
        if (onFacturaUpdated) {
          await onFacturaUpdated(data.factura);
        }
      } catch (error) {
        console.error("Error al actualizar la factura:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error al actualizar la factura",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, factura, handleClose, onFacturaUpdated]
  );

  return {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    proveedores,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFileChange,
  };
};

export default useFacturaUpdateModal;
