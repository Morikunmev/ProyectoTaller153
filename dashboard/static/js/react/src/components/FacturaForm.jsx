import React from 'react';

const EnvioTable = () => {
    // Datos de ejemplo - podrías reemplazar esto con tus datos reales
    const envios = [
        {
            destino: 'Lima',
            fecha: '2024-01-01',
            remitente: 'Juan Pérez',
            direccion: 'Av. Principal 123'
        },
        {
            destino: 'Arequipa',
            fecha: '2024-01-02',
            remitente: 'María García',
            direccion: 'Jr. Secundario 456'
        }
    ];

    return (
        <div className="p-6">
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Destino
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Remitente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dirección
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {envios.map((envio, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {envio.destino}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {envio.fecha}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {envio.remitente}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {envio.direccion}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-blue-600 hover:text-blue-900 mr-2">
                                        Editar
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EnvioTable;