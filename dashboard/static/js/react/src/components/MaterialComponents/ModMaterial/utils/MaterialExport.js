// src/components/MaterialComponents/ModMaterial/utils/MaterialExport.js

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const exportToExcel = async () => {
  try {
    // Primera petición para obtener los datos
    const getDataResponse = await fetch("/api/material/listar/", {
      method: "GET",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
    });

    if (!getDataResponse.ok) {
      throw new Error("Error al obtener los datos");
    }

    // Petición para generar el Excel
    const response = await fetch("/api/materiales/exportar-excel/", {
      method: "GET",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error al generar el Excel");
    }

    // Obtener el blob del archivo
    const blob = await response.blob();

    // Crear URL del blob
    const url = window.URL.createObjectURL(blob);

    // Crear elemento de descarga
    const link = document.createElement("a");
    link.href = url;
    link.download = `Materiales_${new Date().toISOString().slice(0, 10)}.xlsx`;

    // Añadir al DOM, hacer clic y limpiar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar el objeto URL
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error en la exportación:", error);
    throw error;
  }
};
