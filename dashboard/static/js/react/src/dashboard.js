import React from "react";
import { createRoot } from "react-dom/client";
import Seccion1 from "./components/DashboardComponents/DashboardCategorias/Seccion1";
import Navbar from "./components/Navbar";
import "./styles/index.css";

const container = document.getElementById("dashboard-root");
const root = createRoot(container);
root.render(
  <>
    <Navbar />
    <Seccion1 />
  </>
);
