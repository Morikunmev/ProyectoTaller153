import { useState, useEffect, useCallback } from "react";

export const useClienteUpdateModal = ({
  isOpen,
  onClose,
  cliente,
  onClienteUpdated,
}) => {
  // Estados del formulario y modal
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    tipo: "",
    nombre_compania: "",
    telefono: "",
    comentario: "",
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

  // Efecto para cargar los datos del cliente cuando se abre el modal
  useEffect(() => {
    if (cliente && isOpen) {
      setFormData({
        nombre: cliente.nombre || "",
        apellido: cliente.apellido || "",
        rut: cliente.rut || "",
        tipo: cliente.tipo || "",
        nombre_compania: cliente.nombre_compania || "",
        telefono: cliente.telefono || "",
        comentario: cliente.comentario || "",
      });
    }
  }, [cliente, isOpen]);

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

  // Validación de RUT chileno
  const validateRut = useCallback((rut) => {
    const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/;
    return rutRegex.test(rut);
  }, []);

  // Manejador de envío del formulario
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      setIsSubmitting(true);
      try {
        const newErrors = {};
        if (!formData.nombre) {
          newErrors.nombre = "El nombre es requerido";
        }
        if (!formData.apellido) {
          newErrors.apellido = "El apellido es requerido";
        }
        if (!formData.rut) {
          newErrors.rut = "El RUT es requerido";
        } else if (!validateRut(formData.rut)) {
          newErrors.rut = "El formato del RUT debe ser XX.XXX.XXX-X";
        }
        if (!formData.tipo) {
          newErrors.tipo = "El tipo de cliente es requerido";
        }
        if (formData.tipo === 'empresa' && !formData.nombre_compania) {
          newErrors.nombre_compania = "El nombre de la compañía es requerido para clientes empresa";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setIsSubmitting(false);
          return;
        }

        const response = await fetch(
          `/api/cliente/${cliente.id}/actualizar/`,
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
          throw new Error(data.message || "Error al actualizar el cliente");
        }

        handleClose();

        if (onClienteUpdated) {
          await onClienteUpdated(data.cliente);
        }
      } catch (error) {
        console.error("Error al actualizar el cliente:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Error al actualizar el cliente",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, cliente, handleClose, onClienteUpdated, validateRut]
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

export default useClienteUpdateModal;