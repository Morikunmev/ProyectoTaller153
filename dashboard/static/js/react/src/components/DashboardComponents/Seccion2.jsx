import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

const Seccion2 = () => {
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#a855f7",
  ];

  const [stats, setStats] = useState({
    ventas: [],
    perdidas: [],
    categorias: [], // Nuevo array para datos de categorías
    total_ventas: 0,
    total_perdidas: 0,
    loading: true,
    error: null,
  });

  const fetchStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/stats/productos-categorias/", {
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
      setStats({
        ...data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        ventas: [],
        perdidas: [],
        categorias: [],
        total_ventas: 0,
        total_perdidas: 0,
        loading: false,
        error: error.message,
      });
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">Cantidad: {payload[0].value}</p>
          <p className="text-sm text-gray-600">
            Porcentaje: {payload[0].payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">Vendidos: {payload[0].value}%</p>
          <p className="text-sm text-gray-600">
            Desechados: {payload[1].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (stats.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="text-center p-4 text-red-600">
        Error al cargar los datos: {stats.error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Productos más vendidos
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.ventas}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  dataKey="value"
                >
                  {stats.ventas.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total de productos vendidos: {stats.total_ventas}
            </p>
          </div>
        </div>

        {/* Pérdidas */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Productos perdidos/desechados
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.perdidas}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  dataKey="value"
                >
                  {stats.perdidas.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total de productos perdidos: {stats.total_perdidas}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de barras de categorías */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Porcentaje por Categorías
        </h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.categorias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar
                dataKey="porcentaje_vendidos"
                name="Vendidos"
                fill="#82ca9d"
              />
              <Bar
                dataKey="porcentaje_perdidas"
                name="Desechados"
                fill="#ff8042"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Seccion2;
