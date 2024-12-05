import React, { useState, useMemo } from "react";
import { Search, RefreshCw, Pencil } from "lucide-react";
import PaginacionModPerdida from "./PaginacionModPerdida";
import usePerdidaState from "./hooks/usePerdidaState";
import PerdidaRestablecerModal from "./modals/PerdidaRestablecerModal";
import PerdidaUpdateModal from "./modals/PerdidaUpdateModal";

const PerdidaListar = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const {
    searchTerm,
    loading,
    error,
    isChangingView,
    isSearching,
    currentPerdidas,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredPerdidas,
    restablecerModalOpen,
    perdidaToRestablecer,
    isRestabling,
    updateModalOpen,
    perdidaToUpdate,
    handleSearch,
    handlePreviousPage,
    handleNextPage,
    handleExportClick,
    handleRestablecer,
    handleConfirmRestablecer,
    setRestablecerModalOpen,
    setPerdidaToRestablecer,
    handleUpdateModalOpen,
    handleUpdateModalClose,
    handlePerdidaUpdated,
    setUpdateModalOpen,
    setPerdidaToUpdate,
  } = usePerdidaState();

  // Calcular estadísticas de productos
  const productStats = useMemo(() => {
    const stats = filteredPerdidas.reduce((acc, perdida) => {
      const productName = perdida.producto.nombre;
      if (!acc[productName]) {
        acc[productName] = {
          count: 0,
          totalValue: 0,
          totalQuantity: 0,
        };
      }
      acc[productName].count++;
      // Convertir a número y sumar
      acc[productName].totalValue += Number(perdida.valor_total);
      acc[productName].totalQuantity += perdida.cantidad;
      return acc;
    }, {});

    return Object.entries(stats).map(
      ([name, { count, totalValue, totalQuantity }]) => ({
        name,
        count,
        totalValue,
        totalQuantity,
      })
    );
  }, [filteredPerdidas]);

  // Filtrar pérdidas por producto seleccionado
  const displayedPerdidas = useMemo(() => {
    if (!selectedProduct) return currentPerdidas;
    return currentPerdidas.filter(
      (perdida) => perdida.producto.nombre === selectedProduct
    );
  }, [currentPerdidas, selectedProduct]);

  const handleProductClick = (productName) => {
    setSelectedProduct((prev) => (prev === productName ? null : productName));
  };

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px]">
        <thead>
          <tr className="text-left text-gray-500 text-xs border-b bg-gray-50">
            <th className="p-1.5 font-medium">ID</th>
            <th className="p-1.5 font-medium">NOMBRE</th>
            <th className="p-1.5 font-medium">PRODUCTO</th>
            <th className="p-1.5 font-medium">CANTIDAD</th>
            <th className="p-1.5 font-medium">VALOR UNITARIO</th>
            <th className="p-1.5 font-medium">VALOR TOTAL</th>
            <th className="p-1.5 font-medium">MOTIVO</th>
            <th className="p-1.5 font-medium">DESCRIPCIÓN</th>
            <th className="p-1.5 font-medium">USUARIO</th>
            <th className="p-1.5 font-medium">FECHA REGISTRO</th>
            <th className="p-1.5 font-medium">ÚLTIMA MODIFICACIÓN</th>
            <th className="p-1.5 font-medium text-center">ACCIONES</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {displayedPerdidas.map((perdida) => (
            <tr key={perdida.id} className="border-b hover:bg-gray-50">
              <td className="p-1.5 font-medium text-gray-900">#{perdida.id}</td>
              <td className="p-1.5">{perdida.nombre}</td>
              <td className="p-1.5">{perdida.producto.nombre}</td>
              <td className="p-1.5">{perdida.cantidad}</td>
              <td className="p-1.5">
                ${perdida.valor_unitario.toLocaleString()}
              </td>
              <td className="p-1.5">${perdida.valor_total.toLocaleString()}</td>
              <td className="p-1.5">
                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  {perdida.motivo}
                </span>
              </td>
              <td
                className="p-1.5 max-w-[200px] truncate"
                title={perdida.descripcion}
              >
                {perdida.descripcion || "Sin descripción"}
              </td>
              <td className="p-1.5">{perdida.usuario.nombre}</td>
              <td className="p-1.5 whitespace-nowrap">
                {new Date(perdida.fecha_registro).toLocaleString()}
              </td>
              <td className="p-1.5 whitespace-nowrap">
                {new Date(perdida.ultima_modificacion).toLocaleString()}
              </td>
              <td className="p-1.5">
                <div className="flex justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateModalOpen(perdida)}
                    className="p-0.5 text-blue-600 hover:text-blue-800 flex items-center gap-0.5 text-xs
                            transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                    title="Editar pérdida"
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRestablecer(perdida)}
                    disabled={isRestabling}
                    className="p-0.5 text-blue-600 hover:text-blue-800 flex items-center gap-0.5 text-xs
                            transition-all duration-200 ease-in-out hover:scale-105 active:scale-95
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Restablecer pérdida"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Restablecer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <main className="relative">
      <div
        className={`transition-all duration-300 ease-in-out mt-16 ${
          updateModalOpen ? "pr-[448px]" : ""
        }`}
      >
        <div className="max-w-full mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Módulo Pérdidas
            </h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {filteredPerdidas.length} Pérdidas
            </span>
          </div>

          {/* Search and Export */}
          <div className="flex max-[790px]:flex-col justify-between items-center mb-6 max-[790px]:gap-4">
            <div className="relative w-[300px] max-[790px]:w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                        focus:outline-none focus:ring-1 focus:ring-blue-500
                        transition-colors duration-200"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-3 max-[790px]:w-full">
              <button
                onClick={handleExportClick}
                className="group relative bg-green-600 text-white px-4 py-2 rounded-lg 
                        hover:bg-green-700 active:bg-green-800
                        transition-all duration-200 ease-out 
                        hover:shadow-lg active:shadow-none
                        transform active:scale-95 max-[790px]:flex-1"
              >
                <span className="flex items-center max-[790px]:justify-center">
                  <svg
                    className="w-4 h-4 mr-2 inline-block transform transition-transform duration-200 group-hover:scale-110"
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Generar Excel</span>
                </span>
              </button>
            </div>
          </div>

          {/* Product Stats */}
          <div className="flex flex-wrap gap-2 mb-6">
            {productStats.map(({ name, count, totalValue, totalQuantity }) => (
              <button
                key={name}
                onClick={() => handleProductClick(name)}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-200 
        ${
          selectedProduct === name
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }`}
              >
                <span className="font-medium">{count}</span> {name}{" "}
                <span className="text-xs ml-1 opacity-75">
                  ($<span>{totalValue.toLocaleString()}</span>)
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {error ? (
              <div className="text-center p-8 text-red-500">
                <p className="text-lg">{error}</p>
              </div>
            ) : loading ? (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg">Cargando...</p>
              </div>
            ) : displayedPerdidas.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg">No se encontraron pérdidas</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div
                    className={`transition-opacity duration-300 ease-in-out
                             ${
                               isChangingView || isSearching
                                 ? "opacity-0"
                                 : "opacity-100"
                             }`}
                  >
                    {renderTableView()}
                  </div>
                </div>
                <div className="border-t">
                  <PaginacionModPerdida
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePreviousPage={handlePreviousPage}
                    handleNextPage={handleNextPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={filteredPerdidas.length}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <PerdidaRestablecerModal
        isOpen={restablecerModalOpen}
        onClose={() => {
          setRestablecerModalOpen(false);
          setPerdidaToRestablecer(null);
        }}
        onConfirm={handleConfirmRestablecer}
        perdidaId={perdidaToRestablecer?.id}
        isRestabling={isRestabling}
      />

      <PerdidaUpdateModal
        isOpen={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setPerdidaToUpdate(null);
        }}
        perdida={perdidaToUpdate}
        onPerdidaUpdated={handlePerdidaUpdated}
      />
    </main>
  );
};

export default PerdidaListar;
