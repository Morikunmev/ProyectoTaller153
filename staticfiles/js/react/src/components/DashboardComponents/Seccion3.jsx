import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Seccion3 = () => {
  const [stockData, setStockData] = useState({
    productos: [],
    loading: true,
    error: null,
  });

  const fetchStockData = async () => {
    try {
      setStockData(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/stats/productos-stock/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStockData({
        productos: data.productos,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setStockData({
        productos: [],
        loading: false,
        error: error.message,
      });
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
          <p className="font-medium">{data.nombre}</p>
          <p className="text-sm text-gray-600">
            Stock actual: {data.stockActual} unidades
          </p>
          <p className="text-sm text-gray-600">
            Stock inicial: {data.stockInicial} unidades
          </p>
          <p className="text-sm text-gray-600">
            Porcentaje disponible: {data.porcentajeStock.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (stockData.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (stockData.error) {
    return (
      <div className="text-center p-4 text-red-600">
        Error al cargar los datos: {stockData.error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Porcentaje de Stock Disponible por Producto
      </h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stockData.productos}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="nombre"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis
              domain={[0, 100]}
              label={{
                value: "Porcentaje de Stock (%)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="porcentajeStock"
              name="Stock Disponible"
              fill="#4f46e5"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Seccion3;