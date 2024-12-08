import React from "react";
import { AlertTriangle, FileImage, User } from "lucide-react";

const ColaboradorDeleteModal = ({
 isOpen,
 onClose,
 onConfirm,
 colaboradorId,
 isDeleting,
 colaborador,
}) => {
 return (
   <div
     className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
       isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
     }`}
   >
     {/* Overlay con transición */}
     <div
       className={`absolute inset-0 bg-black transition-opacity duration-300 ${
         isOpen ? "opacity-40" : "opacity-0" 
       }`}
       onClick={onClose}
     />

     {/* Modal con transición */}
     <div
       className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative transform transition-all duration-300 ${
         isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
       }`}
     >
       {/* Header con ícono de advertencia */}
       <div className="flex items-center gap-3 mb-4">
         <div className="flex-shrink-0">
           <AlertTriangle className="h-6 w-6 text-red-500" />
         </div>
         <h3 className="text-lg font-semibold text-gray-900">
           Confirmar Eliminación
         </h3>
       </div>

       {/* Contenido detallado */}
       <div className="space-y-4">
         <p className="text-gray-600">
           ¿Estás seguro que deseas eliminar este colaborador? Esta acción tendrá las siguientes consecuencias:
         </p>

         {/* Nueva sección de advertencias sobre relaciones */}
         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
           <h4 className="text-sm font-medium text-yellow-800 mb-2">
             Importante: Efectos en registros relacionados
           </h4>
           <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
             <li>Las <strong>Ventas</strong> registradas por este colaborador mantendrán sus registros pero el campo Usuario quedará como NULL</li>
             <li>Las <strong>Pérdidas</strong> registradas por este colaborador mantendrán sus registros pero el campo Usuario quedará como NULL</li>
             <li>Los <strong>Clientes</strong> registrados por este colaborador mantendrán sus registros pero el campo Usuario quedará como NULL</li>
             <li>Los registros históricos y transacciones se mantendrán pero sin referencia al colaborador</li>
           </ul>
         </div>

         {colaborador && (
           <div className="bg-gray-50 p-4 rounded-lg space-y-3">
             <div className="grid grid-cols-2 gap-2 text-sm">
               <span className="text-gray-500">ID:</span>
               <span className="font-medium text-gray-900">#{colaboradorId}</span>

               <span className="text-gray-500">Usuario:</span>
               <span className="font-medium text-gray-900">
                 {colaborador.username}
               </span>

               <span className="text-gray-500">Email:</span>
               <span className="font-medium text-gray-900">
                 {colaborador.email}
               </span>

               <span className="text-gray-500">RUT:</span>
               <span className="font-medium text-gray-900">
                 {colaborador.rut}
               </span>

               {colaborador.telefono && (
                 <>
                   <span className="text-gray-500">Teléfono:</span>
                   <span className="font-medium text-gray-900">
                     {colaborador.telefono}
                   </span>
                 </>
               )}

               {colaborador.edad && (
                 <>
                   <span className="text-gray-500">Edad:</span>
                   <span className="font-medium text-gray-900">
                     {colaborador.edad} años
                   </span>
                 </>
               )}
             </div>

             {/* Foto adjunta */}
             <div className="border-t pt-3">
               <p className="text-sm text-gray-500 mb-2">Archivos adjuntos:</p>
               <div className="space-y-2">
                 {colaborador.foto ? (
                   <div className="flex items-center gap-2 text-sm">
                     <FileImage className="h-4 w-4 text-blue-500" />
                     <span className="text-gray-600">Foto de perfil</span>
                   </div>
                 ) : (
                   <span className="text-sm text-gray-500 italic">
                     No hay archivos adjuntos
                   </span>
                 )}
               </div>
             </div>
           </div>
         )}

         <p className="text-sm text-red-600 font-medium">
           Esta acción no se puede deshacer. Se eliminará permanentemente la información 
           personal del colaborador y todas sus referencias en el sistema quedarán como NULL.
         </p>
       </div>

       {/* Botones */}
       <div className="flex justify-center gap-4 px-4 mt-6">
         <button
           onClick={onClose}
           disabled={isDeleting}
           className="w-full px-6 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg 
                    hover:bg-gray-50 transition-colors duration-200 
                    disabled:opacity-50 disabled:cursor-not-allowed"
         >
           Cancelar
         </button>

         <button
           onClick={onConfirm}
           disabled={isDeleting}
           className="w-full px-6 py-2.5 text-white bg-red-600 rounded-lg
                    hover:bg-red-700 transition-all duration-200 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
         >
           {isDeleting ? (
             <>
               <svg
                 className="animate-spin h-4 w-4"
                 xmlns="http://www.w3.org/2000/svg"
                 fill="none"
                 viewBox="0 0 24 24"
               >
                 <circle
                   className="opacity-25"
                   cx="12"
                   cy="12"
                   r="10"
                   stroke="currentColor"  
                   strokeWidth="4"
                 />
                 <path
                   className="opacity-75"
                   fill="currentColor"
                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                 />
               </svg>
               <span>Eliminando</span>
             </>
           ) : (
             "Eliminar"
           )}
         </button>
       </div>
     </div>
   </div>
 );
};

export default ColaboradorDeleteModal;