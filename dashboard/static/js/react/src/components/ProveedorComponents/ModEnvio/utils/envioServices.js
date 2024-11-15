export const obtenerTiempoDetallado = async (envioId) => {
    try {
      console.log('⏳ Iniciando fetch para envío:', envioId);
      const url = `/api/envio/tiempo-detallado/${envioId}/`;
      console.log('🌐 URL:', url);
      
      const response = await fetch(url);
      console.log('📨 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener tiempo detallado');
      }
      
      return {
        dias: parseInt(data.dias) || 0,
        horas: parseInt(data.horas) || 0,
        minutos: parseInt(data.minutos) || 0,
        segundos: parseInt(data.segundos) || 0,
        texto_pausa: data.texto_pausa || null
      };
    } catch (error) {
      console.error('❌ Error en obtenerTiempoDetallado:', error);
      throw error;
    }
  };