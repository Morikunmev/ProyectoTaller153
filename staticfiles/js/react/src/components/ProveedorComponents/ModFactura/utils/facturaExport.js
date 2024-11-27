// ModFactura/utils/facturaExport.js

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
    // Primera petición para obtener los datos necesarios
    const getDataResponse = await fetch("/api/factura/listar/", {
      method: "GET",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    });

    if (!getDataResponse.ok) {
      throw new Error("Error al obtener los datos");
    }

    // Petición para generar el Excel
    const response = await fetch("/api/facturas/exportar-excel/", {
      method: "GET",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    });

    if (!response.ok) {
      throw new Error("Error al generar el Excel");
    }

    // Obtener el nombre del archivo de las cabeceras
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "Facturas.xlsx";
    if (contentDisposition && contentDisposition.indexOf("attachment") !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, "");
      }
    }

    // Crear y descargar el archivo
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Limpieza
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return true;
  } catch (error) {
    console.error("Error en la exportación:", error);
    throw new Error("Error al exportar a Excel: " + error.message);
  }
};
