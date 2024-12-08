import { useState, useEffect } from "react";

export const useAdminCreateModal = ({ isOpen, onClose, onSubmit }) => {
  // Form Data State - Solo inicializamos los campos según el modelo de Usuario/Admin
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    RutUsuario: "",
    TelefonoUsuario: "",
    EdadUsuario: "",
    FotoUsuario: null,
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Efecto para resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: "",
        email: "",
        password: "",
        RutUsuario: "",
        TelefonoUsuario: "",
        EdadUsuario: "",
        FotoUsuario: null,
      });
      setPreviewUrl(null);
      setErrors({});
    }
  }, [isOpen]);

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

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setFormData({
        username: "",
        email: "",
        password: "",
        RutUsuario: "",
        TelefonoUsuario: "",
        EdadUsuario: "",
        FotoUsuario: null,
      });
      setPreviewUrl(null);
      setErrors({});
    }, 150);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
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
      "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Formato no válido. Formatos permitidos: JPG, PNG, GIF";
    }

    return null;
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setErrors((prev) => ({ ...prev, FotoUsuario: error }));
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, FotoUsuario: file }));
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      if (errors.FotoUsuario) {
        setErrors((prev) => ({ ...prev, FotoUsuario: null }));
      }

      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleRemoveFoto = () => {
    setFormData((prev) => ({ ...prev, FotoUsuario: null }));
    setPreviewUrl(null);
    const fileInput = document.getElementById("foto-usuario");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "El nombre de usuario es requerido";
    }

    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    if (!formData.RutUsuario) {
      newErrors.RutUsuario = "El RUT es requerido";
    } else if (!/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/.test(formData.RutUsuario)) {
      newErrors.RutUsuario = "El RUT debe tener formato XX.XXX.XXX-X";
    }

    if (formData.EdadUsuario && (formData.EdadUsuario < 18 || formData.EdadUsuario > 100)) {
      newErrors.EdadUsuario = "La edad debe estar entre 18 y 100 años";
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
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("RutUsuario", formData.RutUsuario);

      // Campos opcionales
      if (formData.TelefonoUsuario) {
        formDataToSend.append("TelefonoUsuario", formData.TelefonoUsuario);
      }
      if (formData.EdadUsuario) {
        formDataToSend.append("EdadUsuario", formData.EdadUsuario);
      }
      if (formData.FotoUsuario) {
        formDataToSend.append("FotoUsuario", formData.FotoUsuario);
      }

      const csrfToken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      )?.value;

      const response = await fetch("/api/administrador/crear/", {
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
        throw new Error(data.message || "Error al crear el administrador");
      }

      if (data.success) {
        onSubmit(data.administrador);
        handleClose();
      }
    } catch (error) {
      console.error("Error al crear administrador:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error al crear el administrador",
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
    handleClose,
    handleSubmit,
    handleInputChange,
    handleFotoChange,
    handleRemoveFoto,
  };
};