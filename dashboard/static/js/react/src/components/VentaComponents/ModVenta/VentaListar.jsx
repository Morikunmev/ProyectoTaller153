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
import PaginacionModVenta from "./PaginacionModVenta";
import useVentaState from "./hooks/useVentaState";
import VentaUpdateModal from "./modals/VentaUpdateModal";
import VentaGrid from "./layout/VentaGrid";
import VentaRestablecerModal from "./modals/VentaRestablecerModal";

// Componente para badge de estado
const StateBadge = ({ children, type = "default" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-800",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${styles[type]}`}>
      {children}
    </span>
  );
};
const ClienteStats = ({ ventas, selectedClienteType, onClienteTypeClick }) => {
  const stats = useMemo(() => {
    return {
      eliminados: ventas.filter(
        (venta) => venta.cliente.nombre === "Cliente eliminado"
      ).length,
      no_especificados: ventas.filter(
        (venta) => venta.cliente.nombre === "Cliente no especificado"
      ).length,
      con_cliente: ventas.filter(
        (venta) =>
          !["Cliente eliminado", "Cliente no especificado"].includes(
            venta.cliente.nombre
          )
      ).length,
    };
  }, [ventas]);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onClienteTypeClick(null)}
        className={`px-3 py-1 rounded-full text-sm transition-all duration-200 
          ${
            selectedClienteType === null
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
      >
        <span className="font-medium">{ventas.length}</span> Todos
      </button>
      <button
        onClick={() => onClienteTypeClick("eliminado")}
        className={`px-3 py-1 rounded-full text-sm transition-all duration-200 
          ${
            selectedClienteType === "eliminado"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
      >
        <span className="font-medium">{stats.eliminados}</span> Clientes
        eliminados
      </button>
      <button
        onClick={() => onClienteTypeClick("no_especificado")}
        className={`px-3 py-1 rounded-full text-sm transition-all duration-200 
          ${
            selectedClienteType === "no_especificado"
              ? "bg-yellow-600 text-white hover:bg-yellow-700"
              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
          }`}
      >
        <span className="font-medium">{stats.no_especificados}</span> Sin
        cliente
      </button>
      <button
        onClick={() => onClienteTypeClick("con_cliente")}
        className={`px-3 py-1 rounded-full text-sm transition-all duration-200 
          ${
            selectedClienteType === "con_cliente"
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
      >
        <span className="font-medium">{stats.con_cliente}</span> Con cliente
      </button>
    </div>
  );
};

const StatsHeader = ({ ventas }) => {
  const totalValue = useMemo(
    () => ventas.reduce((sum, venta) => sum + Number(venta.precio_total), 0),
    [ventas]
  );

  return (
    <div className="flex items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Módulo Ventas</h1>
      <div className="flex items-center gap-2">
        <StateBadge>
          {ventas.length} {ventas.length === 1 ? "Venta" : "Ventas"}
        </StateBadge>
        <StateBadge type="success">
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
        placeholder="Buscar por nombre o cliente..."
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
    {stats.map(({ name, count, totalQuantity, totalAmount }) => (
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
          ({totalQuantity} unidades - ${totalAmount.toLocaleString()})
        </span>
      </button>
    ))}
  </div>
);

// Componente para los botones de acción
// Componente para los botones de acción
const ActionButtons = ({ venta, onEdit, onRestablecer, isRestabling }) => (
  <div className="flex justify-center gap-2">
    <button
      type="button"
      onClick={() => onEdit(venta)}
      className="p-1 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs
                hover:bg-blue-50 rounded transition-all duration-200"
    >
      <Pencil className="w-3 h-3" />
      <span>Editar</span>
    </button>
    <button
      type="button"
      onClick={() => onRestablecer(venta)}
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
const TableContent = ({ ventas, onEdit, onRestablecer, isRestabling }) => (
  <table className="w-full min-w-[1200px]">
    <thead>
      <tr className="text-left text-gray-500 text-xs border-b bg-gray-50">
        <th className="p-2 font-medium">ID</th>
        <th className="p-2 font-medium">NOMBRE</th>
        <th className="p-2 font-medium">PRODUCTO</th>
        <th className="p-2 font-medium">CLIENTE</th>
        <th className="p-2 font-medium">CANTIDAD</th>
        <th className="p-2 font-medium">PRECIO UNITARIO</th>
        <th className="p-2 font-medium">PRECIO TOTAL</th>
        <th className="p-2 font-medium">USUARIO</th>
        <th className="p-2 font-medium">FECHA VENTA</th>
        <th className="p-2 font-medium">FECHA REGISTRO</th>
        <th className="p-2 font-medium text-center">ACCIONES</th>
      </tr>
    </thead>
    <tbody className="text-sm">
      {ventas.map((venta) => (
        <tr key={venta.id} className="border-b hover:bg-gray-50">
          <td className="p-2 font-medium text-gray-900">#{venta.id}</td>
          <td className="p-2">{venta.nombre}</td>
          <td className="p-2">{venta.producto.nombre}</td>
          <td
            className={`p-2 ${
              venta.cliente.nombre === "Cliente eliminado"
                ? "text-red-600 font-medium"
                : venta.cliente.nombre === "Cliente no especificado"
                ? "text-yellow-600 font-medium"
                : ""
            }`}
          >
            {venta.cliente.nombre}
          </td>
          <td className="p-2">{venta.cantidad}</td>
          <td className="p-2">${venta.precio_venta.toLocaleString()}</td>
          <td className="p-2">${venta.precio_total.toLocaleString()}</td>
          <td className="p-2">{venta.usuario.nombre}</td>
          <td className="p-2 whitespace-nowrap">
            {new Date(venta.fecha).toLocaleString()}
          </td>
          <td className="p-2 whitespace-nowrap">
            {new Date(venta.fecha_registro).toLocaleString()}
          </td>
          <td className="p-2">
            <ActionButtons
              venta={venta}
              onEdit={onEdit}
              onRestablecer={onRestablecer}
              isRestabling={isRestabling}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const VentaListar = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isGridView, setIsGridView] = useState(false);
  const [selectedClienteType, setSelectedClienteType] = useState(null);

  const {
    searchTerm,
    loading,
    error,
    isChangingView,
    isSearching,
    currentVentas,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    filteredVentas,
    updateModalOpen,
    ventaToUpdate,
    handleSearch,
    handlePreviousPage,
    handleNextPage,
    handleExportClick,
    handleUpdateModalOpen,
    handleVentaUpdated,
    setUpdateModalOpen,
    setVentaToUpdate,
    restablecerModalOpen,
    ventaToRestablecer,
    isRestabling,
    handleRestablecer,
    handleConfirmRestablecer,
    setRestablecerModalOpen,
    setVentaToRestablecer,
  } = useVentaState();

  const productStats = useMemo(() => {
    const stats = filteredVentas.reduce((acc, venta) => {
      const productName = venta.producto.nombre;
      if (!acc[productName]) {
        acc[productName] = {
          count: 0,
          totalQuantity: 0,
          totalAmount: 0,
        };
      }
      acc[productName].count++; // Cuenta el número de registros
      acc[productName].totalQuantity += venta.cantidad; // Suma la cantidad
      acc[productName].totalAmount += venta.cantidad * venta.precio_venta; // Suma el total monetario
      return acc;
    }, {});

    return Object.entries(stats).map(
      ([name, { count, totalQuantity, totalAmount }]) => ({
        name,
        count,
        totalQuantity,
        totalAmount,
      })
    );
  }, [filteredVentas]);

  const displayedVentas = useMemo(() => {
    let filtered = currentVentas;

    if (selectedProduct) {
      filtered = filtered.filter(
        (venta) => venta.producto.nombre === selectedProduct
      );
    }

    if (selectedClienteType) {
      switch (selectedClienteType) {
        case "eliminado":
          filtered = filtered.filter(
            (venta) => venta.cliente.nombre === "Cliente eliminado"
          );
          break;
        case "no_especificado":
          filtered = filtered.filter(
            (venta) => venta.cliente.nombre === "Cliente no especificado"
          );
          break;
        case "con_cliente":
          filtered = filtered.filter(
            (venta) =>
              !["Cliente eliminado", "Cliente no especificado"].includes(
                venta.cliente.nombre
              )
          );
          break;
      }
    }

    return filtered;
  }, [currentVentas, selectedProduct, selectedClienteType]);

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
          <StatsHeader ventas={filteredVentas} />

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
          <ClienteStats
            ventas={filteredVentas}
            selectedClienteType={selectedClienteType}
            onClienteTypeClick={(type) => setSelectedClienteType(type)}
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
            ) : displayedVentas.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg">No se encontraron ventas</p>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                        {displayedVentas.map((venta) => (
                          <VentaGrid
                            key={venta.id}
                            venta={venta}
                            onEdit={() => handleUpdateModalOpen(venta)}
                            onRestablecer={() => handleRestablecer(venta)}
                            isRestabling={isRestabling}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <TableContent
                          ventas={displayedVentas}
                          onEdit={handleUpdateModalOpen}
                          onRestablecer={handleRestablecer}
                          isRestabling={isRestabling}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t">
                  <PaginacionModVenta
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePreviousPage={handlePreviousPage}
                    handleNextPage={handleNextPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={filteredVentas.length}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <VentaUpdateModal
        isOpen={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setVentaToUpdate(null);
        }}
        venta={ventaToUpdate}
        onVentaUpdated={handleVentaUpdated}
      />

      <VentaRestablecerModal
        isOpen={restablecerModalOpen}
        onClose={() => {
          setRestablecerModalOpen(false);
          setVentaToRestablecer(null);
        }}
        onConfirm={handleConfirmRestablecer}
        ventaId={ventaToRestablecer?.id}
        isRestabling={isRestabling}
        venta={ventaToRestablecer}
      />
    </main>
  );
};

export default VentaListar;
