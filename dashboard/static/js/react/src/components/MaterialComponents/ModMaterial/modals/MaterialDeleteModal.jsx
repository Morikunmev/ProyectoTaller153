import React from "react";
import { AlertTriangle, FileImage, Box } from "lucide-react";

const MaterialDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  materialId,
  isDeleting,
  material,
}) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to format currency
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
        {/* Header con ícono de advertencia */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Confirmar Eliminación
          </h3>
        </div>

        {/* Contenido detallado */}
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro que deseas eliminar este material? Esta acción
            eliminará permanentemente:
          </p>

          {material && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Material ID:</span>
                <span className="font-medium text-gray-900">#{materialId}</span>

                <span className="text-gray-500">Nombre:</span>
                <span className="font-medium text-gray-900">
                  {material.NombreMaterial}
                </span>

                <span className="text-gray-500">Stock:</span>
                <span className="font-medium text-gray-900">
                  {material.StockMaterial}
                </span>

                <span className="text-gray-500">Precio:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(material.PrecioMaterial)}
                </span>

                <span className="text-gray-500">Total:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(material.TotalMaterial)}
                </span>

                <span className="text-gray-500">Estado:</span>
                <span
                  className={`font-medium ${
                    material.EstadoMaterial === "Activo"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {material.EstadoMaterial}
                </span>

                <span className="text-gray-500">Ubicación:</span>
                <span className="font-medium text-gray-900">
                  {material.UbicacionMaterial}
                </span>

                {material.Proveedor && (
                  <>
                    <span className="text-gray-500">Proveedor:</span>
                    <span className="font-medium text-gray-900">
                      {material.Proveedor.NombreProveedor}
                    </span>
                  </>
                )}
              </div>

              {/* Características Adicionales */}
              {(material.ColorMaterial ||
                material.PesoMaterial ||
                material.DimensionesMaterial) && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-2">Características:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {material.ColorMaterial && (
                      <>
                        <span className="text-gray-500">Color:</span>
                        <span className="text-gray-900">
                          {material.ColorMaterial}
                        </span>
                      </>
                    )}
                    {material.PesoMaterial && (
                      <>
                        <span className="text-gray-500">Peso:</span>
                        <span className="text-gray-900">
                          {material.PesoMaterial}
                        </span>
                      </>
                    )}
                    {material.DimensionesMaterial && (
                      <>
                        <span className="text-gray-500">Dimensiones:</span>
                        <span className="text-gray-900">
                          {material.DimensionesMaterial}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Información de Envío */}
              {material.Envio && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-2">
                    Información de envío:
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Box className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600">
                      Envío: {material.Envio.NombreEnvio}
                    </span>
                  </div>
                </div>
              )}

              {/* Fecha de Compra */}
              {material.FechaCompraMaterial && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-2">Fecha de compra:</p>
                  <div className="text-sm text-gray-900">
                    {formatDate(material.FechaCompraMaterial)}
                  </div>
                </div>
              )}

              {/* Foto adjunta */}
              <div className="border-t pt-3">
                <p className="text-sm text-gray-500 mb-2">Archivos adjuntos:</p>
                <div className="space-y-2">
                  {material.FotoMaterial ? (
                    <div className="flex items-center gap-2 text-sm">
                      <FileImage className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">Foto del material</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 italic">
                      No hay archivos adjuntos
                    </span>
                  )}
                </div>
              </div>

              {/* Descripción y Detalles */}
              {(material.DescripcionMaterial || material.DetalleMaterial) && (
                <div className="border-t pt-3">
                  {material.DescripcionMaterial && (
                    <>
                      <p className="text-sm text-gray-500 mb-1">Descripción:</p>
                      <p className="text-sm text-gray-700 mb-2">
                        {material.DescripcionMaterial}
                      </p>
                    </>
                  )}
                  {material.DetalleMaterial && (
                    <>
                      <p className="text-sm text-gray-500 mb-1">
                        Detalles adicionales:
                      </p>
                      <p className="text-sm text-gray-700">
                        {material.DetalleMaterial}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-red-600">
            Esta acción no se puede deshacer y eliminará permanentemente todos
            los archivos asociados.
          </p>
        </div>

        {/* Botones */}
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
            onClick={onConfirm}
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
                <span>Eliminando</span>
              </>
            ) : (
              "Eliminar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialDeleteModal;
