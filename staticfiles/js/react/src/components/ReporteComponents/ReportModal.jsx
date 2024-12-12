import React, { useState, useEffect } from "react"; // Añade useEffect
import { X, Send, CheckCircle } from "lucide-react";

const ReportModal = ({ isOpen, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    asunto: "",
    mensaje: "",
    adjuntos: [],
    nombreUsuario: "", // Cambiado para que inicie vacío
    rutUsuario: currentUser?.rut || "",
    urgencia: "medio",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? Array.from(files) : value,
    }));
  };
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        nombreUsuario: currentUser.nombre || "",
        rutUsuario: currentUser.rut || "",
      }));
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    const data = new FormData();
    data.append("asunto", formData.asunto);
    data.append("mensaje", formData.mensaje);
    data.append("nombreUsuario", formData.nombreUsuario);
    data.append("rutUsuario", formData.rutUsuario);
    data.append("urgencia", formData.urgencia);
    formData.adjuntos.forEach((file) => {
      data.append("adjuntos", file);
    });

    try {
      const response = await fetch("/api/enviar-reporte/", {
        method: "POST",
        headers: {
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
            .value,
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar el reporte");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({
          asunto: "",
          mensaje: "",
          adjuntos: [],
          nombreUsuario: currentUser?.nombre || "",
          rutUsuario: currentUser?.rut || "",
          urgencia: "medio",
        });
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform rounded-xl bg-white/90 shadow-xl">
          <div className="px-6 py-6">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-300"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Enviar Reporte
            </h2>

            {success ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <p className="text-lg font-medium text-green-600">
                  ¡Reporte enviado con éxito!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Usuario
                    </label>
                    <input
                      type="text"
                      name="nombreUsuario"
                      value={formData.nombreUsuario}
                      onChange={handleChange} // Quitado el disabled
                      required
                      className="w-full px-3 py-2 border rounded-lg transition-shadow
                   focus:ring-2 focus:ring-blue-500 hover:border-gray-400"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RUT
                    </label>
                    <input
                      type="text"
                      name="rutUsuario"
                      value={formData.rutUsuario}
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nivel de Urgencia
                    </label>
                    <select
                      name="urgencia"
                      value={formData.urgencia}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg transition-shadow
                             focus:ring-2 focus:ring-blue-500 hover:border-gray-400"
                    >
                      <option value="bajo">Bajo</option>
                      <option value="medio">Medio</option>
                      <option value="alto">Alto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto
                  </label>
                  <input
                    type="text"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg transition-shadow
                             focus:ring-2 focus:ring-blue-500 hover:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    rows="4"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg transition-shadow
                             focus:ring-2 focus:ring-blue-500 hover:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjuntos
                  </label>
                  <input
                    type="file"
                    name="adjuntos"
                    onChange={handleChange}
                    multiple
                    className="w-full file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-sm file:bg-black 
                             file:text-white hover:file:bg-gray-800
                             transition-all duration-300"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50
                             transition-colors duration-300 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm bg-black text-white rounded-lg 
                             hover:bg-gray-800 transition-colors duration-300
                             flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar Reporte
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
