import { useState, useEffect, useCallback } from "react";

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
    Factura: "",
    HoraCreacion: new Date().toISOString(),
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [facturas, setFacturas] = useState([]);

  // Función para cargar proveedores
  const fetchProveedores = useCallback(async () => {
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
  }, []);

  // Función para cargar facturas
  const fetchFacturas = useCallback(async () => {
    try {
      const response = await fetch("/api/factura/listar/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar las facturas");
      }

      const data = await response.json();
      if (data.success) {
        setFacturas(data.facturas || []);
      } else {
        throw new Error(data.message || "Error al cargar las facturas");
      }
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Error al cargar la lista de facturas",
      }));
    }
  }, []);

  // Efecto para animaciones
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      fetchProveedores();
      fetchFacturas();
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
        Factura: "",
        HoraCreacion: new Date().toISOString(),
      });
      setPreviewUrl(null);
      setErrors({});
    }
  }, [isOpen, today, fetchProveedores, fetchFacturas]);

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

  // Manejador de cierre
  const handleClose = useCallback(() => {
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
        Factura: "",
        HoraCreacion: new Date().toISOString(),
      });
      setPreviewUrl(null);
      setErrors({});
    }, 300);
  }, [onClose, today]);

  // Manejador de cambios en inputs
  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === "checkbox" ? checked : value;

      if (name === "Factura") {
        if (value) {
          const facturaSeleccionada = facturas.find(
            (factura) => factura.id.toString() === value
          );
          if (facturaSeleccionada) {
            setFormData((prev) => ({
              ...prev,
              [name]: newValue,
              Proveedor: facturaSeleccionada.Proveedor.id.toString(),
            }));
            return;
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: "",
            Proveedor: "",
          }));
          return;
        }
      }

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
    },
    [errors, facturas]
  );

  // Validación de archivos
  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024;

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
  }, []);

  // Manejador de cambio de foto
  const handleFotoChange = useCallback(
    (e) => {
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
    },
    [errors, validateFile]
  );

  // Manejador para remover foto
  const handleRemoveFoto = useCallback(() => {
    setFormData((prev) => ({ ...prev, FotoEnvio: null }));
    setPreviewUrl(null);
    const fileInput = document.getElementById("foto-envio");
    if (fileInput) fileInput.value = "";
  }, []);

  // Validación del formulario
  const validateForm = useCallback(() => {
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
  }, [formData]);

  // Manejador de envío del formulario
  const handleSubmit = useCallback(
    async (e) => {
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
        formDataToSend.append("HoraCreacion", formData.HoraCreacion);

        if (formData.Factura) {
          formDataToSend.append("Factura", formData.Factura);
        }
        if (formData.FechaCompraEnvio) {
          formDataToSend.append("FechaCompraEnvio", formData.FechaCompraEnvio);
        }
        if (formData.DescripcionEnvio) {
          formDataToSend.append("DescripcionEnvio", formData.DescripcionEnvio);
        }
        if (formData.FotoEnvio) {
          formDataToSend.append("FotoEnvio", formData.FotoEnvio);
        }

        const csrfToken = document.querySelector(
          "[name=csrfmiddlewaretoken]"
        )?.value;

        const response = await fetch("/api/envio/crear/", {
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
    },
    [formData, validateForm, handleClose, onSubmit]
  );

  return {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    proveedores,
    facturas,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
  };
};

export default useEnvioCreateModal;
