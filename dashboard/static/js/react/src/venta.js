import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import VentaListar from './components/VentaComponents/ModVenta/VentaListar'
import Navbar from "./components/Navbar";

import "./styles/index.css";

const VentaApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar />
      <VentaListar
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

const container = document.getElementById("react-venta");
const root = createRoot(container);
root.render(<VentaApp />);