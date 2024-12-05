import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const VentaUpdateModal = ({ isOpen, onClose, venta, onVentaUpdated }) => {
  const [formData, setFormData] = useState({
    nombre_venta: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (venta) {
      setFormData({
        nombre_venta: venta.nombre || "",
      });
      setError(null);
    }
  }, [venta]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/venta/${venta.id}/actualizar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
            .value,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.errors?.general || data.errors || "Error al actualizar la venta"
        );
      }

      onVentaUpdated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Panel lateral */}
      <div
        className={`fixed right-0 top-0 h-screen overflow-y-auto w-[448px] bg-white shadow-lg 
                   transform transition-transform duration-300 ease-in-out z-10
                   ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-20">
            <h2 className="text-xl font-semibold text-gray-900">
              Editar Venta
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 px-6 py-4">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Detalles de la venta - Solo lectura */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <span className="ml-2 text-gray-900">#{venta?.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Producto:</span>
                    <span className="ml-2 text-gray-900">
                      {venta?.producto.nombre}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Cliente:</span>
                    <span className="ml-2 text-gray-900">
                      {venta?.cliente?.nombre}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Cantidad:</span>
                    <span className="ml-2 text-gray-900">
                      {venta?.cantidad}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="ml-2 text-gray-900">
                      ${venta?.precio_total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Campos editables */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="nombre_venta"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre de la Venta
                  </label>
                  <input
                    type="text"
                    id="nombre_venta"
                    name="nombre_venta"
                    value={formData.nombre_venta}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre_venta: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                             focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t bg-gray-50 sticky bottom-0">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                         rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent 
                         rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2
                         focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50
                         disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VentaUpdateModal;
