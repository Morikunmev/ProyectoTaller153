import React, { useState } from 'react';

const ProveedorForm = () => {
    const [proveedorData, setProveedorData] = useState({
        nombre: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Proveedor submitted:', proveedorData);
    };

    const handleChange = (e) => {
        setProveedorData({
            ...proveedorData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Nombre del Proveedor
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={proveedorData.nombre}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        RUC
                    </label>
                    <input
                        type="text"
                        name="ruc"
                        value={proveedorData.ruc}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Dirección
                    </label>
                    <input
                        type="text"
                        name="direccion"
                        value={proveedorData.direccion}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Teléfono
                    </label>
                    <input
                        type="tel"
                        name="telefono"
                        value={proveedorData.telefono}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={proveedorData.email}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Guardar Proveedor
                </button>
            </form>
        </div>
    );
};

export default ProveedorForm;