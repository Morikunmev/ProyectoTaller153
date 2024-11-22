import React from "react";
import { createRoot } from "react-dom/client";
import MaterialListar from "./components/MaterialComponents/ModMaterial/MaterialListar";
import Navbar from "./components/Navbar";

import "./styles/index.css";

const container = document.getElementById("react-proveedor");
const root = createRoot(container);
root.render(
  <>
    <Navbar />
    <MaterialListar />
  </>
);
