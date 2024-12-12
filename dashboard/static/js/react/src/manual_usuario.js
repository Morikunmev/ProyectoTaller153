import React from "react";
import { createRoot } from "react-dom/client";
import ManualUsuario from "./components/ManualUsuario";
import Navbar from "./components/Navbar";
import "./styles/index.css";
const container = document.getElementById("react-manual");
const root = createRoot(container);
root.render(
  <>
    <Navbar />
    <ManualUsuario />
  </>
);