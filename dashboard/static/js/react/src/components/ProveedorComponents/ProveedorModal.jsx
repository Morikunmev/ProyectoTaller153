import React, { useState } from "react";

const ProveedorModal = () => {
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

  const [isSubmitting, setIsSubmitting] = useState(false); //controla el estado de envio
  const [errors, setErrors] = useState({}); //Almacena errores de validacion
  const [successMessage, setSuccessMessage] = useState(""); //Mensaje de exito

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          FotoProveedor: "Por favor, seleccione un archivo de imagen válido",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, FotoProveedor: file }));
      setErrors((prev) => ({ ...prev, FotoProveedor: null }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      // Obtener el token CSRF
      const csrfToken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      ).value;

      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();

      // Agregar todos los campos al FormData
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch("/api/proveedor/crear/", {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Proveedor creado exitosamente");
        // Limpiar el formulario
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
        // Limpiar el input de archivo
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        if (typeof data.message === "object") {
          setErrors(data.message);
        } else {
          setErrors({ general: data.message });
        }
      }
    } catch (error) {
      setErrors({ general: "Error al conectar con el servidor" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-3">Registro de Proveedor MODAL</h2>
      {successMessage && (
        <div className="p-3 mb-4 rounded bg-green-100 text-green-700">
          {successMessage}
        </div>
      )}

      {errors.general && (
        <div className="p-3 mb-4 rounded bg-red-100 text-red-700">
          {errors.general}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-3"
        encType="multipart/form-data"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Nombre*</label>
            <input
              className={`w-full border rounded px-2 py-1 text-sm ${
                errors.NombreProveedor ? "border-red-500" : ""
              }`}
              name="NombreProveedor"
              value={formData.NombreProveedor}
              onChange={handleInputChange}
              required
            />
            {errors.NombreProveedor && (
              <p className="text-red-500 text-xs mt-1">
                {errors.NombreProveedor}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">RUT*</label>
            <input
              className={`w-full border rounded px-2 py-1 text-sm ${
                errors.RutProveedor ? "border-red-500" : ""
              }`}
              name="RutProveedor"
              value={formData.RutProveedor}
              onChange={handleInputChange}
              pattern="^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$"
              placeholder="XX.XXX.XXX-X"
              required
            />
            {errors.RutProveedor && (
              <p className="text-red-500 text-xs mt-1">{errors.RutProveedor}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Marca*</label>
            <input
              className={`w-full border rounded px-2 py-1 text-sm ${
                errors.MarcaProveedor ? "border-red-500" : ""
              }`}
              name="MarcaProveedor"
              value={formData.MarcaProveedor}
              onChange={handleInputChange}
              required
            />
            {errors.MarcaProveedor && (
              <p className="text-red-500 text-xs mt-1">
                {errors.MarcaProveedor}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Teléfono</label>
            <input
              className={`w-full border rounded px-2 py-1 text-sm ${
                errors.TelefonoProveedor ? "border-red-500" : ""
              }`}
              name="TelefonoProveedor"
              value={formData.TelefonoProveedor}
              onChange={handleInputChange}
            />
            {errors.TelefonoProveedor && (
              <p className="text-red-500 text-xs mt-1">
                {errors.TelefonoProveedor}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Ciudad</label>
            <input
              className={`w-full border rounded px-2 py-1 text-sm ${
                errors.CiudadProveedor ? "border-red-500" : ""
              }`}
              name="CiudadProveedor"
              value={formData.CiudadProveedor}
              onChange={handleInputChange}
            />
            {errors.CiudadProveedor && (
              <p className="text-red-500 text-xs mt-1">
                {errors.CiudadProveedor}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Región</label>
            <input
              className={`w-full border rounded px-2 py-1 text-sm ${
                errors.RegionProveedor ? "border-red-500" : ""
              }`}
              name="RegionProveedor"
              value={formData.RegionProveedor}
              onChange={handleInputChange}
            />
            {errors.RegionProveedor && (
              <p className="text-red-500 text-xs mt-1">
                {errors.RegionProveedor}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">País</label>
            <input
              className={`w-full border rounded px-2 py-1 text-sm ${
                errors.PaisProveedor ? "border-red-500" : ""
              }`}
              name="PaisProveedor"
              value={formData.PaisProveedor}
              onChange={handleInputChange}
            />
            {errors.PaisProveedor && (
              <p className="text-red-500 text-xs mt-1">
                {errors.PaisProveedor}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Comentario</label>
          <textarea
            className={`w-full border rounded px-2 py-1 text-sm ${
              errors.ComentarioProveedor ? "border-red-500" : ""
            }`}
            name="ComentarioProveedor"
            value={formData.ComentarioProveedor}
            onChange={handleInputChange}
            rows="2"
          />
          {errors.ComentarioProveedor && (
            <p className="text-red-500 text-xs mt-1">
              {errors.ComentarioProveedor}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Foto</label>
          <input
            className={`w-full text-sm ${
              errors.FotoProveedor ? "text-red-500" : ""
            }`}
            type="file"
            name="FotoProveedor"
            onChange={handleFileChange}
            accept="image/*"
          />
          {errors.FotoProveedor && (
            <p className="text-red-500 text-xs mt-1">{errors.FotoProveedor}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-1.5 px-4 rounded text-sm hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registrando..." : "Registrar Proveedor"}
        </button>
      </form>
    </div>
  );
};

export default ProveedorModal;
