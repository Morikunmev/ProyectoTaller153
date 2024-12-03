import { useState, useEffect, useCallback } from "react";

export const useCategoriaUpdateModal = ({
  isOpen,
  onClose,
  categoria,
  onCategoriaUpdated,
}) => {
  // Estados del formulario y modal
  const [formData, setFormData] = useState({
    NombreCategoria: "",
    DescripcionCategoria: "",
    FotoCategoria: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
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

  // Efecto para cargar los datos de la categoría cuando se abre el modal
  useEffect(() => {
    if (categoria && isOpen) {
      setFormData({
        NombreCategoria: categoria.NombreCategoria || "",
        DescripcionCategoria: categoria.DescripcionCategoria || "",
        FotoCategoria: null,
      });
      setPreviewUrl(categoria.FotoCategoria || "");
      setRemovedFiles({ foto: false });
    }
  }, [categoria, isOpen]);

  // Manejador de cambios en los inputs
  const handleInputChange = useCallback(
    (e) => {
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
          setErrors((prev) => ({ ...prev, FotoCategoria: error }));
          e.target.value = "";
          return;
        }

        if (errors.FotoCategoria) {
          setErrors((prev) => ({ ...prev, FotoCategoria: null }));
        }

        setFormData((prev) => ({ ...prev, FotoCategoria: file }));
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
    setFormData((prev) => ({ ...prev, FotoCategoria: null }));
    setPreviewUrl("");
    setRemovedFiles((prev) => ({ ...prev, foto: true }));
    const fileInput = document.getElementById("foto-categoria");
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
        if (!formData.NombreCategoria) {
          newErrors.NombreCategoria = "El nombre de la categoría es requerido";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setIsSubmitting(false);
          return;
        }

        const submitData = new FormData();

        // Campo requerido
        submitData.append("NombreCategoria", formData.NombreCategoria);

        // Campo opcional
        if (formData.DescripcionCategoria) {
          submitData.append("DescripcionCategoria", formData.DescripcionCategoria);
        }

        submitData.append(
          "eliminar_FotoCategoria",
          removedFiles.foto ? "true" : "false"
        );

        if (formData.FotoCategoria instanceof File) {
          submitData.append("FotoCategoria", formData.FotoCategoria);
        }

        const response = await fetch(
          `/api/categoria/${categoria.id}/actualizar/`,
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
          throw new Error(data.message || "Error al actualizar la categoría");
        }

        handleClose();

        if (onCategoriaUpdated) {
          await onCategoriaUpdated(data.categoria);
        }
      } catch (error) {
        console.error("Error al actualizar la categoría:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error al actualizar la categoría",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, categoria, handleClose, onCategoriaUpdated, removedFiles]
  );

  return {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    previewUrl,
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
  };
};

export default useCategoriaUpdateModal;