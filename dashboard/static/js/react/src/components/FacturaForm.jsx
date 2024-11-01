import React, { useState } from 'react';

const FacturaForm = () => {
    const [facturaData, setFacturaData] = useState({
        numero: '',
        fecha: '',
        monto: '',
        descripcion: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Factura submitted:', facturaData);
    };

    const handleChange = (e) => {
        setFacturaData({
            ...facturaData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Número de Factura
                    </label>
                    <input
                        type="text"
                        name="numero"
                        value={facturaData.numero}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Fecha
                    </label>
                    <input
                        type="date"
                        name="fecha"
                        value={facturaData.fecha}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Monto
                    </label>
                    <input
                        type="number"
                        name="monto"
                        value={facturaData.monto}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Descripción
                    </label>
                    <textarea
                        name="descripcion"
                        value={facturaData.descripcion}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Guardar Factura
                </button>
            </form>
        </div>
    );
};

export default FacturaForm;