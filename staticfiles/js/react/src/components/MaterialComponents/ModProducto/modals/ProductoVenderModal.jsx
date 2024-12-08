import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ProductoVenderModal = ({ isOpen, onClose, onVender, producto }) => {
  const [formData, setFormData] = useState({
    NombreVenta: "",
    CantidadVenta: 1,
    PrecioVenta: "",
    clienteType: "sin_cliente", // sin_cliente, existente, nuevo
    cliente: {
      id: "",
      NombreCliente: "",
      ApellidoCliente: "",
      RutCliente: "",
      TipoCliente: "particular",
      NombreCompañia: "",
      TelefonoCliente: "",
    },
  });

  const [clientes, setClientes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar lista de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch("/api/clientes/listar/");
        if (response.ok) {
          const data = await response.json();
          console.log("Datos de clientes recibidos:", data);
          if (data.success) {
            // Filtrar los clientes que no están eliminados
            const clientesActivos = (data.clientes || []).filter(
              (cliente) => !cliente.cliente_eliminado
            );
            setClientes(clientesActivos);
          }
        } else {
          console.error("Error en la respuesta del servidor");
          setClientes([]);
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        setClientes([]);
      }
    };

    if (isOpen) {
      fetchClientes();
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
      setFormData((prev) => ({
        ...prev,
        PrecioVenta: producto?.PrecioUnitarioProducto || 0,
      }));
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen, producto]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
      setFormData({
        NombreVenta: "",
        CantidadVenta: 1,
        PrecioVenta: producto?.PrecioUnitarioProducto || 0,
        clienteType: "sin_cliente",
        cliente: {
          id: "",
          NombreCliente: "",
          ApellidoCliente: "",
          RutCliente: "",
          TipoCliente: "particular",
          NombreCompañia: "",
          TelefonoCliente: "",
        },
      });
      setErrors({});
    }, 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("cliente.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        cliente: {
          ...prev.cliente,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.NombreVenta) newErrors.NombreVenta = "El nombre es requerido";
    if (!formData.CantidadVenta) {
      newErrors.CantidadVenta = "La cantidad es requerida";
    } else if (
      parseInt(formData.CantidadVenta) > producto?.StockProductoActual
    ) {
      newErrors.CantidadVenta = `La cantidad no puede ser mayor al stock actual (${producto?.StockProductoActual})`;
    }
    if (!formData.PrecioVenta) newErrors.PrecioVenta = "El precio es requerido";

    // Validaciones para cliente nuevo
    if (formData.clienteType === "nuevo") {
      if (!formData.cliente.NombreCliente)
        newErrors["cliente.NombreCliente"] = "El nombre es requerido";
      if (!formData.cliente.ApellidoCliente)
        newErrors["cliente.ApellidoCliente"] = "El apellido es requerido";
      if (!formData.cliente.RutCliente)
        newErrors["cliente.RutCliente"] = "El RUT es requerido";
    } else if (formData.clienteType === "existente" && !formData.cliente.id) {
      newErrors.clienteId = "Debe seleccionar un cliente";
    }

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
      const ventaData = {
        NombreVenta: formData.NombreVenta,
        CantidadVenta: parseInt(formData.CantidadVenta),
        PrecioVenta: parseFloat(formData.PrecioVenta),
      };

      // Agregar datos del cliente según el tipo seleccionado
      if (formData.clienteType === "existente") {
        ventaData.cliente = {
          tipo: "existente",
          id: formData.cliente.id,
        };
      } else if (formData.clienteType === "nuevo") {
        ventaData.cliente = {
          tipo: "nuevo",
          ...formData.cliente,
        };
      }

      await onVender(producto.id, ventaData);
      handleClose();
    } catch (error) {
      console.error("Error en venta:", error);
      setErrors({
        general: "Error al registrar la venta. Por favor, intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputBorderClass = (value) => {
    if (value && value.toString().trim() !== "") return "border-green-400";
    return "border-gray-300";
  };

  const renderClienteForm = () => {
    switch (formData.clienteType) {
      case "existente":
        return (
          <select
            name="cliente.id"
            value={formData.cliente.id}
            onChange={handleInputChange}
            className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Seleccionar cliente</option>
            {Array.isArray(clientes) &&
              clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {`${cliente.nombre} ${cliente.apellido}${
                    cliente.tipo === "empresa"
                      ? ` - ${cliente.nombre_compania}`
                      : ""
                  }`}
                </option>
              ))}
          </select>
        );

      case "nuevo":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Nombre*</label>
              <input
                type="text"
                name="cliente.NombreCliente"
                value={formData.cliente.NombreCliente}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              {errors["cliente.NombreCliente"] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors["cliente.NombreCliente"]}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Apellido*
              </label>
              <input
                type="text"
                name="cliente.ApellidoCliente"
                value={formData.cliente.ApellidoCliente}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              {errors["cliente.ApellidoCliente"] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors["cliente.ApellidoCliente"]}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">RUT*</label>
              <input
                type="text"
                name="cliente.RutCliente"
                value={formData.cliente.RutCliente}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="XX.XXX.XXX-X"
              />
              {errors["cliente.RutCliente"] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors["cliente.RutCliente"]}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Tipo de Cliente
              </label>
              <select
                name="cliente.TipoCliente"
                value={formData.cliente.TipoCliente}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="particular">Particular</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>

            {formData.cliente.TipoCliente === "empresa" && (
              <div>
                <label className="text-sm font-medium block mb-1">
                  Nombre Compañía
                </label>
                <input
                  type="text"
                  name="cliente.NombreCompañia"
                  value={formData.cliente.NombreCompañia}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium block mb-1">Teléfono</label>
              <input
                type="tel"
                name="cliente.TelefonoCliente"
                value={formData.cliente.TelefonoCliente}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        );

      default:
        return null;
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
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Registrar Venta</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Producto: {producto?.NombreProducto}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
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
                className={`w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none 
                  transition-colors duration-200 ${getInputBorderClass(
                    formData.NombreVenta
                  )}`}
              />
              {errors.NombreVenta && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.NombreVenta}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Cantidad*
              </label>
              <input
                type="number"
                name="CantidadVenta"
                value={formData.CantidadVenta}
                onChange={handleInputChange}
                min="1"
                max={producto?.StockProductoActual}
                className={`w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none 
                  transition-colors duration-200 ${getInputBorderClass(
                    formData.CantidadVenta
                  )}`}
              />
              {errors.CantidadVenta && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.CantidadVenta}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Precio Unitario*
              </label>
              <input
                type="number"
                name="PrecioVenta"
                value={formData.PrecioVenta}
                readOnly
                className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-gray-100"
              />
              {errors.PrecioVenta && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.PrecioVenta}
                </p>
              )}
            </div>

            {/* Mostrar Total Calculado */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Valor Total
              </label>
              <input
                type="text"
                value={`$${(
                  formData.CantidadVenta * formData.PrecioVenta
                ).toFixed(2)}`}
                readOnly
                className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-gray-100"
              />
            </div>

            {/* Sección de Cliente */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Cliente
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="clienteType"
                      value="sin_cliente"
                      checked={formData.clienteType === "sin_cliente"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          clienteType: e.target.value,
                        }))
                      }
                      className="mr-2"
                    />
                    Sin cliente
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="clienteType"
                      value="existente"
                      checked={formData.clienteType === "existente"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          clienteType: e.target.value,
                        }))
                      }
                      className="mr-2"
                    />
                    Cliente existente
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="clienteType"
                      value="nuevo"
                      checked={formData.clienteType === "nuevo"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          clienteType: e.target.value,
                        }))
                      }
                      className="mr-2"
                    />
                    Nuevo cliente
                  </label>
                </div>
              </div>

              {renderClienteForm()}
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
            className="px-4 py-2 text-sm bg-green-600 text-white rounded font-medium hover:bg-green-700
                     transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registrando..." : "Registrar Venta"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoVenderModal;
