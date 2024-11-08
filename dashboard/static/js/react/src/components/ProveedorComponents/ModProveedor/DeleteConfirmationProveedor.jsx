import React, { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";

const Toast = ({ message, type = "success", onClose }) => (
  <div
    className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-[60] animate-slide-up
    ${type === "success" ? "bg-green-500" : "bg-red-500"} 
    text-white flex items-center gap-2`}
  >
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-80">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const DeleteConfirmationProveedor = ({
  isOpen,
  onClose,
  onConfirm,
  proveedorName,
  isDeleting = false,
}) => {
  const [isShowing, setIsShowing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
    } else {
      setTimeout(() => {
        setIsShowing(false);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen && !isShowing) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setToast({
        type: "success",
        message: `${proveedorName} ha sido eliminado exitosamente`,
      });

      setTimeout(() => {
        setToast(null);
      }, 3000);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Error al eliminar el proveedor",
      });
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out
        ${isOpen ? "opacity-100" : "opacity-0"}`}
      >
        {/* Overlay con transición */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal con transición */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className={`bg-white rounded-lg w-full max-w-md transform transition-all duration-300 ease-in-out
            ${
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Confirmar Eliminación
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  disabled={isDeleting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">
                  ¿Estás seguro que deseas eliminar al proveedor{" "}
                  <span className="font-semibold">{proveedorName}</span>?
                </p>
                <p className="text-gray-600 mt-2">
                  Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                           transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center min-w-[100px]"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default DeleteConfirmationProveedor;
