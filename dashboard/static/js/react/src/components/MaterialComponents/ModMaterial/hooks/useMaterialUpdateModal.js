import { useState, useEffect, useCallback } from "react";

export const useMaterialUpdateModal = ({
  isOpen,
  onClose,
  material,
  onMaterialUpdated,
}) => {
  const [formData, setFormData] = useState({
    NombreMaterial: "",
    StockMaterial: "",
    StockOriginal: "",
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
    FechaCompraMaterial: "",
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

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provResponse, envioResponse] = await Promise.all([
          fetch("/api/proveedor/listar/"),
          fetch("/api/envio/listar/"),
        ]);

        const [provData, envioData] = await Promise.all([
          provResponse.json(),
          envioResponse.json(),
        ]);

        if (provData.success) setProveedores(provData.proveedores);
        if (envioData.success) setEnvios(envioData.envios);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setErrors((prev) => ({
          ...prev,
          general: "Error al cargar los datos necesarios",
        }));
      }
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (material && isOpen) {
      setFormData({
        NombreMaterial: material.NombreMaterial || "",
        StockMaterial: material.StockMaterial || "",
        StockOriginal: material.StockOriginal || "",
        PrecioMaterial: material.PrecioMaterial || "",
        TotalMaterial: material.TotalMaterial || "0",
        EstadoMaterial: material.EstadoMaterial || "",
        UbicacionMaterial: material.UbicacionMaterial || "",
        ColorMaterial: material.ColorMaterial || "",
        PesoMaterial: material.PesoMaterial || "",
        DimensionesMaterial: material.DimensionesMaterial || "",
        DetalleMaterial: material.DetalleMaterial || "",
        DescripcionMaterial: material.DescripcionMaterial || "",
        Proveedor: material.Proveedor?.id || "",
        Envio: material.Envio?.id || "",
        FechaCompraMaterial: material.FechaCompraMaterial || "",
        FotoMaterial: null,
      });
      setPreviewUrl(material.FotoMaterial || "");
      setRemovedFiles({ foto: false });
    }
  }, [material, isOpen]);

  useEffect(() => {
    if (formData.StockMaterial && formData.PrecioMaterial) {
      const total =
        parseFloat(formData.StockMaterial) *
        parseFloat(formData.PrecioMaterial);
      setFormData((prev) => ({
        ...prev,
        TotalMaterial: total.toString(),
      }));
    }
  }, [formData.StockMaterial, formData.PrecioMaterial]);

  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024;
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
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      if (name === "StockOriginal") {
        const nuevoStockOriginal = parseInt(value) || 0;
        const stockOriginalAnterior = parseInt(formData.StockOriginal) || 0;
        const stockActualAnterior = parseInt(formData.StockMaterial) || 0;

        // Calcular la cantidad usada del stock original
        const cantidadUsada = stockOriginalAnterior - stockActualAnterior;

        // El nuevo stock actual será el nuevo stock original menos la misma cantidad usada
        const nuevoStockActual = nuevoStockOriginal - cantidadUsada;

        console.log("Valores de cálculo:", {
          nuevoStockOriginal,
          stockOriginalAnterior,
          stockActualAnterior,
          cantidadUsada,
          nuevoStockActual,
        });

        setFormData((prev) => ({
          ...prev,
          [name]: value,
          StockMaterial: nuevoStockActual.toString(),
        }));

        console.log("Nuevo formData:", {
          StockOriginal: value,
          StockMaterial: nuevoStockActual.toString(),
        });

        if (errors[name]) {
          setErrors((prev) => ({ ...prev, [name]: null }));
        }
        return;
      }

      if (name === "Envio") {
        if (value) {
          const envioSeleccionado = envios.find(
            (envio) => envio.id.toString() === value
          );
          if (envioSeleccionado) {
            setFormData((prev) => ({
              ...prev,
              [name]: value,
              Proveedor: envioSeleccionado.Proveedor.id.toString(),
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
        [name]: value,
      }));

      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    },
    [errors, envios, formData]
  );

  const handleFotoChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const error = validateFile(file);
        if (error) {
          setErrors((prev) => ({ ...prev, FotoMaterial: error }));
          e.target.value = "";
          return;
        }

        if (errors.FotoMaterial) {
          setErrors((prev) => ({ ...prev, FotoMaterial: null }));
        }

        setFormData((prev) => ({ ...prev, FotoMaterial: file }));
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

  const handleRemoveFoto = useCallback(() => {
    setFormData((prev) => ({ ...prev, FotoMaterial: null }));
    setPreviewUrl("");
    setRemovedFiles((prev) => ({ ...prev, foto: true }));
    const fileInput = document.getElementById("foto-material");
    if (fileInput) fileInput.value = "";
  }, []);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setErrors({});
      onClose();
    }, 150);
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setIsSubmitting(true);

      try {
        const newErrors = {};

        if (!formData.NombreMaterial) {
          newErrors.NombreMaterial = "El nombre del material es requerido";
        }
        if (!formData.StockOriginal) {
          newErrors.StockOriginal = "El stock original es requerido";
        } else if (parseInt(formData.StockOriginal) < 0) {
          newErrors.StockOriginal = "El stock original no puede ser negativo";
        }
        if (
          !formData.PrecioMaterial ||
          parseFloat(formData.PrecioMaterial) <= 0
        ) {
          newErrors.PrecioMaterial = "El precio debe ser mayor a 0";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setIsSubmitting(false);
          return;
        }

        const submitData = new FormData();

        // Campos requeridos
        submitData.append("NombreMaterial", formData.NombreMaterial);
        submitData.append("StockOriginal", formData.StockOriginal);
        submitData.append("StockMaterial", formData.StockMaterial);
        submitData.append("PrecioMaterial", formData.PrecioMaterial);
        submitData.append("TotalMaterial", formData.TotalMaterial);

        // Campos opcionales
        if (formData.EstadoMaterial)
          submitData.append("EstadoMaterial", formData.EstadoMaterial);
        if (formData.UbicacionMaterial)
          submitData.append("UbicacionMaterial", formData.UbicacionMaterial);
        if (formData.ColorMaterial)
          submitData.append("ColorMaterial", formData.ColorMaterial);
        if (formData.PesoMaterial)
          submitData.append("PesoMaterial", formData.PesoMaterial);
        if (formData.DimensionesMaterial)
          submitData.append(
            "DimensionesMaterial",
            formData.DimensionesMaterial
          );
        if (formData.DetalleMaterial)
          submitData.append("DetalleMaterial", formData.DetalleMaterial);
        if (formData.DescripcionMaterial)
          submitData.append(
            "DescripcionMaterial",
            formData.DescripcionMaterial
          );
        if (formData.Proveedor)
          submitData.append("Proveedor", formData.Proveedor);
        if (formData.Envio) submitData.append("Envio", formData.Envio);

        submitData.append(
          "eliminar_FotoMaterial",
          removedFiles.foto ? "true" : "false"
        );

        if (formData.FotoMaterial instanceof File) {
          submitData.append("FotoMaterial", formData.FotoMaterial);
        }

        const response = await fetch(
          `/api/material/${material.id}/actualizar/`,
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
          throw new Error(data.message || "Error al actualizar el material");
        }

        handleClose();
        if (onMaterialUpdated) {
          await onMaterialUpdated(data.material);
        }
      } catch (error) {
        console.error("Error al actualizar el material:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error al actualizar el material",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, material, handleClose, onMaterialUpdated, removedFiles]
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

export default useMaterialUpdateModal;
