import React, { useState } from 'react';

const EnvioForm = () => {
    const [formData, setFormData] = useState({
        destino: '',
        fecha: '',
        remitente: '',
        direccion: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Envío submitted:', formData);
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Destino
                    </label>
                    <input
                        type="text"
                        name="destino"
                        value={formData.destino}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Fecha de Envío
                    </label>
                    <input
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Remitente
                    </label>
                    <input
                        type="text"
                        name="remitente"
                        value={formData.remitente}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Dirección
                    </label>
                    <textarea
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Guardar Envío
                </button>
            </form>
        </div>
    );
};

export default EnvioForm;