import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import CategoriaListar from "./components/MaterialComponents/ModCategoria/CategoriaListar";
import Navbar from "./components/Navbar";

import "./styles/index.css";

const CategoriaApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar />
      <CategoriaListar
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

const container = document.getElementById("react-categoria");
if (container) {
  const root = createRoot(container);
  root.render(<CategoriaApp />);
}
