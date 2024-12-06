import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const ClienteUpdateModal = ({ isOpen, onClose, cliente, onClienteUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    tipo: "",
    nombre_compania: "",
    comentario: "",
    telefono: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        rut: cliente.rut,
        tipo: cliente.tipo,
        nombre_compania: cliente.nombre_compania || "",
        comentario: cliente.comentario || "",
        telefono: cliente.telefono || "",
      });
    }
  }, [cliente]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/cliente/${cliente.id}/actualizar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors || "Error al actualizar el cliente");
      }

      onClienteUpdated(data.cliente);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-16 right-0 bottom-0 w-[448px] bg-white shadow-xl z-40
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isAnimating ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="flex-none border-b">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Editar Cliente</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg 
                         focus:ring-1 focus:ring-blue-500 focus:outline-none
                         hover:border-gray-400 transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg 
                         focus:ring-1 focus:ring-blue-500 focus:outline-none
                         hover:border-gray-400 transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RUT
              </label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleInputChange}
                required
                placeholder="XX.XXX.XXX-X"
                className="w-full px-3 py-2 border rounded-lg 
                         focus:ring-1 focus:ring-blue-500 focus:outline-none
                         hover:border-gray-400 transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cliente
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg
                         focus:ring-1 focus:ring-blue-500 focus:outline-none
                         hover:border-gray-400 transition-colors duration-200"
              >
                <option value="">Seleccione un tipo</option>
                <option value="particular">Particular</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>

            {formData.tipo === 'empresa' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Compañía
                </label>
                <input
                  type="text"
                  name="nombre_compania"
                  value={formData.nombre_compania}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg 
                           focus:ring-1 focus:ring-blue-500 focus:outline-none
                           hover:border-gray-400 transition-colors duration-200"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg 
                         focus:ring-1 focus:ring-blue-500 focus:outline-none
                         hover:border-gray-400 transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentario
              </label>
              <textarea
                name="comentario"
                value={formData.comentario}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg
                         focus:ring-1 focus:ring-blue-500 focus:outline-none
                         hover:border-gray-400 transition-colors duration-200"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none border-t bg-white p-4">
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm border rounded font-medium
                     hover:bg-gray-50 transition-all duration-150
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-black text-white rounded font-medium
                     hover:bg-gray-800 transition-all duration-150
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteUpdateModal;