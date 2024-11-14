import { useState, useEffect } from "react";

export const useEnvioCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const today = new Date().toISOString().split("T")[0];

  // Form Data State
  const [formData, setFormData] = useState({
    NombreEnvio: "",
    TipoEnvio: "",
    CantidadEnvio: "",
    PrecioEnvio: "",
    TotalEnvio: "0",
    FechaCompraEnvio: today,
    EnvioRecibido: false,
    DescripcionEnvio: "",
    Proveedor: "",
    FotoEnvio: null,
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  // Efecto para cargar la lista de proveedores y resetear el formulario
  useEffect(() => {
    if (isOpen) {
      fetchProveedores();
      setFormData({
        NombreEnvio: "",
        TipoEnvio: "",
        CantidadEnvio: "",
        PrecioEnvio: "",
        TotalEnvio: "0",
        FechaCompraEnvio: today,
        EnvioRecibido: false,
        DescripcionEnvio: "",
        Proveedor: "",
        FotoEnvio: null,
      });
      setPreviewUrl(null);
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

  // Calculador de total
  useEffect(() => {
    if (formData.CantidadEnvio && formData.PrecioEnvio) {
      const total = formData.CantidadEnvio * formData.PrecioEnvio;
      setFormData((prev) => ({
        ...prev,
        TotalEnvio: total.toString(),
      }));
    }
  }, [formData.CantidadEnvio, formData.PrecioEnvio]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setFormData({
        NombreEnvio: "",
        TipoEnvio: "",
        CantidadEnvio: "",
        PrecioEnvio: "",
        TotalEnvio: "0",
        FechaCompraEnvio: today,
        EnvioRecibido: false,
        DescripcionEnvio: "",
        Proveedor: "",
        FotoEnvio: null,
      });
      setPreviewUrl(null);
      setErrors({});
    }, 150);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes

    if (file.size > maxSize) {
      return `El archivo es demasiado grande. El tamaño máximo permitido es 10MB`;
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
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setErrors((prev) => ({ ...prev, FotoEnvio: error }));
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, FotoEnvio: file }));
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      if (errors.FotoEnvio) {
        setErrors((prev) => ({ ...prev, FotoEnvio: null }));
      }

      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleRemoveFoto = () => {
    setFormData((prev) => ({ ...prev, FotoEnvio: null }));
    setPreviewUrl(null);
    const fileInput = document.getElementById("foto-envio");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.NombreEnvio) {
      newErrors.NombreEnvio = "El nombre del envío es requerido";
    }

    if (!formData.TipoEnvio) {
      newErrors.TipoEnvio = "El tipo de envío es requerido";
    }

    if (!formData.CantidadEnvio || formData.CantidadEnvio <= 0) {
      newErrors.CantidadEnvio = "La cantidad debe ser mayor a 0";
    }

    if (!formData.PrecioEnvio || formData.PrecioEnvio <= 0) {
      newErrors.PrecioEnvio = "El precio debe ser mayor a 0";
    }

    if (!formData.Proveedor) {
      newErrors.Proveedor = "Debe seleccionar un proveedor";
    }

    if (formData.FechaCompraEnvio) {
      const fechaCompra = new Date(formData.FechaCompraEnvio);
      if (fechaCompra > new Date()) {
        newErrors.FechaCompraEnvio = "La fecha de compra no puede ser futura";
      }
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
      formDataToSend.append("NombreEnvio", formData.NombreEnvio);
      formDataToSend.append("TipoEnvio", formData.TipoEnvio);
      formDataToSend.append("CantidadEnvio", formData.CantidadEnvio);
      formDataToSend.append("PrecioEnvio", formData.PrecioEnvio);
      formDataToSend.append("TotalEnvio", formData.TotalEnvio);
      formDataToSend.append("Proveedor", formData.Proveedor);
      formDataToSend.append("EnvioRecibido", formData.EnvioRecibido);

      if (formData.FechaCompraEnvio) {
        formDataToSend.append("FechaCompraEnvio", formData.FechaCompraEnvio);
      }
      if (formData.DescripcionEnvio) {
        formDataToSend.append("DescripcionEnvio", formData.DescripcionEnvio);
      }
      if (formData.FotoEnvio) {
        formDataToSend.append("FotoEnvio", formData.FotoEnvio);
      }

      const response = await fetch("/api/envio/crear/", {
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
        throw new Error(data.message || "Error al crear el envío");
      }

      if (data.success) {
        onSubmit(data.envio);
        handleClose();
      }
    } catch (error) {
      console.error("Error al crear envío:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error al crear el envío",
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
    handleFotoChange,
    handleRemoveFoto,
  };
};
