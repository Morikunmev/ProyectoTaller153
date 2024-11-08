import React from "react";
import { createRoot } from "react-dom/client";
import ProveedorListar from "./components/ProveedorComponents/ModProveedor/ProveedorListar";

import "./styles/index.css"; // Esta línea debe estar exactamente así

const container = document.getElementById("react-proveedor");
const root = createRoot(container);
root.render(
  <>
    <ProveedorListar />
  </>
);
