import React from "react";
import { UserCircle } from "lucide-react";

const ProveedorCard = ({ proveedor }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
      {/* Contenedor de la imagen */}
      <div className="relative w-full h-48 bg-gray-100">
        {proveedor.FotoProveedor ? (
          <img
            src={proveedor.FotoProveedor}
            alt={proveedor.NombreProveedor}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserCircle className="w-20 h-20 text-gray-400" />
          </div>
        )}
      </div>

      {/* Información del proveedor */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">
          {proveedor.NombreProveedor}
        </h3>
        <p className="text-gray-500 text-sm mb-2">{proveedor.MarcaProveedor}</p>

        <div className="text-sm text-gray-600">
          <p>{proveedor.RutProveedor}</p>
          <p>
            {[
              proveedor.CiudadProveedor,
              proveedor.RegionProveedor,
              proveedor.PaisProveedor,
            ]
              .filter(Boolean)
              .join(", ") || "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProveedorCard;
