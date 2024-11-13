import React from "react";
import { createRoot } from "react-dom/client";
import FacturaListar from "./components/ProveedorComponents/ModFactura/FacturaListar";
import Navbar from "./components/Navbar";
import "./styles/index.css";

const container = document.getElementById("react-factura");
const root = createRoot(container);
root.render(
  <>
    <Navbar />
    <FacturaListar />
  </>
);
