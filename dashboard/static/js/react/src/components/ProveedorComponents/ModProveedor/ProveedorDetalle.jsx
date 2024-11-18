import React, { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

const ProveedorDetalle = ({ onBack }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Aquí irá la lógica para guardar en la base de datos
      console.log("Guardando...", { title, content });
      // Simular tiempo de guardado
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onBack(); // Volver a la vista principal después de guardar
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header del Editor */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Detalle Proveedor</h1>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white
               transition-all duration-200 
               ${
                 loading
                   ? "bg-blue-400 cursor-not-allowed"
                   : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
               }`}
        >
          <Save className="w-4 h-4" />
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {/* Formulario del Editor */}
      <form onSubmit={handleSave} className="p-6 space-y-6">
        {/* Campo Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título de la página
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Ingrese el título..."
          />
        </div>

        {/* Campo Contenido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenido
          </label>
          <div className="border rounded-lg p-4 bg-gray-50">
            {/* Barra de herramientas del editor (simulada) */}
            <div className="flex gap-2 mb-4 pb-4 border-b">
              <button
                type="button"
                className="p-2 hover:bg-gray-200 rounded"
                title="Negrita"
              >
                B
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-200 rounded italic"
                title="Cursiva"
              >
                I
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-200 rounded underline"
                title="Subrayado"
              >
                U
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows={15}
              className="w-full px-4 py-2 border rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ingrese el contenido de la página..."
            />
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-sm text-gray-500">
          <p>* Los cambios se guardarán automáticamente</p>
          <p>* Use las herramientas de formato para mejorar el contenido</p>
        </div>
      </form>
    </div>
  );
};

export default ProveedorDetalle;
