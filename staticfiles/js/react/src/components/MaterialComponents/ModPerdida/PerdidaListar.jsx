import React, { useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Pencil,
  FileText,
  LayoutGrid,
  List,
  AlertCircle,
  Loader2,
} from "lucide-react";
import PaginacionModPerdida from "./PaginacionModPerdida";
import usePerdidaState from "./hooks/usePerdidaState";
import PerdidaRestablecerModal from "./modals/PerdidaRestablecerModal";
import PerdidaUpdateModal from "./modals/PerdidaUpdateModal";
import PerdidaGrid from "./layout/PerdidaGrid";

// Componente para badge de estado
const StateBadge = ({ children, type = "default" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-700",
    warning: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${styles[type]}`}>
      {children}
    </span>
  );
};

// Componente para el header con título y contador
const Header = ({ count }) => (
  <div className="flex items-center gap-4 mb-6">
    <h1 className="text-2xl font-bold text-gray-900">Módulo Pérdidas</h1>
    <StateBadge>{count} Pérdidas</StateBadge>
  </div>
);
const StatsHeader = ({ perdidas }) => {
  const totalValue = useMemo(
    () =>
      perdidas.reduce((sum, perdida) => sum + Number(perdida.valor_total), 0),
    [perdidas]
  );

  return (
    <div className="flex items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Módulo Pérdidas</h1>
      <div className="flex items-center gap-2">
        <StateBadge>
          {perdidas.length} {perdidas.length === 1 ? "Pérdida" : "Pérdidas"}
        </StateBadge>
        <StateBadge type="warning">
          Total: ${totalValue.toLocaleString("es-CL")}
        </StateBadge>
      </div>
    </div>
  );
};

// Componente para el toggle de vista
const ViewToggle = ({ isGridView, onViewChange }) => (
  <div className="bg-white border rounded-lg shadow-sm p-1 flex gap-1">
    <button
      onClick={() => onViewChange(false)}
      className={`p-1.5 rounded flex items-center gap-1 transition-all duration-200 ${
        !isGridView
          ? "bg-blue-50 text-blue-600"
          : "text-gray-500 hover:bg-gray-50"
      }`}
      title="Vista de lista"
    >
      <List className="w-4 h-4" />
    </button>
    <button
      onClick={() => onViewChange(true)}
      className={`p-1.5 rounded flex items-center gap-1 transition-all duration-200 ${
        isGridView
          ? "bg-blue-50 text-blue-600"
          : "text-gray-500 hover:bg-gray-50"
      }`}
      title="Vista de cuadrícula"
    >
      <LayoutGrid className="w-4 h-4" />
    </button>
  </div>
);

// Componente para la barra de búsqueda y exportación
const SearchAndExport = ({
  searchTerm,
  onSearch,
  onExport,
  isGridView,
  onViewChange,
}) => (
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
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>

    <div className="flex items-center gap-4">
      <ViewToggle isGridView={isGridView} onViewChange={onViewChange} />
      <button
        onClick={onExport}
        className="group bg-green-600 text-white px-4 py-2 rounded-lg 
                  hover:bg-green-700 active:bg-green-800
                  transition-all duration-200 ease-out 
                  hover:shadow-lg active:shadow-none
                  transform active:scale-95 max-[790px]:w-full"
      >
        <span className="flex items-center justify-center">
          <FileText className="w-4 h-4 mr-2" />
          <span>Generar Excel</span>
        </span>
      </button>
    </div>
  </div>
);

// Componente para los badges de productos
const ProductStats = ({ stats, selectedProduct, onProductClick }) => (
  <div className="flex flex-wrap gap-2 mb-6">
    {stats.map(({ name, count, totalQuantity, totalValue }) => (
      <button
        key={name}
        onClick={() => onProductClick(name)}
        className={`px-3 py-1 rounded-full text-sm transition-all duration-200 
          ${
            selectedProduct === name
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
      >
        <span className="font-medium">{count}</span> {name}{" "}
        <span className="text-xs ml-1 opacity-75">
          ({totalQuantity} unidades - ${totalValue.toLocaleString()})
        </span>
      </button>
    ))}
  </div>
);

// Componente para los botones de acción
const ActionButtons = ({ perdida, onEdit, onRestablecer, isRestabling }) => (
  <div className="flex justify-center gap-2">
    <button
      type="button"
      onClick={() => onEdit(perdida)}
      className="p-1 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs
                hover:bg-blue-50 rounded transition-all duration-200"
    >
      <Pencil className="w-3 h-3" />
      <span>Editar</span>
    </button>
    <button
      type="button"
      onClick={() => onRestablecer(perdida)}
      disabled={isRestabling}
      className="p-1 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs
                hover:bg-blue-50 rounded transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RefreshCw className="w-3 h-3" />
      <span>Restablecer</span>
    </button>
  </div>
);

// Componente para el contenido de la tabla
const TableContent = ({ perdidas, onEdit, onRestablecer, isRestabling }) => {
  // Agrupar pérdidas por fecha
  const groupedPerdidas = perdidas.reduce((groups, perdida) => {
    const date = new Date(perdida.fecha_registro).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(perdida);
    return groups;
  }, {});

  // Colores para alternar entre grupos de fechas
  const groupColors = {
    header: [
      "bg-blue-50 border-blue-100",
      "bg-purple-50 border-purple-100",
      "bg-green-50 border-green-100",
      "bg-amber-50 border-amber-100",
      "bg-pink-50 border-pink-100",
    ],
    row: [
      "hover:bg-blue-50/70",
      "hover:bg-purple-50/70",
      "hover:bg-green-50/70",
      "hover:bg-amber-50/70",
      "hover:bg-pink-50/70",
    ],
  };

  return (
    <table className="w-full min-w-[1200px]">
      <thead>
        <tr className="text-left text-gray-500 text-xs border-b bg-gray-50">
          <th className="p-2 font-medium">ID</th>
          <th className="p-2 font-medium">NOMBRE</th>
          <th className="p-2 font-medium">PRODUCTO</th>
          <th className="p-2 font-medium">CANTIDAD</th>
          <th className="p-2 font-medium">VALOR UNITARIO</th>
          <th className="p-2 font-medium">VALOR TOTAL</th>
          <th className="p-2 font-medium">MOTIVO</th>
          <th className="p-2 font-medium">DESCRIPCIÓN</th>
          <th className="p-2 font-medium">USUARIO</th>
          <th className="p-2 font-medium">FECHA REGISTRO</th>
          <th className="p-2 font-medium">ÚLTIMA MODIFICACIÓN</th>
          <th className="p-2 font-medium text-center">ACCIONES</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {Object.entries(groupedPerdidas).map(
          ([date, perdidasGroup], groupIndex) => {
            const colorIndex = groupIndex % groupColors.header.length;
            return (
              <React.Fragment key={date}>
                {/* Encabezado del grupo con color */}
                <tr className={`${groupColors.header[colorIndex]} border-y`}>
                  <td colSpan="12" className="p-2 font-medium text-gray-700">
                    {date}
                  </td>
                </tr>
                {/* Filas de datos con color de hover correspondiente */}
                {perdidasGroup.map((perdida) => (
                  <tr
                    key={perdida.id}
                    className={`border-b ${groupColors.row[colorIndex]} transition-colors duration-150`}
                  >
                    <td className="p-2 font-medium text-gray-900">
                      #{perdida.id}
                    </td>
                    <td className="p-2">{perdida.nombre}</td>
                    <td className="p-2">{perdida.producto.nombre}</td>
                    <td className="p-2">{perdida.cantidad}</td>
                    <td className="p-2">
                      ${perdida.valor_unitario.toLocaleString()}
                    </td>
                    <td className="p-2">
                      ${perdida.valor_total.toLocaleString()}
                    </td>
                    <td className="p-2">
                      <StateBadge type="warning">{perdida.motivo}</StateBadge>
                    </td>
                    <td
                      className="p-2 max-w-[200px] truncate"
                      title={perdida.descripcion}
                    >
                      {perdida.descripcion || "Sin descripción"}
                    </td>
                    <td className="p-2">{perdida.usuario.nombre}</td>
                    <td className="p-2 whitespace-nowrap">
                      {new Date(perdida.fecha_registro).toLocaleString()}
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      {new Date(perdida.ultima_modificacion).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <ActionButtons
                        perdida={perdida}
                        onEdit={onEdit}
                        onRestablecer={onRestablecer}
                        isRestabling={isRestabling}
                      />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          }
        )}
      </tbody>
    </table>
  );
};

const PerdidaListar = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isGridView, setIsGridView] = useState(false);

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
    handlePerdidaUpdated,
    setUpdateModalOpen,
    setPerdidaToUpdate,
  } = usePerdidaState();
  const productStats = useMemo(() => {
    const stats = filteredPerdidas.reduce((acc, perdida) => {
      const productName = perdida.producto.nombre;
      if (!acc[productName]) {
        acc[productName] = {
          count: 0,
          totalQuantity: 0,
          totalValue: 0, // Agregado para el valor total
        };
      }
      acc[productName].count++;
      acc[productName].totalQuantity += perdida.cantidad;
      acc[productName].totalValue += perdida.cantidad * perdida.valor_unitario; // Calcula el total
      return acc;
    }, {});

    return Object.entries(stats).map(
      ([name, { count, totalQuantity, totalValue }]) => ({
        name,
        count,
        totalQuantity,
        totalValue,
      })
    );
  }, [filteredPerdidas]);

  const displayedPerdidas = useMemo(() => {
    if (!selectedProduct) return currentPerdidas;
    return currentPerdidas.filter(
      (perdida) => perdida.producto.nombre === selectedProduct
    );
  }, [currentPerdidas, selectedProduct]);

  const handleViewChange = (gridView) => {
    setIsGridView(gridView);
  };

  return (
    <main className="relative">
      <div
        className={`transition-all duration-300 ease-in-out mt-16 ${
          updateModalOpen ? "pr-[448px]" : ""
        }`}
      >
        <div className="max-w-full mx-auto p-6">
          <StatsHeader perdidas={filteredPerdidas} />

          <SearchAndExport
            searchTerm={searchTerm}
            onSearch={handleSearch}
            onExport={handleExportClick}
            isGridView={isGridView}
            onViewChange={handleViewChange}
          />

          <ProductStats
            stats={productStats}
            selectedProduct={selectedProduct}
            onProductClick={(name) =>
              setSelectedProduct((prev) => (prev === name ? null : name))
            }
          />

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {error ? (
              <div className="text-center p-8 text-red-500 flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-lg">{error}</p>
              </div>
            ) : loading ? (
              <div className="text-center p-8 text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
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
                    className={`transition-all duration-300 ease-in-out transform
              ${
                isChangingView || isSearching
                  ? "opacity-0 scale-95"
                  : "opacity-100 scale-100"
              }`}
                  >
                    {isGridView ? (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4
                    transform transition-all duration-300 ease-in-out"
                      >
                        {displayedPerdidas.map((perdida) => (
                          <PerdidaGrid
                            key={perdida.id}
                            perdida={perdida}
                            onEdit={() => handleUpdateModalOpen(perdida)}
                            onRestablecer={() => handleRestablecer(perdida)}
                            isRestabling={isRestabling}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto transform transition-all duration-300 ease-in-out">
                        <TableContent
                          perdidas={displayedPerdidas}
                          onEdit={handleUpdateModalOpen}
                          onRestablecer={handleRestablecer}
                          isRestabling={isRestabling}
                        />
                      </div>
                    )}
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
