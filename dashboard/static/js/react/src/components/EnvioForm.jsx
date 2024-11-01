import React, { useState } from 'react';

const EnvioForm = () => {
    const [formData, setFormData] = useState({
        destino: '',
        fecha: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí manejarías la lógica del envío
        console.log('Form submitted:', formData);
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
                        value={formData.destino}
                        onChange={(e) => setFormData({...formData, destino: e.target.value})}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
};

export default EnvioForm;