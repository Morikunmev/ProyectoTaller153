import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

const PerdidaRestablecerModal = ({
  isOpen,
  onClose,
  onConfirm,
  perdidaId,
  isRestabling,
  perdida,
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
            <AlertTriangle className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Confirmar Restablecimiento de Pérdida
          </h3>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas restablecer esta pérdida? Esta acción:
          </p>

          {perdida && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Pérdida ID:</span>
                <span className="font-medium text-gray-900">
                  #{perdidaId}
                </span>

                <span className="text-gray-500">Nombre:</span>
                <span className="font-medium text-gray-900">
                  {perdida.nombre}
                </span>

                <span className="text-gray-500">Producto:</span>
                <span className="font-medium text-gray-900">
                  {perdida.producto.nombre}
                </span>

                <span className="text-gray-500">Cantidad:</span>
                <span className="font-medium text-gray-900">
                  {perdida.cantidad} unidades
                </span>

                <span className="text-gray-500">Valor Unitario:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(perdida.valor_unitario)}
                </span>

                <span className="text-gray-500">Valor Total:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(perdida.valor_total)}
                </span>

                <span className="text-gray-500">Motivo:</span>
                <span className="font-medium text-gray-900">
                  {perdida.motivo}
                </span>
              </div>

              {perdida.descripcion && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-1">Descripción:</p>
                  <p className="text-sm text-gray-700">
                    {perdida.descripcion}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Devolverá {perdida?.cantidad} unidades al stock del producto</p>
              <p>• Eliminará el registro de pérdida</p>
              <p>• Actualizará los totales de pérdidas de la categoría</p>
            </div>
          </div>

          <p className="text-sm text-red-600">
            Esta acción no se puede deshacer una vez confirmada.
          </p>
        </div>

        <div className="flex justify-center gap-4 px-4 mt-6">
          <button
            onClick={onClose}
            disabled={isRestabling}
            className="w-full px-6 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg 
                     hover:bg-gray-50 transition-colors duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>

          <button
            onClick={() => onConfirm(perdidaId)}
            disabled={isRestabling}
            className="w-full px-6 py-2.5 text-white bg-blue-600 rounded-lg
                     hover:bg-blue-700 transition-all duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {isRestabling ? (
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
                <span>Restableciendo...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Restablecer pérdida</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerdidaRestablecerModal;