import React, { useState } from 'react';

const EnvioForm = () => {
    const [formData, setFormData] = useState({
        destino: '',
        fecha: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Formulario de Envío
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Ingresa los detalles de tu envío
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Destino
                        </label>
                        <input
                            type="text"
                            value={formData.destino}
                            onChange={(e) => setFormData({...formData, destino: e.target.value})}
                            className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2 transition duration-150 ease-in-out"
                            placeholder="Ingresa el destino"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Fecha
                        </label>
                        <input
                            type="date"
                            value={formData.fecha}
                            onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                            className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2 transition duration-150 ease-in-out"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        >
                            Enviar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnvioForm;