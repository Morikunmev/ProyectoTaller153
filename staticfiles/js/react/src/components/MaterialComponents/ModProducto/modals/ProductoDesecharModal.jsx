import React from "react";
import { X } from "lucide-react";

const ProductoDesecharModal = ({ isOpen, onClose, onDesechar, producto }) => {
 const [cantidad, setCantidad] = React.useState(1);
 const [motivo, setMotivo] = React.useState('');

 if (!isOpen) return null;

 const handleSubmit = (e) => {
   e.preventDefault();
   onDesechar(producto.id, { cantidad, motivo });
 };

 return (
   <div className="fixed inset-0 z-50 flex items-center justify-center">
     <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
     <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative">
       <div className="flex items-center justify-between mb-4">
         <h3 className="text-lg font-semibold">Desechar Producto</h3>
         <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
           <X className="h-5 w-5" />
         </button>
       </div>

       <form onSubmit={handleSubmit} className="space-y-4">
         <div>
           <label className="text-sm font-medium block mb-1">
             Cantidad a desechar (máx. {producto?.StockProductoActual})
           </label>
           <input
             type="number"
             min="1"
             max={producto?.StockProductoActual}
             value={cantidad}
             onChange={(e) => setCantidad(parseInt(e.target.value))}
             className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500"
             required
           />
         </div>

         <div>
           <label className="text-sm font-medium block mb-1">
             Motivo del desecho
           </label>
           <textarea
             value={motivo}
             onChange={(e) => setMotivo(e.target.value)}
             className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500"
             rows="3"
             placeholder="Explique el motivo del desecho..."
             required
           />
         </div>

         <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
           <p>
             Esta acción desechará {cantidad} unidad(es) del producto "{producto?.NombreProducto}". 
             Esta operación no se puede deshacer.
           </p>
         </div>

         <div className="flex justify-end space-x-2 pt-4">
           <button
             type="button"
             onClick={onClose}
             className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
           >
             Cancelar
           </button>
           <button
             type="submit"
             className="px-4 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
           >
             Desechar
           </button>
         </div>
       </form>
     </div>
   </div>
 );
};

export default ProductoDesecharModal;