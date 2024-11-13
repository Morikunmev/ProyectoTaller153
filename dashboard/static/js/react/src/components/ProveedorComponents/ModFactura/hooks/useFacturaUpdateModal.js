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
    FotoFactura: null,
    DocumentoFactura: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState("");
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
        FotoFactura: null,
        DocumentoFactura: null,
      });
      setPreviewUrl(factura.FotoFactura || "");
      setDocumentPreviewUrl(factura.DocumentoFactura || "");
    }
  }, [factura, isOpen]);

  // Manejador de cambios en los inputs
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar error del campo cuando cambia
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  }, [errors]);

  // Función de validación de archivos
  const validateFile = useCallback((file, type) => {
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      return "El archivo es demasiado grande. El tamaño máximo permitido es 10MB";
    }

    if (type === "foto") {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
        "image/tiff",
        "image/svg+xml",
        "application/pdf",
      ];

      if (!allowedTypes.includes(file.type)) {
        return "Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG, PDF";
      }
    }

    return null;
  }, []);

  // Manejador de cambios en la foto
  const handleFotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file, "foto");
      if (error) {
        setErrors((prev) => ({ ...prev, FotoFactura: error }));
        e.target.value = "";
        return;
      }

      // Limpiar error previo si existe
      if (errors.FotoFactura) {
        setErrors((prev) => ({ ...prev, FotoFactura: null }));
      }

      setFormData((prev) => ({ ...prev, FotoFactura: file }));

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl("/path/to/pdf-icon.png");
      }
    }
  }, [errors, validateFile]);

  // Manejador de cambios en el documento
  const handleDocumentoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file, "documento");
      if (error) {
        setErrors((prev) => ({ ...prev, DocumentoFactura: error }));
        e.target.value = "";
        return;
      }

      // Limpiar error previo si existe
      if (errors.DocumentoFactura) {
        setErrors((prev) => ({ ...prev, DocumentoFactura: null }));
      }

      setFormData((prev) => ({ ...prev, DocumentoFactura: file }));
      setDocumentPreviewUrl(URL.createObjectURL(file));

      return () => URL.revokeObjectURL(documentPreviewUrl);
    }
  }, [errors, validateFile, documentPreviewUrl]);

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
        submitData.append("FechaEmision", formData.FechaEmision);
        submitData.append("Proveedor", formData.Proveedor);
        
        if (formData.FotoFactura instanceof File) {
          submitData.append("FotoFactura", formData.FotoFactura);
        }
        
        if (formData.DocumentoFactura instanceof File) {
          submitData.append("DocumentoFactura", formData.DocumentoFactura);
        }

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

        handleClose();

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
    documentPreviewUrl,
    proveedores,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleDocumentoChange,
  };
};

export default useFacturaUpdateModal;