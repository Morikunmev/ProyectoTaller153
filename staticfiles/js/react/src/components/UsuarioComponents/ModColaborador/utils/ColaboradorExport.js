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
      const response = await fetch("/api/colaboradores/exportar-excel/", {
        method: "GET", 
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
      });
   
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al generar el Excel");
      }
   
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Colaboradores_${new Date().toLocaleDateString()}.xlsx`;
   
      // Trigger descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   
      // Limpiar 
      window.URL.revokeObjectURL(url);
   
      return true;
    } catch (error) {
      console.error("Error en la exportación:", error);
      throw error;
    }
   };