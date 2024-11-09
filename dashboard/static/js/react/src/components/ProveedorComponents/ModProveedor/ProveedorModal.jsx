import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ProveedorModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    NombreProveedor: "",
    RutProveedor: "",
    MarcaProveedor: "",
    ComentarioProveedor: "",
    CiudadProveedor: "",
    RegionProveedor: "",
    PaisProveedor: "",
    TelefonoProveedor: "",
    FotoProveedor: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Pequeño retraso para asegurar que la transición sea suave
      setTimeout(() => setIsAnimating(true), 5);
    } else {
      setIsAnimating(false);
      // Aumentamos el tiempo para que coincida con la duración de la transición
      const timer = setTimeout(() => setIsVisible(false), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setFormData({
        NombreProveedor: "",
        RutProveedor: "",
        MarcaProveedor: "",
        ComentarioProveedor: "",
        CiudadProveedor: "",
        RegionProveedor: "",
        PaisProveedor: "",
        TelefonoProveedor: "",
        FotoProveedor: null,
      });
      setPreviewUrl(null);
      setErrors({});
    }, 10);
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
    if (formData.TelefonoProveedor && formData.TelefonoProveedor.length > 15) {
      newErrors.TelefonoProveedor =
        "El teléfono no puede tener más de 15 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, FotoProveedor: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      });

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
        transition-all duration-300 ease-in-out
        ${
          isAnimating
            ? "bg-black/50 backdrop-blur-sm"
            : "bg-black/0 backdrop-blur-none"
        }
        ${isAnimating ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white w-full max-w-md rounded-lg shadow-xl my-8 flex flex-col max-h-[calc(100vh-4rem)]
          transition-all duration-300 ease-in-out
          ${isAnimating ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}
          ${isAnimating ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div
          className={`p-6 border-b transition-transform duration-300 ${
            isAnimating ? "translate-y-0" : "translate-y-2"
          }`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Nuevo Proveedor</h2>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200
                       hover:rotate-90 transform active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div
          className={`p-6 overflow-y-auto flex-1 transition-all duration-300 delay-100
          ${
            isAnimating
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos obligatorios */}
            <div className="space-y-4">
              <h3 className="font-medium">Información Principal</h3>
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
            </div>

            {/* Campos opcionales */}
            <div className="space-y-4">
              <h3 className="font-medium">Información Adicional</h3>

              {/* Ubicación */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Ciudad</label>
                  <input
                    type="text"
                    name="CiudadProveedor"
                    value={formData.CiudadProveedor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        CiudadProveedor: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Región</label>
                  <input
                    type="text"
                    name="RegionProveedor"
                    value={formData.RegionProveedor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        RegionProveedor: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">País</label>
                  <input
                    type="text"
                    name="PaisProveedor"
                    value={formData.PaisProveedor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        PaisProveedor: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <input
                    type="tel"
                    name="TelefonoProveedor"
                    value={formData.TelefonoProveedor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        TelefonoProveedor: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {errors.TelefonoProveedor && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.TelefonoProveedor}
                    </p>
                  )}
                </div>
              </div>

              {/* Comentario */}
              <div>
                <label className="text-sm font-medium">Comentario</label>
                <textarea
                  name="ComentarioProveedor"
                  value={formData.ComentarioProveedor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ComentarioProveedor: e.target.value,
                    }))
                  }
                  rows="3"
                  className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Foto */}
              <div>
                <label className="text-sm font-medium">
                  Foto del Proveedor
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="foto-proveedor"
                  />
                  <label
                    htmlFor="foto-proveedor"
                    className="px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 
                             transition-all duration-200 hover:shadow-md active:scale-95"
                  >
                    Seleccionar imagen
                  </label>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="h-16 w-16 object-cover rounded transition-all duration-200"
                    />
                  )}
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="p-4 bg-red-50 text-red-600 rounded">
                {errors.general}
              </div>
            )}
          </form>
        </div>

        {/* Footer fijo */}
        <div
          className={`p-6 border-t transition-all duration-300 delay-150
          ${
            isAnimating
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded hover:bg-gray-50 
                       transition-all duration-200 ease-in-out
                       hover:shadow-md active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-black text-white rounded 
                       hover:bg-gray-800 transition-all duration-200 
                       ease-in-out hover:shadow-md active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creando..." : "Crear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProveedorModal;
