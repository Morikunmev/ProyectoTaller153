import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import MaterialListar from "./components/MaterialComponents/ModMaterial/MaterialListar";
import Navbar from "./components/Navbar";

import "./styles/index.css";

const MaterialApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar />
      <MaterialListar
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

const container = document.getElementById("react-material");
const root = createRoot(container);
root.render(<MaterialApp />);
