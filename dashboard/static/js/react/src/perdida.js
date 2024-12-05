import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import PerdidaListar from "./components/MaterialComponents/ModPerdida/PerdidaListar";
import Navbar from "./components/Navbar";

import "./styles/index.css";

const PerdidaApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar />
      <PerdidaListar
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

const container = document.getElementById("react-perdida");
const root = createRoot(container);
root.render(<PerdidaApp />);
