import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import ProductoListar from "./components/MaterialComponents/ModProducto/ProductoListar";
import Navbar from "./components/Navbar";

import "./styles/index.css";

const ProductoApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar />
      <ProductoListar
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

const container = document.getElementById("react-producto");
const root = createRoot(container);
root.render(<ProductoApp />);