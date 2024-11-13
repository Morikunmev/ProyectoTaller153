import { useState, useEffect } from "react";

export const useFacturaCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const today = new Date().toISOString().split("T")[0];

  // Form Data State
  const [formData, setFormData] = useState({
    FechaEmision: today,
    Proveedor: "",
    FotoFactura: null,
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  // Efecto para cargar la lista de proveedores
  useEffect(() => {
    if (isOpen) {
      fetchProveedores();
      setFormData({
        FechaEmision: today,
        Proveedor: "",
        FotoFactura: null,
      });
      setPreviewUrl(null);
      setErrors({});
    }
  }, [isOpen, today]);

  // Función para obtener la lista de proveedores
  const fetchProveedores = async () => {
    try {
      const response = await fetch("/api/proveedor/listar/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar los proveedores");
      }

      const data = await response.json();
      if (data.success) {
        setProveedores(data.proveedores || []);
      } else {
        throw new Error(data.message || "Error al cargar los proveedores");
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Error al cargar la lista de proveedores",
      }));
    }
  };

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
        FechaEmision: today,
        Proveedor: "",
        FotoFactura: null,
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
    // Limpiar error del campo cuando cambia
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Lista de tipos MIME de imágenes permitidos
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
        "image/tiff",
        "image/svg+xml",
        "application/pdf", // Incluir PDF si quieres permitirlo
      ];

      // Verificar el tamaño del archivo (ejemplo: 10MB máximo)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes

      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          FotoFactura:
            "Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG, PDF",
        }));
        e.target.value = "";
        return;
      }

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          FotoFactura:
            "El archivo es demasiado grande. El tamaño máximo permitido es 10MB",
        }));
        e.target.value = "";
        return;
      }

      // Si pasa las validaciones, proceder con el archivo
      setFormData((prev) => ({ ...prev, FotoFactura: file }));

      // Solo crear preview para imágenes (no PDF)
      if (file.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Limpiar la URL del objeto cuando ya no se necesite
        return () => URL.revokeObjectURL(objectUrl);
      } else {
        // Para PDFs, mostrar un icono o mensaje en lugar de preview
        setPreviewUrl("/path/to/pdf-icon.png"); // Podrías usar un ícono de PDF
      }

      // Limpiar error si existe
      if (errors.FotoFactura) {
        setErrors((prev) => ({
          ...prev,
          FotoFactura: null,
        }));
      }
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.FechaEmision) {
      newErrors.FechaEmision = "La fecha de emisión es requerida";
    }

    if (!formData.Proveedor) {
      newErrors.Proveedor = "Debe seleccionar un proveedor";
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("FechaEmision", formData.FechaEmision);
      formDataToSend.append("Proveedor", formData.Proveedor);
      if (formData.FotoFactura) {
        formDataToSend.append("FotoFactura", formData.FotoFactura);
      }

      const response = await fetch("/api/factura/crear/", {
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
        throw new Error(data.message || "Error al crear la factura");
      }

      if (data.success) {
        onSubmit(data.factura);
        handleClose();
      }
    } catch (error) {
      console.error("Error al crear factura:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error al crear la factura",
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
    proveedores,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFileChange,
  };
};
