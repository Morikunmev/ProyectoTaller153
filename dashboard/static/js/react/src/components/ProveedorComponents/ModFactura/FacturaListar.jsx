import React from "react";

const FacturaListar = () => {
  const envios = [
    {
      destino: "Lima",
      fecha: "2024-01-01",
      remitente: "Juan Pérez",
      direccion: "Av. Principal 123",
    },
    {
      destino: "Arequipa",
      fecha: "2024-01-02",
      remitente: "María García",
      direccion: "Jr. Secundario 456",
    },
  ];

  return (
    <div className="p-6">
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3">Destino</th>
            <th className="p-3">Fecha</th>
            <th className="p-3">Remitente</th>
            <th className="p-3">Dirección</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {envios.map((envio, index) => (
            <tr key={index} className="border-t">
              <td className="p-3">{envio.destino}</td>
              <td className="p-3">{envio.fecha}</td>
              <td className="p-3">{envio.remitente}</td>
              <td className="p-3">{envio.direccion}</td>
              <td className="p-3">
                <button className="text-blue-600 mr-2">Editar</button>
                <button className="text-red-600">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FacturaListar;
