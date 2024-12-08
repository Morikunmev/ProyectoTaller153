import React from "react";
import {
  Mail,
  Phone,
  User,
  Hash,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";

const AdminGrid = ({
  admin,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Imagen/Preview */}
      <div className="w-full h-36 bg-gray-100 relative flex items-center justify-center">
        {admin.foto ? (
          <img
            src={admin.foto}
            alt={`Administrador: ${admin.username}`}
            className="w-32 h-32 rounded-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Nombre de usuario y email */}
        <div className="mb-3">
          <h3
            className="font-medium text-sm truncate mb-1"
            title={admin.username}
          >
            {admin.username}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Mail className="w-3 h-3" />
            <span className="truncate" title={admin.email}>
              {admin.email}
            </span>
          </div>
        </div>

        {/* Detalles */}
        <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            <span>RUT: {admin.rut}</span>
          </div>
          {admin.telefono && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{admin.telefono}</span>
            </div>
          )}
          {admin.edad && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{admin.edad} años</span>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
            className="flex items-center justify-center gap-1 p-1.5 text-xs text-blue-600 hover:text-blue-800
                     border border-blue-600 hover:border-blue-800 rounded-lg
                     transition-all duration-200 ease-in-out hover:bg-blue-50"
          >
            <Pencil className="w-3 h-3" />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="flex items-center justify-center gap-1 p-1.5 text-xs text-red-600 hover:text-red-800
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

export default AdminGrid;