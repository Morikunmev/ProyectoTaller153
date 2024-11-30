import { useState, useEffect } from "react";

export const useMaterialCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const today = new Date().toISOString().split("T")[0];

  // Form Data State - Solo inicializamos los campos requeridos según el modelo
  const [formData, setFormData] = useState({
    NombreMaterial: "",
    StockMaterial: "",
    PrecioMaterial: "",
    TotalMaterial: "0",
    EstadoMaterial: "", // No requerido según modelo
    UbicacionMaterial: "", // No requerido según modelo
    ColorMaterial: "", // Opcional
    PesoMaterial: "", // Opcional
    DimensionesMaterial: "", // Opcional
    DetalleMaterial: "", // Opcional
    DescripcionMaterial: "", // Opcional
    Proveedor: "", // Opcional
    FotoMaterial: null, // Opcional
    Envio: "", // Opcional
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [envios, setEnvios] = useState([]);

  // Efecto para cargar la lista de proveedores y envíos, y resetear el formulario
  useEffect(() => {
    if (isOpen) {
      fetchProveedores();
      fetchEnvios();
      setFormData({
        NombreMaterial: "",
        StockMaterial: "",
        PrecioMaterial: "",
        TotalMaterial: "0",
        EstadoMaterial: "",
        UbicacionMaterial: "",
        ColorMaterial: "",
        PesoMaterial: "",
        DimensionesMaterial: "",
        DetalleMaterial: "",
        DescripcionMaterial: "",
        Proveedor: "",
        FotoMaterial: null,
        Envio: "",
      });
      setPreviewUrl(null);
      setErrors({});
    }
  }, [isOpen]);

  const fetchEnvios = async () => {
    try {
      const response = await fetch("/api/envio/listar/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar los envíos");
      }

      const data = await response.json();
      if (data.success) {
        setEnvios(data.envios || []);
      } else {
        throw new Error(data.message || "Error al cargar los envíos");
      }
    } catch (error) {
      console.error("Error al cargar envíos:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Error al cargar la lista de envíos",
      }));
    }
  };

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
    if (formData.StockMaterial && formData.PrecioMaterial) {
      const total = formData.StockMaterial * formData.PrecioMaterial;
      setFormData((prev) => ({
        ...prev,
        TotalMaterial: total.toString(),
      }));
    }
  }, [formData.StockMaterial, formData.PrecioMaterial]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setFormData({
        NombreMaterial: "",
        StockMaterial: "",
        PrecioMaterial: "",
        TotalMaterial: "0",
        EstadoMaterial: "",
        UbicacionMaterial: "",
        ColorMaterial: "",
        PesoMaterial: "",
        DimensionesMaterial: "",
        DetalleMaterial: "",
        DescripcionMaterial: "",
        Proveedor: "",
        FotoMaterial: null,
        Envio: "",
      });
      setPreviewUrl(null);
      setErrors({});
    }, 150);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Lógica especial para cuando se selecciona un envío
    if (name === "Envio") {
      if (value) {
        // Si se selecciona un envío, encuentra el envío en la lista
        const envioSeleccionado = envios.find(
          (envio) => envio.id.toString() === value
        );
        if (envioSeleccionado) {
          // Actualiza tanto el envío como el proveedor
          setFormData((prev) => ({
            ...prev,
            [name]: value,
            // Actualiza automáticamente el proveedor al del envío
            Proveedor: envioSeleccionado.Proveedor.id.toString(),
          }));
          return;
        }
      } else {
        // Si se deselecciona el envío, limpia también el proveedor
        setFormData((prev) => ({
          ...prev,
          [name]: "",
          Proveedor: "",
        }));
        return;
      }
    }

    // Para el resto de los campos, manejo normal
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        setErrors((prev) => ({ ...prev, FotoMaterial: error }));
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, FotoMaterial: file }));
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      if (errors.FotoMaterial) {
        setErrors((prev) => ({ ...prev, FotoMaterial: null }));
      }

      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleRemoveFoto = () => {
    setFormData((prev) => ({ ...prev, FotoMaterial: null }));
    setPreviewUrl(null);
    const fileInput = document.getElementById("foto-material");
    if (fileInput) fileInput.value = "";
  };
  const validateForm = () => {
    const newErrors = {};

    if (!formData.NombreMaterial) {
      newErrors.NombreMaterial = "El nombre del material es requerido";
    }

    if (!formData.StockMaterial || formData.StockMaterial < 0) {
      newErrors.StockMaterial = "El stock inicial no puede ser negativo";
    } else if (formData.StockMaterial > 9999) {
      newErrors.StockMaterial = "El stock inicial no puede ser mayor a 9999";
    } else if (!Number.isInteger(Number(formData.StockMaterial))) {
      newErrors.StockMaterial = "El stock inicial debe ser un número entero";
    }

    if (!formData.PrecioMaterial || formData.PrecioMaterial <= 0) {
      newErrors.PrecioMaterial = "El precio debe ser mayor a 0";
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
      // Campos requeridos
      formDataToSend.append("NombreMaterial", formData.NombreMaterial);
      formDataToSend.append("StockMaterial", formData.StockMaterial);
      formDataToSend.append("PrecioMaterial", formData.PrecioMaterial);
      formDataToSend.append("TotalMaterial", formData.TotalMaterial);

      // Campos no requeridos
      formDataToSend.append("EstadoMaterial", formData.EstadoMaterial);
      formDataToSend.append("UbicacionMaterial", formData.UbicacionMaterial);

      // Campos opcionales
      if (formData.ColorMaterial) {
        formDataToSend.append("ColorMaterial", formData.ColorMaterial);
      }
      if (formData.PesoMaterial) {
        formDataToSend.append("PesoMaterial", formData.PesoMaterial);
      }
      if (formData.DimensionesMaterial) {
        formDataToSend.append(
          "DimensionesMaterial",
          formData.DimensionesMaterial
        );
      }
      if (formData.DetalleMaterial) {
        formDataToSend.append("DetalleMaterial", formData.DetalleMaterial);
      }
      if (formData.DescripcionMaterial) {
        formDataToSend.append(
          "DescripcionMaterial",
          formData.DescripcionMaterial
        );
      }
      if (formData.Proveedor) {
        formDataToSend.append("Proveedor", formData.Proveedor);
      }
      if (formData.Envio) {
        formDataToSend.append("Envio", formData.Envio);
      }
      if (formData.FotoMaterial) {
        formDataToSend.append("FotoMaterial", formData.FotoMaterial);
      }

      const csrfToken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      )?.value;

      const response = await fetch("/api/material/crear/", {
        method: "POST",
        body: formDataToSend,
        headers: {
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
          throw new Error(Object.values(data.errors)[0]);
        }
        throw new Error(data.message || "Error al crear el material");
      }

      if (data.success) {
        onSubmit(data.material);
        handleClose();
      }
    } catch (error) {
      console.error("Error al crear material:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error al crear el material",
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
    envios,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
  };
};
