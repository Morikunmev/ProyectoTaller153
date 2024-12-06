import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

const ClienteDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  clienteId,
  isDeleting,
  cliente,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-40" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Confirmar Eliminación de Cliente
          </h3>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar este cliente? Los registros de ventas asociados se mantendrán pero se marcarán como "Cliente eliminado".
          </p>

          {cliente && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Cliente ID:</span>
                <span className="font-medium text-gray-900">
                  #{clienteId}
                </span>

                <span className="text-gray-500">Nombre:</span>
                <span className="font-medium text-gray-900">
                  {cliente.nombre} {cliente.apellido}
                </span>

                <span className="text-gray-500">RUT:</span>
                <span className="font-medium text-gray-900">
                  {cliente.rut}
                </span>

                <span className="text-gray-500">Tipo:</span>
                <span className="font-medium text-gray-900">
                  {cliente.tipo === 'empresa' ? 'Empresa' : 'Particular'}
                </span>

                {cliente.tipo === 'empresa' && (
                  <>
                    <span className="text-gray-500">Compañía:</span>
                    <span className="font-medium text-gray-900">
                      {cliente.nombre_compania}
                    </span>
                  </>
                )}

                <span className="text-gray-500">Total Compras:</span>
                <span className="font-medium text-gray-900">
                  {cliente.cantidad_total_compras} compras
                </span>

                <span className="text-gray-500">Total Dinero:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(cliente.total_dinero_compras)}
                </span>
              </div>
            </div>
          )}

          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="text-sm text-red-700 space-y-1">
              <p>• Se eliminará el registro del cliente</p>
              <p>• Las ventas asociadas se marcarán como "Cliente eliminado"</p>
              <p>• Se mantendrá el historial de compras</p>
            </div>
          </div>

          <p className="text-sm text-red-600 font-medium">
            Esta acción no se puede deshacer una vez confirmada.
          </p>
        </div>

        <div className="flex justify-center gap-4 px-4 mt-6">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full px-6 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg 
                     hover:bg-gray-50 transition-colors duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>

          <button
            onClick={() => onConfirm(clienteId)}
            disabled={isDeleting}
            className="w-full px-6 py-2.5 text-white bg-red-600 rounded-lg
                     hover:bg-red-700 transition-all duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Eliminar cliente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteDeleteModal;