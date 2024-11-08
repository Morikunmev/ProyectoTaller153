import React, { useState } from "react";
import { X, Upload, Building2, MapPin } from "lucide-react";
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
  const [previewUrl, setPreviewUrl] = useState(null);

  const validateRut = (rut) => {
    const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/;
    return rutRegex.test(rut);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.NombreProveedor) {
      newErrors.NombreProveedor = "El nombre es obligatorio";
    } else if (formData.NombreProveedor.length < 3) {
      newErrors.NombreProveedor = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.RutProveedor) {
      newErrors.RutProveedor = "El RUT es obligatorio";
    } else if (!validateRut(formData.RutProveedor)) {
      newErrors.RutProveedor = "El RUT debe tener el formato XX.XXX.XXX-X";
    }

    if (!formData.MarcaProveedor) {
      newErrors.MarcaProveedor = "La marca es obligatoria";
    } else if (formData.MarcaProveedor.length < 2) {
      newErrors.MarcaProveedor = "La marca debe tener al menos 2 caracteres";
    }

    if (
      formData.TelefonoProveedor &&
      !/^\d{8,15}$/.test(formData.TelefonoProveedor.replace(/\D/g, ""))
    ) {
      newErrors.TelefonoProveedor =
        "El teléfono debe tener entre 8 y 15 dígitos";
    }

    if (
      formData.FotoProveedor &&
      formData.FotoProveedor.size > 5 * 1024 * 1024
    ) {
      newErrors.FotoProveedor = "La imagen no puede superar los 5MB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const csrftoken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      ).value;

      const response = await fetch("/api/proveedor/crear/", {
        method: "POST",
        headers: {
          "X-CSRFToken": csrftoken,
        },
        body: formDataToSend,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejar todos los errores de validación y unicidad
        if (data.errors) {
          setErrors(data.errors);
          return;
        }
        throw new Error(data.message || "Error al crear el proveedor");
      }

      if (data.success) {
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
        onSubmit(data.proveedor);
        onClose();
      }
    } catch (error) {
      setErrors({
        general: error.message || "Error al crear el proveedor",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Limpiar error del campo que se está editando
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    if (name === "FotoProveedor" && files[0]) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          FotoProveedor: "La imagen no puede superar los 5MB",
        }));
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
      setPreviewUrl(URL.createObjectURL(file));
    } else if (name === "TelefonoProveedor") {
      // Permitir solo números en el teléfono
      const numeroLimpio = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numeroLimpio }));
    } else if (name === "RutProveedor") {
      // Validación en tiempo real del RUT
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value && !validateRut(value)) {
        setErrors((prev) => ({
          ...prev,
          RutProveedor: "Formato: XX.XXX.XXX-X",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                Crear Nuevo Proveedor
              </h2>
              <p className="text-sm text-gray-500">
                Complete los datos del proveedor. Los campos marcados con * son
                obligatorios.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields Section */}
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre*
                  </label>
                  <input
                    type="text"
                    name="NombreProveedor"
                    value={formData.NombreProveedor}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.NombreProveedor
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.NombreProveedor && (
                    <p className="text-sm text-red-500">
                      {errors.NombreProveedor}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    RUT* (XX.XXX.XXX-X)
                  </label>
                  <input
                    type="text"
                    name="RutProveedor"
                    value={formData.RutProveedor}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.RutProveedor ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.RutProveedor && (
                    <p className="text-sm text-red-500">
                      {errors.RutProveedor}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Marca*
                  </label>
                  <input
                    type="text"
                    name="MarcaProveedor"
                    value={formData.MarcaProveedor}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.MarcaProveedor
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.MarcaProveedor && (
                    <p className="text-sm text-red-500">
                      {errors.MarcaProveedor}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Optional Fields Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Comentario
                </label>
                <textarea
                  name="ComentarioProveedor"
                  value={formData.ComentarioProveedor}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <h3 className="font-medium">Información de Ubicación</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="CiudadProveedor"
                      value={formData.CiudadProveedor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Región
                    </label>
                    <input
                      type="text"
                      name="RegionProveedor"
                      value={formData.RegionProveedor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      País
                    </label>
                    <input
                      type="text"
                      name="PaisProveedor"
                      value={formData.PaisProveedor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <h3 className="font-medium">Información de Contacto</h3>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    name="TelefonoProveedor"
                    value={formData.TelefonoProveedor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-gray-500" />
                  <h3 className="font-medium">Foto del Proveedor</h3>
                </div>
                <div className="grid gap-4">
                  <input
                    type="file"
                    name="FotoProveedor"
                    onChange={handleChange}
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                             file:rounded-lg file:border-0 file:text-sm file:font-medium
                             file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100
                             cursor-pointer"
                  />
                  {previewUrl && (
                    <div className="relative w-32 h-32">
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 
                         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 
                         focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Crear Proveedor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProveedorModal;
