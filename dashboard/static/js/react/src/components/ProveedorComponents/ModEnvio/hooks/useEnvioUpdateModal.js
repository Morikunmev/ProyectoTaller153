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
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [removedFiles, setRemovedFiles] = useState({
    foto: false,
  });

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

  // Efecto para cargar los datos del envío cuando se abre el modal
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

  // Manejador de cambios en los inputs
  const handleInputChange = useCallback(
    (e) => {
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
    },
    [errors]
  );

  // Función de validación de archivos
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

  // Manejador de cambios en la foto
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

        if (errors.FotoEnvio) {
          setErrors((prev) => ({ ...prev, FotoEnvio: null }));
        }

        setFormData((prev) => ({ ...prev, FotoEnvio: file }));
        setRemovedFiles((prev) => ({ ...prev, foto: false }));

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [errors, validateFile]
  );

  // Manejador para eliminar la foto
  const handleRemoveFoto = useCallback(() => {
    setFormData((prev) => ({ ...prev, FotoEnvio: null }));
    setPreviewUrl("");
    setRemovedFiles((prev) => ({ ...prev, foto: true }));
    const fileInput = document.getElementById("foto-envio");
    if (fileInput) fileInput.value = "";
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
            newErrors.FechaCompraEnvio =
              "La fecha de compra no puede ser futura";
          }
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          throw new Error("Por favor complete todos los campos requeridos");
        }

        const submitData = new FormData();
        submitData.append("NombreEnvio", formData.NombreEnvio);
        submitData.append("TipoEnvio", formData.TipoEnvio);
        submitData.append("CantidadEnvio", formData.CantidadEnvio);
        submitData.append("PrecioEnvio", formData.PrecioEnvio);
        submitData.append("TotalEnvio", formData.TotalEnvio);
        submitData.append("Proveedor", formData.Proveedor);
        submitData.append("EnvioRecibido", formData.EnvioRecibido);
        submitData.append("DiasTranscurridos", formData.DiasTranscurridos);

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

        const response = await fetch(`/api/envio/${envio.id}/actualizar/`, {
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
          throw new Error(data.message || "Error al actualizar el envío");
        }

        handleClose();

        if (onEnvioUpdated) {
          await onEnvioUpdated(data.envio);
        }
      } catch (error) {
        console.error("Error al actualizar el envío:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error al actualizar el envío",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, envio, handleClose, onEnvioUpdated, removedFiles]
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
    handleFotoChange,
    handleRemoveFoto,
  };
};

export default useEnvioUpdateModal;
