import React from "react";
import { X } from "lucide-react";

const ProductoVenderModal = ({ isOpen, onClose, onVender, producto }) => {
  const [formData, setFormData] = React.useState({
    NombreVenta: "",
    CantidadVenta: 1,
    PrecioVenta: producto?.PrecioUnitarioProducto || 0,
    Cliente: "", // Opcional
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onVender(producto.id, formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Vender Producto</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">
              Nombre de la Venta*
            </label>
            <input
              type="text"
              name="NombreVenta"
              value={formData.NombreVenta}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              Cantidad a vender* (máx. {producto?.StockProductoActual})
            </label>
            <input
              type="number"
              name="CantidadVenta"
              min="1"
              max={producto?.StockProductoActual}
              value={formData.CantidadVenta}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              Precio de Venta*
            </label>
            <input
              type="number"
              name="PrecioVenta"
              min="0"
              step="0.01"
              value={formData.PrecioVenta}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              Cliente (opcional)
            </label>
            <select
              name="Cliente"
              value={formData.Cliente}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Seleccionar cliente</option>
              {/* Aquí irían las opciones de clientes si los tienes disponibles */}
            </select>
          </div>

          {/* Mostrar subtotal */}
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600">
              Subtotal: $
              {(formData.CantidadVenta * formData.PrecioVenta).toFixed(2)}
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Vender
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductoVenderModal;
