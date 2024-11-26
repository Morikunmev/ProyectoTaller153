import { useState, useEffect, useCallback } from "react";

export const useEnvioUpdateModal = ({
  isOpen,
  onClose,
  envio,
  onEnvioUpdated,
}) => {
  // Estados del formulario y modal
  const [formData, setFormData] = useState({
    NombreEnvio: "",
    TipoEnvio: "",
    CantidadEnvio: "",
    PrecioEnvio: "",
    TotalEnvio: "0",
    FechaCompraEnvio: "",
    EnvioRecibido: false,
    DiasTranscurridos: 0,
    DescripcionEnvio: "",
    Proveedor: "",
    FotoEnvio: null,
    Factura: "",
  });

  // UI States
  const [facturas, setFacturas] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [removedFiles, setRemovedFiles] = useState({
    foto: false,
  });
  const [searchFactura, setSearchFactura] = useState("");

  // Función para manejar las clases del borde de los inputs
  const getInputBorderClass = useCallback((value) => {
    if (value && value.toString().trim() !== "") {
      return "border-green-400";
    }
    return "border-gray-300";
  }, []);

  // Efecto para animaciones de apertura/cierre
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 150);
    }
  }, [isOpen]);

  // Efecto para calcular los días transcurridos
  useEffect(() => {
    if (formData.FechaCompraEnvio && !formData.EnvioRecibido) {
      const fechaCompra = new Date(formData.FechaCompraEnvio);
      const hoy = new Date();
      const diferencia = Math.floor(
        (hoy - fechaCompra) / (1000 * 60 * 60 * 24)
      );
      setFormData((prev) => ({
        ...prev,
        DiasTranscurridos: diferencia,
      }));
    }
  }, [formData.FechaCompraEnvio, formData.EnvioRecibido]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar proveedores
        const provResponse = await fetch("/api/proveedor/listar/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!provResponse.ok) {
          throw new Error("Error al cargar los proveedores");
        }

        const provData = await provResponse.json();
        if (provData.success) {
          setProveedores(provData.proveedores);
        }

        // Cargar facturas
        const factResponse = await fetch("/api/factura/listar/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!factResponse.ok) {
          throw new Error("Error al cargar las facturas");
        }

        const factData = await factResponse.json();
        if (factData.success) {
          setFacturas(factData.facturas);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setErrors((prev) => ({
          ...prev,
          general: "Error al cargar los datos necesarios",
        }));
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Efecto para cargar los datos del envío
  useEffect(() => {
    if (envio && isOpen) {
      setFormData({
        NombreEnvio: envio.NombreEnvio || "",
        TipoEnvio: envio.TipoEnvio || "",
        CantidadEnvio: envio.CantidadEnvio || "",
        PrecioEnvio: envio.PrecioEnvio || "",
        TotalEnvio: envio.TotalEnvio || "0",
        FechaCompraEnvio: envio.FechaCompraEnvio || "",
        EnvioRecibido: envio.EnvioRecibido || false,
        DiasTranscurridos: envio.DiasTranscurridos || 0,
        DescripcionEnvio: envio.DescripcionEnvio || "",
        Proveedor: envio.Proveedor?.id || "",
        Factura: envio.Factura?.id || "",
        FotoEnvio: null,
      });
      setPreviewUrl(envio.FotoEnvio || "");
      setRemovedFiles({ foto: false });
    }
  }, [envio, isOpen]);

  // Efecto para calcular el total
  useEffect(() => {
    if (formData.CantidadEnvio && formData.PrecioEnvio) {
      const total = formData.CantidadEnvio * formData.PrecioEnvio;
      setFormData((prev) => ({
        ...prev,
        TotalEnvio: total.toString(),
      }));
    }
  }, [formData.CantidadEnvio, formData.PrecioEnvio]);

  // Manejador de cambios en inputs
  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === "checkbox" ? checked : value;

      // Manejo especial para cuando se selecciona una factura
      if (name === "Factura") {
        if (value) {
          // Buscar la factura seleccionada
          const facturaSeleccionada = facturas.find(
            (factura) => factura.id.toString() === value
          );
          if (facturaSeleccionada) {
            // Actualizar tanto la factura como el proveedor
            setFormData((prev) => ({
              ...prev,
              [name]: value,
              Proveedor: facturaSeleccionada.Proveedor.id.toString(),
            }));
            return;
          }
        } else {
          // Si no hay factura seleccionada, limpiar también el proveedor
          setFormData((prev) => ({
            ...prev,
            [name]: "",
            Proveedor: "",
          }));
          return;
        }
      }

      // Para otros campos, actualización normal
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      // Limpiar errores si existían
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
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      return "El archivo es demasiado grande. El tamaño máximo permitido es 10MB";
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
        setRemovedFiles((prev) => ({ ...prev, foto: false }));
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
    setPreviewUrl("");
    setRemovedFiles((prev) => ({ ...prev, foto: true }));
    const fileInput = document.getElementById("foto-envio");
    if (fileInput) fileInput.value = "";
  }, []);

  // Manejador de cierre
  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setErrors({});
      onClose();
    }, 150);
  }, [onClose]);

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
      if (e) e.preventDefault();

      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        const submitData = new FormData();
        submitData.append("NombreEnvio", formData.NombreEnvio);
        submitData.append("TipoEnvio", formData.TipoEnvio);
        submitData.append("CantidadEnvio", formData.CantidadEnvio);
        submitData.append("PrecioEnvio", formData.PrecioEnvio);
        submitData.append("TotalEnvio", formData.TotalEnvio);
        submitData.append("Proveedor", formData.Proveedor);
        submitData.append("EnvioRecibido", formData.EnvioRecibido);
        submitData.append("DiasTranscurridos", formData.DiasTranscurridos);
        submitData.append("Factura", formData.Factura || "");

        if (formData.FechaCompraEnvio) {
          submitData.append("FechaCompraEnvio", formData.FechaCompraEnvio);
        }
        if (formData.DescripcionEnvio) {
          submitData.append("DescripcionEnvio", formData.DescripcionEnvio);
        }

        submitData.append(
          "eliminar_FotoEnvio",
          removedFiles.foto ? "true" : "false"
        );

        if (formData.FotoEnvio instanceof File) {
          submitData.append("FotoEnvio", formData.FotoEnvio);
        }

        const csrfToken = document.querySelector(
          "[name=csrfmiddlewaretoken]"
        )?.value;

        const response = await fetch(`/api/envio/${envio.id}/actualizar/`, {
          method: "POST",
          headers: {
            "X-CSRFToken": csrfToken,
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
          throw new Error(data.message || "Error al actualizar el envío");
        }

        handleClose();
        if (onEnvioUpdated) {
          await onEnvioUpdated(data.envio);
        }
      } catch (error) {
        console.error("Error al actualizar envío:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error al actualizar el envío",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, handleClose, onEnvioUpdated, envio, removedFiles]
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
    searchFactura,
    setSearchFactura,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
    getInputBorderClass,
  };
};

export default useEnvioUpdateModal;
