import React from "react";

const ProveedorDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  proveedorName,
  isDeleting,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Overlay con transición */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-40" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal con transición */}
      <div
        className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Confirmar Eliminación
        </h3>

        <p className="text-gray-600 mb-6">
          ¿Estás seguro que deseas eliminar al proveedor{" "}
          <span className="font-medium text-gray-900">{proveedorName}</span>?
          Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-center gap-4 px-4">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full px-6 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg 
                     hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full px-6 py-2.5 text-white bg-red-600 rounded-lg
                     hover:bg-red-700 transition-all duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProveedorDeleteModal;
