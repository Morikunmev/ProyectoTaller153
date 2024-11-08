import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ProveedorModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    NombreProveedor: "",
    RutProveedor: "",
    MarcaProveedor: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.NombreProveedor || formData.NombreProveedor.length < 3) {
      newErrors.NombreProveedor = "El nombre debe tener al menos 3 caracteres";
    }
    if (
      !/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/.test(formData.RutProveedor)
    ) {
      newErrors.RutProveedor = "Formato inválido (XX.XXX.XXX-X)";
    }
    if (!formData.MarcaProveedor || formData.MarcaProveedor.length < 2) {
      newErrors.MarcaProveedor = "La marca debe tener al menos 2 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) =>
        formDataToSend.append(key, formData[key])
      );

      const response = await fetch("/api/proveedor/crear/", {
        method: "POST",
        headers: {
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
            .value,
        },
        body: formDataToSend,
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        onSubmit(data.proveedor);
        handleClose();
      } else {
        setErrors(data.errors || { general: "Error al crear el proveedor" });
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
        transition-all duration-200 ease-out
        ${
          isAnimating
            ? "bg-black/50 backdrop-blur-sm"
            : "bg-black/0 backdrop-blur-none"
        }
        ${isAnimating ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white w-full max-w-md rounded-lg shadow-lg
          transition-all duration-200 ease-out
          ${isAnimating ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}
          ${isAnimating ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Nuevo Proveedor</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {["Nombre", "Rut", "Marca"].map((field) => (
              <div key={field}>
                <label className="text-sm font-medium">
                  {field}*{field === "Rut" && " (XX.XXX.XXX-X)"}
                </label>
                <input
                  type="text"
                  name={`${field}Proveedor`}
                  value={formData[`${field}Proveedor`]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {errors[`${field}Proveedor`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`${field}Proveedor`]}
                  </p>
                )}
              </div>
            ))}

            {errors.general && (
              <div className="p-4 bg-red-50 text-red-600 rounded">
                {errors.general}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
              >
                {isSubmitting ? "Creando..." : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProveedorModal;
