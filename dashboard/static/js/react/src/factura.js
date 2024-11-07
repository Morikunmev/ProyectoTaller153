import React from "react";
import { createRoot } from "react-dom/client";
import FacturaForm from "./components/FacturaComponents/FacturaForm.jsx";
import "./styles/index.css";

const container = document.getElementById("react-factura");
const root = createRoot(container);
root.render(<FacturaForm />);
