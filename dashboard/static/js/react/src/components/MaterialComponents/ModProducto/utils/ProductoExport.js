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
      // Get initial data
      const getDataResponse = await fetch("/api/producto/listar/", {
        method: "GET",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });
  
      if (!getDataResponse.ok) throw new Error("Error al obtener los datos");
  
      // Generate Excel
      const response = await fetch("/api/productos/exportar-excel/", {
        method: "GET",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });
  
      if (!response.ok) throw new Error("Error al generar el Excel");
  
      // Get filename from headers
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "Productos.xlsx";
      if (contentDisposition?.includes("attachment")) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches?.[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }
  
      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
  
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  
      return true;
    } catch (error) {
      console.error("Error en la exportación:", error);
      throw new Error("Error al exportar a Excel: " + error.message);
    }
  };