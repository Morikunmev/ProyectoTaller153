import { useState, useEffect } from "react";

export const useProfileEditModal = ({
  isOpen,
  onClose,
  userData,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    RutUsuario: "",
    EdadUsuario: "",
    TelefonoUsuario: "",
    FotoUsuario: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        first_name: userData.user?.first_name || "",
        last_name: userData.user?.last_name || "",
        email: userData.user?.email || "",
        RutUsuario: userData.RutUsuario || "",
        EdadUsuario: userData.EdadUsuario || "",
        TelefonoUsuario: userData.TelefonoUsuario || "",
        FotoUsuario: null,
      });
      setPreviewUrl(userData.FotoUsuario || null);
    }
  }, [isOpen, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          FotoUsuario: "La imagen no debe superar los 5MB",
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        FotoUsuario: file,
      }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      const response = await fetch("/api/usuario/actualizar/", {
        // URL actualizada
        method: "POST",
        headers: {
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
            .value,
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar perfil");
      }

      if (result.success) {
        onUpdate(result.usuario);
        onClose();
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    previewUrl,
    handleInputChange,
    handleFotoChange,
    handleSubmit,
  };
};
