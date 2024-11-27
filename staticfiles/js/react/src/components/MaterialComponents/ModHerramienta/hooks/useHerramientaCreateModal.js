import { useState, useEffect } from "react";

export const useHerramientaCreateModal = ({ isOpen, onClose, onSubmit }) => {
  // Form Data State - Solo inicializamos los campos requeridos según el modelo
  const [formData, setFormData] = useState({
    NombreHerramienta: "",
    StockHerramienta: "",
    PrecioHerramienta: "",
    TotalHerramienta: "0",
    MarcaHerramienta: "",
    ModeloHerramienta: "",
    UbicacionHerramienta: "",
    DescripcionHerramienta: "",
    Proveedor: "",
    FotoHerramienta: null,
    Envio: ""
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
        NombreHerramienta: "",
        StockHerramienta: "",
        PrecioHerramienta: "",
        TotalHerramienta: "0",
        MarcaHerramienta: "",
        ModeloHerramienta: "",
        UbicacionHerramienta: "",
        DescripcionHerramienta: "",
        Proveedor: "",
        FotoHerramienta: null,
        Envio: ""
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
    if (formData.StockHerramienta && formData.PrecioHerramienta) {
      const total = formData.StockHerramienta * formData.PrecioHerramienta;
      setFormData((prev) => ({
        ...prev,
        TotalHerramienta: total.toString(),
      }));
    }
  }, [formData.StockHerramienta, formData.PrecioHerramienta]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setFormData({
        NombreHerramienta: "",
        StockHerramienta: "",
        PrecioHerramienta: "",
        TotalHerramienta: "0",
        MarcaHerramienta: "",
        ModeloHerramienta: "",
        UbicacionHerramienta: "",
        DescripcionHerramienta: "",
        Proveedor: "",
        FotoHerramienta: null,
        Envio: ""
      });
      setPreviewUrl(null);
      setErrors({});
    }, 150);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "Envio") {
      if (value) {
        const selectedEnvio = envios.find(
          (envio) => envio.id.toString() === value
        );
        if (selectedEnvio) {
          setFormData((prev) => ({
            ...prev,
            [name]: value,
            Proveedor: selectedEnvio.Proveedor.id.toString(),
          }));
          return;
        }
      }
    }

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
        setErrors((prev) => ({ ...prev, FotoHerramienta: error }));
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, FotoHerramienta: file }));
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      if (errors.FotoHerramienta) {
        setErrors((prev) => ({ ...prev, FotoHerramienta: null }));
      }

      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleRemoveFoto = () => {
    setFormData((prev) => ({ ...prev, FotoHerramienta: null }));
    setPreviewUrl(null);
    const fileInput = document.getElementById("foto-herramienta");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.NombreHerramienta) {
      newErrors.NombreHerramienta = "El nombre de la herramienta es requerido";
    }

    if (!formData.StockHerramienta || formData.StockHerramienta < 0) {
      newErrors.StockHerramienta = "El stock no puede ser negativo";
    }

    if (!formData.PrecioHerramienta || formData.PrecioHerramienta <= 0) {
      newErrors.PrecioHerramienta = "El precio debe ser mayor a 0";
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
      formDataToSend.append("NombreHerramienta", formData.NombreHerramienta);
      formDataToSend.append("StockHerramienta", formData.StockHerramienta);
      formDataToSend.append("PrecioHerramienta", formData.PrecioHerramienta);
      formDataToSend.append("TotalHerramienta", formData.TotalHerramienta);

      // Campos opcionales
      if (formData.MarcaHerramienta) {
        formDataToSend.append("MarcaHerramienta", formData.MarcaHerramienta);
      }
      if (formData.ModeloHerramienta) {
        formDataToSend.append("ModeloHerramienta", formData.ModeloHerramienta);
      }
      if (formData.UbicacionHerramienta) {
        formDataToSend.append("UbicacionHerramienta", formData.UbicacionHerramienta);
      }
      if (formData.DescripcionHerramienta) {
        formDataToSend.append("DescripcionHerramienta", formData.DescripcionHerramienta);
      }
      if (formData.Proveedor) {
        formDataToSend.append("Proveedor", formData.Proveedor);
      }
      if (formData.Envio) {
        formDataToSend.append("Envio", formData.Envio);
      }
      if (formData.FotoHerramienta) {
        formDataToSend.append("FotoHerramienta", formData.FotoHerramienta);
      }

      const csrfToken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      )?.value;

      const response = await fetch("/api/herramientas/crear/", {
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
        throw new Error(data.message || "Error al crear la herramienta");
      }

      if (data.success) {
        onSubmit(data.herramienta);
        handleClose();
      }
    } catch (error) {
      console.error("Error al crear herramienta:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error al crear la herramienta",
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