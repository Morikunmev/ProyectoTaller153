import React from "react";
import { createRoot } from "react-dom/client";
import Prueba1 from "./components/DashboardComponents/DashboardCategorias/Prueba1";
import Navbar from "./components/Navbar";
import "./styles/index.css";

const container = document.getElementById("dashboard-root");
const root = createRoot(container);
root.render(
  <>
    <Navbar />
    <Prueba1 />
  </>
);
