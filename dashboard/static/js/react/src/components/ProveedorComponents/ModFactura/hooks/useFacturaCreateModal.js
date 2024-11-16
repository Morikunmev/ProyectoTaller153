import { useState, useEffect } from "react";

export const useFacturaCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const today = new Date().toISOString().split("T")[0];

  // Form Data State
  const [formData, setFormData] = useState({
    FechaEmision: today,
    NumeroFactura: "", // Añadido
    Proveedor: "",
    FotoFactura: null,
    DocumentoFactura: null,
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  // Efecto para cargar la lista de proveedores y resetear el formulario
  useEffect(() => {
    if (isOpen) {
      fetchProveedores();
      setFormData({
        FechaEmision: today,
        Proveedor: "",
        FotoFactura: null,
        DocumentoFactura: null,
      });
      setPreviewUrl(null);
      setDocumentPreviewUrl(null);
      setErrors({});
    }
  }, [isOpen, today]);

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

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setFormData({
        FechaEmision: today,
        Proveedor: "",
        FotoFactura: null,
        DocumentoFactura: null,
      });
      setPreviewUrl(null);
      setDocumentPreviewUrl(null);
      setErrors({});
    }, 150);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateFile = (file, fieldName) => {
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes

    if (file.size > maxSize) {
      return `El archivo es demasiado grande. El tamaño máximo permitido es 10MB`;
    }

    if (fieldName === "FotoFactura") {
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
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file, "FotoFactura");
      if (error) {
        setErrors((prev) => ({ ...prev, FotoFactura: error }));
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, FotoFactura: file }));

      if (file.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      } else {
        setPreviewUrl("/path/to/pdf-icon.png");
      }

      if (errors.FotoFactura) {
        setErrors((prev) => ({ ...prev, FotoFactura: null }));
      }
    }
  };

  const handleRemoveFoto = () => {
    setFormData((prev) => ({ ...prev, FotoFactura: null }));
    setPreviewUrl(null);
    // Reset the file input
    const fileInput = document.getElementById("foto-factura");
    if (fileInput) fileInput.value = "";
  };

  const handleDocumentoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file, "DocumentoFactura");
      if (error) {
        setErrors((prev) => ({ ...prev, DocumentoFactura: error }));
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, DocumentoFactura: file }));
      const objectUrl = URL.createObjectURL(file);
      setDocumentPreviewUrl(objectUrl);

      if (errors.DocumentoFactura) {
        setErrors((prev) => ({ ...prev, DocumentoFactura: null }));
      }

      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleRemoveDocumento = () => {
    setFormData((prev) => ({ ...prev, DocumentoFactura: null }));
    setDocumentPreviewUrl(null);
    // Reset the file input
    const fileInput = document.getElementById("documento-factura");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.FechaEmision) {
      newErrors.FechaEmision = "La fecha de emisión es requerida";
    }

    if (!formData.NumeroFactura) {
      newErrors.NumeroFactura = "El número de factura es requerido";
    }

    if (!formData.Proveedor) {
      newErrors.Proveedor = "Debe seleccionar un proveedor";
    }

    return newErrors;
  };

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

      // Asegurarnos de que se está enviando el NumeroFactura
      console.log("Valor de NumeroFactura:", formData.NumeroFactura); // Debug

      formDataToSend.append("NumeroFactura", formData.NumeroFactura);
      formDataToSend.append("FechaEmision", formData.FechaEmision);
      formDataToSend.append("Proveedor", formData.Proveedor);

      if (formData.FotoFactura) {
        formDataToSend.append("FotoFactura", formData.FotoFactura);
      }

      if (formData.DocumentoFactura) {
        formDataToSend.append("DocumentoFactura", formData.DocumentoFactura);
      }

      // Debug para ver todo lo que se está enviando
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": " + pair[1]);
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
    documentPreviewUrl,
    proveedores,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleDocumentoChange,
    handleRemoveFoto,
    handleRemoveDocumento,
  };
};
