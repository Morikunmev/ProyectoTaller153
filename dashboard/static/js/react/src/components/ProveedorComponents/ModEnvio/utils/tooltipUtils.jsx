import React, { useState, useEffect } from "react";
import { obtenerTiempoDetallado } from "./envioServices";

export const TiempoTooltip = ({ envioId, envioRecibido }) => {
  const [tiempoDetallado, setTiempoDetallado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!show) return;

      try {
        setLoading(true);
        const response = await obtenerTiempoDetallado(envioId);
        setTiempoDetallado(response);
      } catch (err) {
        console.error("Error:", err);
        setError("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    // Solo hacemos el fetch una vez cuando el mouse entra
    if (show && !tiempoDetallado) {
      fetchData();
    }

    return () => {
      if (!show) {
        setTiempoDetallado(null);
        setError(null);
      }
    };
  }, [envioId, show]);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <div
        className="w-full h-full"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {show && (
          <div className="absolute z-50 w-48 p-3 bg-gray-900 text-white rounded-lg shadow-xl -translate-y-full -translate-x-1/4 -mt-2">
            {loading ? (
              <p className="text-center text-sm">Cargando...</p>
            ) : error ? (
              <p className="text-center text-red-400 text-sm">{error}</p>
            ) : (
              tiempoDetallado && (
                <div className="space-y-1">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-400">Días:</span>
                    <span className="text-right">{tiempoDetallado.dias}</span>
                    <span className="text-gray-400">Horas:</span>
                    <span className="text-right">{tiempoDetallado.horas}</span>
                    <span className="text-gray-400">Minutos:</span>
                    <span className="text-right">
                      {tiempoDetallado.minutos}
                    </span>
                    <span className="text-gray-400">Segundos:</span>
                    <span className="text-right">
                      {tiempoDetallado.segundos}
                    </span>
                  </div>
                  {envioRecibido && (
                    <div className="mt-2 text-center text-xs text-gray-400">
                      Tiempo pausado
                    </div>
                  )}
                </div>
              )
            )}
            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
          </div>
        )}
      </div>
    </div>
  );
};
