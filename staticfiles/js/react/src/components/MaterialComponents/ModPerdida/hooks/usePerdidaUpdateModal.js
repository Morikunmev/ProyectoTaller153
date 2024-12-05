import { useState, useEffect, useCallback } from "react";

export const usePerdidaUpdateModal = ({
  isOpen,
  onClose,
  perdida,
  onPerdidaUpdated,
}) => {
  // Estados del formulario y modal
  const [formData, setFormData] = useState({
    nombre_perdida: "",
    motivo: "",
    descripcion: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

  // Efecto para cargar los datos de la pérdida cuando se abre el modal
  useEffect(() => {
    if (perdida && isOpen) {
      setFormData({
        nombre_perdida: perdida.nombre || "",
        motivo: perdida.motivo_key || "",
        descripcion: perdida.descripcion || "",
      });
    }
  }, [perdida, isOpen]);

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
        if (!formData.nombre_perdida) {
          newErrors.nombre_perdida = "El nombre de la pérdida es requerido";
        }
        if (!formData.motivo) {
          newErrors.motivo = "El motivo es requerido";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setIsSubmitting(false);
          return;
        }

        const response = await fetch(
          `/api/perdida/${perdida.id}/actualizar/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
            },
            body: JSON.stringify(formData),
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (data.errors) {
            setErrors(data.errors);
            throw new Error(Object.values(data.errors)[0]);
          }
          throw new Error(data.message || "Error al actualizar la pérdida");
        }

        handleClose();

        if (onPerdidaUpdated) {
          await onPerdidaUpdated(data.perdida);
        }
      } catch (error) {
        console.error("Error al actualizar la pérdida:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error al actualizar la pérdida",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, perdida, handleClose, onPerdidaUpdated]
  );

  return {
    formData,
    errors,
    isSubmitting,
    isAnimating,
    isVisible,
    handleClose,
    handleSubmit,
    handleInputChange,
  };
};

export default usePerdidaUpdateModal;