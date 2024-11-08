import React from "react";
import { createRoot } from "react-dom/client";
import ProveedorModal from "./components/ProveedorComponents/ProveedorModal";
import "./styles/index.css"; // Esta línea debe estar exactamente así

const container = document.getElementById("react-proveedor");
const root = createRoot(container);
root.render(<ProveedorModal />);
