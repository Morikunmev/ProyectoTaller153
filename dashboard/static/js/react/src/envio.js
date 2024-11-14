import React from "react";
import { createRoot } from "react-dom/client";
import EnvioListar from "./components/ProveedorComponents/ModEnvio/EnvioListar";
import Navbar from "./components/Navbar";
import "./styles/index.css";

const container = document.getElementById("react-envio");
const root = createRoot(container);
root.render(
  <>
    <Navbar />
    <EnvioListar />
  </>
);
