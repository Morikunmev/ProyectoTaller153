import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ProductoPerdidaModal = ({ isOpen, onClose, onSubmit, producto }) => {
  const [formData, setFormData] = useState({
    NombrePerdida: "",
    CantidadPerdida: "",
    ValorUnitarioPerdida: "",
    MotivoPerdida: "otros",
    DescripcionPerdida: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Inicializar valor unitario con el precio del producto
  useEffect(() => {
    if (producto && isOpen) {
      setFormData((prev) => ({
        ...prev,
        ValorUnitarioPerdida: producto.PrecioUnitarioProducto,
      }));
    }
  }, [producto, isOpen]);

  // Calcular valor total
  const valorTotal =
    formData.CantidadPerdida && formData.ValorUnitarioPerdida
      ? parseFloat(formData.CantidadPerdida) *
        parseFloat(formData.ValorUnitarioPerdida)
      : 0;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
      setFormData({
        NombrePerdida: "",
        CantidadPerdida: "",
        ValorUnitarioPerdida: producto?.PrecioUnitarioProducto || "",
        MotivoPerdida: "otros",
        DescripcionPerdida: "",
      });
      setErrors({});
    }, 300);
  };

  const handleInputChange = (e) => {
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
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.NombrePerdida)
      newErrors.NombrePerdida = "El nombre es requerido";
    if (!formData.CantidadPerdida) {
      newErrors.CantidadPerdida = "La cantidad es requerida";
    } else if (
      parseInt(formData.CantidadPerdida) > producto?.StockProductoActual
    ) {
      newErrors.CantidadPerdida = `La cantidad no puede ser mayor al stock actual (${producto?.StockProductoActual})`;
    }
    if (!formData.ValorUnitarioPerdida)
      newErrors.ValorUnitarioPerdida = "El valor unitario es requerido";
    return newErrors;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(producto.id, formData);
      handleClose();
    } catch (error) {
      setErrors({
        general:
          "Error al registrar la pérdida. Por favor, intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const getInputBorderClass = (value) => {
    if (value && value.toString().trim() !== "") return "border-green-400";
    return "border-gray-300";
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
          <h2 className="text-lg font-semibold">Registrar Pérdida</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Nombre de la Pérdida*
              </label>
              <input
                type="text"
                name="NombrePerdida"
                value={formData.NombrePerdida}
                onChange={handleInputChange}
                className={`w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none 
                  transition-colors duration-200 ${getInputBorderClass(
                    formData.NombrePerdida
                  )}`}
              />
              {errors.NombrePerdida && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.NombrePerdida}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Cantidad*
              </label>
              <input
                type="number"
                name="CantidadPerdida"
                value={formData.CantidadPerdida}
                onChange={handleInputChange}
                min="1"
                max={producto?.StockProductoActual}
                className={`w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none 
                  transition-colors duration-200 ${getInputBorderClass(
                    formData.CantidadPerdida
                  )}`}
              />
              {errors.CantidadPerdida && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.CantidadPerdida}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Valor Unitario*
              </label>
              <input
                type="number"
                name="ValorUnitarioPerdida"
                value={formData.ValorUnitarioPerdida}
                readOnly
                className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-gray-100"
              />
            </div>

            {/* Mostrar valor total calculado */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Valor Total
              </label>
              <input
                type="text"
                value={`$${valorTotal.toLocaleString()}`}
                readOnly
                className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Motivo de la Pérdida*
              </label>
              <select
                name="MotivoPerdida"
                value={formData.MotivoPerdida}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="caducidad">Caducidad</option>
                <option value="daño">Daño</option>
                <option value="robo">Robo</option>
                <option value="error_inventario">Error de Inventario</option>
                <option value="otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Descripción
              </label>
              <textarea
                name="DescripcionPerdida"
                value={formData.DescripcionPerdida}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                rows="3"
                placeholder="Describe los detalles de la pérdida..."
              />
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                {errors.general}
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
            className="px-4 py-2 text-sm border rounded font-medium hover:bg-gray-50
                     transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded font-medium hover:bg-red-700
                     transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registrando..." : "Registrar Pérdida"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoPerdidaModal;
