import React from "react";
import {
  Calendar,
  FileText,
  Pencil,
  Trash2,
  Building2,
  FileUp,
} from "lucide-react";

const FacturaGrid = ({ factura, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha no disponible";
      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error al formatear la fecha:", error, dateString);
      return "Fecha no disponible";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 w-64">
      {/* Imagen/Preview */}
      <div className="w-full h-36 bg-gray-100 relative">
        {factura.FotoFactura ? (
          <img
            src={factura.FotoFactura}
            alt={`Factura de ${factura.Proveedor.NombreProveedor}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Badge con número de factura */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            #{factura.id}
          </span>
        </div>

        {/* Indicador de documento adjunto */}
        {factura.DocumentoFactura && (
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
              <FileUp className="w-3 h-3" />
              Doc
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-2.5">
        {/* Nombre del Proveedor como título */}
        <div className="mb-2">
          <div className="flex items-center gap-1 text-gray-800">
            <Building2 className="w-4 h-4" />
            <h3
              className="font-medium text-sm truncate"
              title={factura.Proveedor.NombreProveedor}
            >
              {factura.Proveedor.NombreProveedor}
            </h3>
          </div>
        </div>

        {/* Fecha de Emisión */}
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(factura.FechaEmision)}</span>
        </div>

        {/* Asset ID si existe */}
        {factura.documento_asset_id && (
          <div
            className="text-xs text-gray-500 mb-2 truncate"
            title={factura.documento_asset_id}
          >
            Asset ID: {factura.documento_asset_id}
          </div>
        )}

        {/* Botones */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1 p-1 text-xs text-blue-600 hover:text-blue-800
                     border border-blue-600 hover:border-blue-800 rounded-lg
                     transition-all duration-200 ease-in-out hover:bg-blue-50"
          >
            <Pencil className="w-3 h-3" />
            <span>Editar</span>
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1 p-1 text-xs text-red-600 hover:text-red-800
                     border border-red-600 hover:border-red-800 rounded-lg
                     transition-all duration-200 ease-in-out hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacturaGrid;
