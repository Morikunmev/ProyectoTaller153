import { useState, useEffect, useCallback } from "react";

export const useProductoUpdateModal = ({
  isOpen,
  onClose,
  producto,
  onProductoUpdated,
}) => {
  const [formData, setFormData] = useState({
    NombreProducto: "",
    StockProductoInicial: "",
    PrecioUnitarioProducto: "",
    Categoria: "",
    DescripcionProducto: "",
    UbicacionProducto: "",
    EstadoProducto: "",
    FotoProducto: null,
    DiasProducto: "",
    FechaProducto: "",
    ProductoAgotado: false,
    CantidadProductoVendido: 0, // Agregamos esto
    CantidadProductoDesechado: 0, // Agregamos esto
  });

  // Nuevo estado para mantener un seguimiento del stock actual
  const [stockActual, setStockActual] = useState(0);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [removedFiles, setRemovedFiles] = useState({
    foto: false,
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
      fetchCategorias();
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 150);
    }
  }, [isOpen]);

  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/categorias/listar/");
      const data = await response.json();
      if (data.success) {
        setCategorias(data.categorias);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setErrors((prev) => ({ ...prev, general: "Error al cargar categorías" }));
    }
  };
  useEffect(() => {
    if (producto && isOpen) {
      setFormData({
        NombreProducto: producto.NombreProducto || "",
        StockProductoInicial: producto.StockProductoInicial || "",
        PrecioUnitarioProducto: producto.PrecioUnitarioProducto || "",
        Categoria: producto.Categoria?.id || "",
        DescripcionProducto: producto.DescripcionProducto || "",
        UbicacionProducto: producto.UbicacionProducto || "",
        EstadoProducto: producto.EstadoProducto || "",
        FotoProducto: null,
        DiasProducto: producto.DiasProducto || "",
        FechaProducto: producto.FechaProducto
          ? producto.FechaProducto.split("T")[0]
          : "",
        ProductoAgotado: producto.ProductoAgotado || false,
        CantidadProductoVendido: producto.CantidadProductoVendido || 0, // Agregamos esto
        CantidadProductoDesechado: producto.CantidadProductoDesechado || 0, // Agregamos esto
      });
      setStockActual(producto.StockProductoActual || 0);
      setPreviewUrl(producto.FotoProducto || "");
      setRemovedFiles({ foto: false });
    }
  }, [producto, isOpen]);
  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize)
      return "El archivo es demasiado grande. Máximo 10MB";

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "image/tiff",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return "Formato no válido. Use: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG";
    }
    return null;
  }, []);
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      if (name === "StockProductoInicial") {
        const newStockInicial = parseInt(value) || 0;
        let nuevoStockActual = newStockInicial;

        if (producto) {
          const cantidadNoDisponible =
            (producto.CantidadProductoVendido || 0) +
            (producto.CantidadProductoDesechado || 0);

          nuevoStockActual = Math.max(
            0,
            newStockInicial - cantidadNoDisponible
          );
        }

        setStockActual(nuevoStockActual);
      }

      if (name === "ProductoAgotado") {
        const isChecked = value === true;
        if (isChecked) {
          setFormData((prev) => ({
            ...prev,
            [name]: isChecked,
            CantidadProductoVendido: 0,
            CantidadProductoDesechado: 0,
          }));
          setErrors((prev) => ({
            ...prev,
            CantidadProductoVendido: `Debe distribuir el stock actual (${stockActual})`,
            CantidadProductoDesechado: `Debe distribuir el stock actual (${stockActual})`,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: isChecked,
            CantidadProductoVendido: 0,
            CantidadProductoDesechado: 0,
          }));
          setErrors((prev) => ({
            ...prev,
            CantidadProductoVendido: null,
            CantidadProductoDesechado: null,
          }));
        }
        return;
      }

      if (
        name === "CantidadProductoVendido" ||
        name === "CantidadProductoDesechado"
      ) {
        // Actualizar primero el formData con el valor exacto
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Solo validar si hay un valor numérico
        if (value !== "") {
          const cantidad = parseInt(value) || 0;
          const otraCantidad =
            name === "CantidadProductoVendido"
              ? parseInt(formData.CantidadProductoDesechado) || 0
              : parseInt(formData.CantidadProductoVendido) || 0;

          if (formData.ProductoAgotado) {
            // Validar que la suma sea igual al stock actual
            if (cantidad + otraCantidad === stockActual) {
              setErrors((prev) => ({
                ...prev,
                CantidadProductoVendido: null,
                CantidadProductoDesechado: null,
              }));
            } else {
              const errorMsg = `La suma debe ser igual al stock actual (${stockActual})`;
              setErrors((prev) => ({
                ...prev,
                CantidadProductoVendido: errorMsg,
                CantidadProductoDesechado: errorMsg,
              }));
            }
          }
        }
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors, producto, stockActual, formData]
  );

  const handleFotoChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        setErrors((prev) => ({ ...prev, FotoProducto: error }));
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, FotoProducto: file }));
      setRemovedFiles((prev) => ({ ...prev, foto: false }));
      setPreviewUrl(URL.createObjectURL(file));
    },
    [validateFile]
  );

  const handleRemoveFoto = useCallback(() => {
    setFormData((prev) => ({ ...prev, FotoProducto: null }));
    setPreviewUrl("");
    setRemovedFiles((prev) => ({ ...prev, foto: true }));
  }, []);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setErrors({});
      onClose();
    }, 150);
  }, [onClose]);
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.NombreProducto) {
      newErrors.NombreProducto = "El nombre del producto es requerido";
    }

    if (
      !formData.StockProductoInicial ||
      parseInt(formData.StockProductoInicial) < 0
    ) {
      newErrors.StockProductoInicial = "El stock inicial no puede ser negativo";
    }

    if (
      !formData.PrecioUnitarioProducto ||
      parseFloat(formData.PrecioUnitarioProducto) <= 0
    ) {
      newErrors.PrecioUnitarioProducto =
        "El precio unitario debe ser mayor a 0";
    }

    // Validar que si está marcado como agotado, las cantidades sumen el stock actual
    if (formData.ProductoAgotado && stockActual > 0) {
      const totalCantidades =
        (parseInt(formData.CantidadProductoVendido) || 0) +
        (parseInt(formData.CantidadProductoDesechado) || 0);

      if (totalCantidades !== stockActual) {
        newErrors.CantidadProductoVendido = `Debe distribuir todo el stock actual (${stockActual})`;
        newErrors.CantidadProductoDesechado = `Debe distribuir todo el stock actual (${stockActual})`;
      }
    }

    return newErrors;
  }, [formData, stockActual]);
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      console.log("Starting submission with data:", formData);

      try {
        const submitData = new FormData();
        Object.keys(formData).forEach((key) => {
          if (formData[key] !== null) {
            submitData.append(key, formData[key]);
            console.log(`Appending ${key}:`, formData[key]);
          }
        });
        submitData.append(
          "eliminar_FotoProducto",
          removedFiles.foto.toString()
        );

        const csrfToken = document.querySelector(
          "[name=csrfmiddlewaretoken]"
        ).value;

        const response = await fetch(
          `/api/producto/${producto.id}/actualizar/`,
          {
            method: "POST",
            headers: {
              "X-CSRFToken": csrfToken,
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
          throw new Error(data.message || "Error al actualizar");
        }

        handleClose();
        if (onProductoUpdated) {
          await onProductoUpdated(data.producto);
        }
      } catch (error) {
        console.error("Submission error:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error al actualizar el producto",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      producto,
      handleClose,
      onProductoUpdated,
      removedFiles,
      validateForm,
    ]
  );

  return {
    formData,
    stockActual, // Nuevo valor retornado
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    categorias,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
  };
};
