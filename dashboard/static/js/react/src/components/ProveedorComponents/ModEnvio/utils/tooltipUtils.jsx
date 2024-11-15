import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export const TiempoTooltip = ({ envioId, envioRecibido }) => {
  const [tiempoDetallado, setTiempoDetallado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/envio/tiempo-detallado/${envioId}/`);
      const data = await response.json();
      setTiempoDetallado(data);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && !tiempoDetallado && !envioRecibido) {  // Solo fetch si no está recibido
      fetchData();
    }
  }, [show]);

  // No renderizar nada si está recibido
  if (envioRecibido) {
    return null;
  }

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full z-10"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {show && !envioRecibido && (  // Solo mostrar tooltip si no está recibido
        <div 
          className="absolute z-[99999] w-32 p-2 bg-gray-900 text-white rounded-lg shadow-xl left-0 -top-2
                     transition-all duration-200 ease-in-out transform -translate-y-full"
          style={{
            opacity: show ? 1 : 0,
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-1">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <p className="text-center text-[10px] text-gray-400">Cargando...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 text-[10px] py-1">
              <p>{error}</p>
              <button 
                onClick={fetchData}
                className="mt-1 text-[10px] text-blue-400 hover:text-blue-300"
              >
                Reintentar
              </button>
            </div>
          ) : (
            tiempoDetallado && (
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <span className="text-gray-400">Días:</span>
                <span className="text-right">{tiempoDetallado.dias}</span>
                <span className="text-gray-400">Horas:</span>
                <span className="text-right">{tiempoDetallado.horas}</span>
                <span className="text-gray-400">Minutos:</span>
                <span className="text-right">{tiempoDetallado.minutos}</span>
                <span className="text-gray-400">Segundos:</span>
                <span className="text-right">{tiempoDetallado.segundos}</span>
              </div>
            )
          )}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-4 -bottom-1"></div>
        </div>
      )}
    </div>
  );
};