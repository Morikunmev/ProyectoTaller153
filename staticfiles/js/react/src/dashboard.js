import React from "react";
import { createRoot } from "react-dom/client";
import Seccion1 from "./components/DashboardComponents/Seccion1";
import Seccion2 from "./components/DashboardComponents/Seccion2";
import Seccion3 from "./components/DashboardComponents/Seccion2";

import Navbar from "./components/Navbar";
import "./styles/index.css";

const container = document.getElementById("dashboard-root");
const root = createRoot(container);
root.render(
  <>
    <Navbar />
    <Seccion1 />
    <Seccion2 />
    <Seccion3 />
  </>
);
