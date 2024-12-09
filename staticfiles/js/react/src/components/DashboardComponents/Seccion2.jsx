import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

// Registrar solo componentes necesarios
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

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
    categorias: [],
    total_ventas: 0,
    total_perdidas: 0,
    loading: true,
    error: null,
  });

  const fetchStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetch("/api/stats/productos-categorias/");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStats({ ...data, loading: false, error: null });
    } catch (error) {
      console.error("Error:", error);
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

  // Configuración base optimizada
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 11 } },
      },
    },
  };

  // Configuración para gráficos circulares
  const pieOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        ...baseOptions.plugins.legend,
        labels: {
          boxWidth: 12,
          padding: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const label = context.label || "";
            return `${label}: ${value} unidades`;
          },
        },
      },
    },
  };

  // Configuración para gráfico de barras
  const barOptions = {
    ...baseOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: { size: 10 },
          callback: (value) => `${value}%`,
        },
      },
    },
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}%`,
        },
      },
    },
  };

  // Datos para gráficos
  const ventasChartData = {
    labels: stats.ventas.map((item) => item.name),
    datasets: [
      {
        data: stats.ventas.map((item) => item.value),
        backgroundColor: COLORS.slice(0, stats.ventas.length),
        borderWidth: 0,
      },
    ],
  };

  const perdidasChartData = {
    labels: stats.perdidas.map((item) => item.name),
    datasets: [
      {
        data: stats.perdidas.map((item) => item.value),
        backgroundColor: COLORS.slice(0, stats.perdidas.length),
        borderWidth: 0,
      },
    ],
  };

  const categoriasChartData = {
    labels: stats.categorias.map((item) => item.name),
    datasets: [
      {
        label: "Vendidos",
        data: stats.categorias.map((item) => item.porcentaje_vendidos),
        backgroundColor: "#82ca9d",
        borderWidth: 0,
      },
      {
        label: "Desechados",
        data: stats.categorias.map((item) => item.porcentaje_perdidas),
        backgroundColor: "#ff8042",
        borderWidth: 0,
      },
    ],
  };

  if (stats.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ventas */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Productos más vendidos
          </h2>
          <div className="h-[250px] relative">
            {stats.ventas.length > 0 ? (
              <Pie data={ventasChartData} options={pieOptions} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600">
              Total: {stats.total_ventas} unidades
            </p>
          </div>
        </div>

        {/* Pérdidas */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Productos perdidos/desechados
          </h2>
          <div className="h-[250px] relative">
            {stats.perdidas.length > 0 ? (
              <Pie data={perdidasChartData} options={pieOptions} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600">
              Total: {stats.total_perdidas} unidades
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de barras */}
      {stats.categorias?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Porcentaje por Categorías
          </h2>
          <div className="h-[300px]">
            <Bar data={categoriasChartData} options={barOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Seccion2;
