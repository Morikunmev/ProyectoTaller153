// components/FacturaDetalle.jsx
import React from "react";

const FacturaDetalle = ({ facturas, loading, error }) => {
  if (loading) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Detalle de Facturas
      </h1>
      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        {facturas.map((factura) => (
          <div key={factura.id} className="mb-6 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              Factura #{factura.NumeroFactura}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">ID: {factura.id}</p>
                <p className="text-gray-600">
                  Fecha Emisión: {factura.FechaEmision}
                </p>
                <p className="text-gray-600">
                  Proveedor: {factura.Proveedor.NombreProveedor}
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                {factura.FotoFactura && (
                  <img
                    src={factura.FotoFactura}
                    alt="Foto Factura"
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacturaDetalle;
