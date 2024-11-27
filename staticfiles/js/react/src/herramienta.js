import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import HerramientaListar from "./components/MaterialComponents/ModHerramienta/HerramientaListar";
import Navbar from "./components/Navbar";

import "./styles/index.css";

const HerramientaApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar />
      <HerramientaListar
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

const container = document.getElementById("react-herramienta");
const root = createRoot(container);
root.render(<HerramientaApp />);