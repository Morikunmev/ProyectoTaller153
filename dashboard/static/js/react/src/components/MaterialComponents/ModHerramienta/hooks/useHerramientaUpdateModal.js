import { useState, useEffect, useCallback } from "react";

export const useHerramientaUpdateModal = ({
  isOpen,
  onClose,
  herramienta,
  onHerramientaUpdated,
}) => {
  // Estados del formulario y modal
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
    Envio: "",
    FechaCompraHerramienta: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [envios, setEnvios] = useState([]);
  const [removedFiles, setRemovedFiles] = useState({
    foto: false,
  });
  const [searchEnvio, setSearchEnvio] = useState("");

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

  // Efecto para cargar proveedores y envíos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar proveedores
        const provResponse = await fetch("/api/proveedor/listar/");
        const provData = await provResponse.json();
        if (provData.success) {
          setProveedores(provData.proveedores);
        }

        // Cargar envíos
        const envioResponse = await fetch("/api/envio/listar/");
        const envioData = await envioResponse.json();
        if (envioData.success) {
          setEnvios(envioData.envios);
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

  // Efecto para cargar los datos de la herramienta cuando se abre el modal
  useEffect(() => {
    if (herramienta && isOpen) {
      setFormData({
        NombreHerramienta: herramienta.NombreHerramienta || "",
        StockHerramienta: herramienta.StockHerramienta || "",
        PrecioHerramienta: herramienta.PrecioHerramienta || "",
        TotalHerramienta: herramienta.TotalHerramienta || "0",
        MarcaHerramienta: herramienta.MarcaHerramienta || "",
        ModeloHerramienta: herramienta.ModeloHerramienta || "",
        UbicacionHerramienta: herramienta.UbicacionHerramienta || "",
        DescripcionHerramienta: herramienta.DescripcionHerramienta || "",
        Proveedor: herramienta.Proveedor?.id || "",
        Envio: herramienta.Envio?.id || "",
        FechaCompraHerramienta: herramienta.FechaCompraHerramienta || "",
        FotoHerramienta: null,
      });
      setPreviewUrl(herramienta.FotoHerramienta || "");
      setRemovedFiles({ foto: false });
    }
  }, [herramienta, isOpen]);

  // Efecto para calcular el total
  useEffect(() => {
    if (formData.StockHerramienta && formData.PrecioHerramienta) {
      const total = formData.StockHerramienta * formData.PrecioHerramienta;
      setFormData((prev) => ({
        ...prev,
        TotalHerramienta: total.toString(),
      }));
    }
  }, [formData.StockHerramienta, formData.PrecioHerramienta]);

  // Manejador de cambios en los inputs
  const handleInputChange = useCallback(
    (e) => {
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

      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    },
    [errors, envios]
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
          setErrors((prev) => ({ ...prev, FotoHerramienta: error }));
          e.target.value = "";
          return;
        }

        if (errors.FotoHerramienta) {
          setErrors((prev) => ({ ...prev, FotoHerramienta: null }));
        }

        setFormData((prev) => ({ ...prev, FotoHerramienta: file }));
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
    setFormData((prev) => ({ ...prev, FotoHerramienta: null }));
    setPreviewUrl("");
    setRemovedFiles((prev) => ({ ...prev, foto: true }));
    const fileInput = document.getElementById("foto-herramienta");
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
        // Solo validamos los campos requeridos según el modelo
        if (!formData.NombreHerramienta) {
          newErrors.NombreHerramienta =
            "El nombre de la herramienta es requerido";
        }
        if (!formData.StockHerramienta && formData.StockHerramienta !== 0) {
          newErrors.StockHerramienta = "El stock es requerido";
        } else if (formData.StockHerramienta < 0) {
          newErrors.StockHerramienta = "El stock no puede ser negativo";
        }
        if (!formData.PrecioHerramienta || formData.PrecioHerramienta <= 0) {
          newErrors.PrecioHerramienta = "El precio debe ser mayor a 0";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setIsSubmitting(false);
          return;
        }

        const submitData = new FormData();

        // Campos requeridos
        submitData.append("NombreHerramienta", formData.NombreHerramienta);
        submitData.append("StockHerramienta", formData.StockHerramienta);
        submitData.append("PrecioHerramienta", formData.PrecioHerramienta);
        submitData.append("TotalHerramienta", formData.TotalHerramienta);

        // Campos opcionales
        if (formData.MarcaHerramienta) {
          submitData.append("MarcaHerramienta", formData.MarcaHerramienta);
        }
        if (formData.ModeloHerramienta) {
          submitData.append("ModeloHerramienta", formData.ModeloHerramienta);
        }
        if (formData.UbicacionHerramienta) {
          submitData.append(
            "UbicacionHerramienta",
            formData.UbicacionHerramienta
          );
        }
        if (formData.DescripcionHerramienta) {
          submitData.append(
            "DescripcionHerramienta",
            formData.DescripcionHerramienta
          );
        }
        if (formData.Proveedor) {
          submitData.append("Proveedor", formData.Proveedor);
        }
        if (formData.Envio) {
          submitData.append("Envio", formData.Envio);
        }

        submitData.append(
          "eliminar_FotoHerramienta",
          removedFiles.foto ? "true" : "false"
        );

        if (formData.FotoHerramienta instanceof File) {
          submitData.append("FotoHerramienta", formData.FotoHerramienta);
        }

        const response = await fetch(
          `/api/herramientas/${herramienta.id}/actualizar/`,
          {
            method: "POST",
            headers: {
              "X-CSRFToken": document.querySelector(
                "[name=csrfmiddlewaretoken]"
              ).value,
            },
            body: submitData,
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (data.errors) {
            setErrors(data.errors);
            throw new Error(Object.values(data.errors)[0]);
          }
          throw new Error(data.message || "Error al actualizar la herramienta");
        }

        handleClose();

        if (onHerramientaUpdated) {
          await onHerramientaUpdated(data.herramienta);
        }
      } catch (error) {
        console.error("Error al actualizar la herramienta:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error al actualizar la herramienta",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, herramienta, handleClose, onHerramientaUpdated, removedFiles]
  );

  return {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    proveedores,
    envios,
    searchEnvio,
    setSearchEnvio,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
  };
};

export default useHerramientaUpdateModal;
