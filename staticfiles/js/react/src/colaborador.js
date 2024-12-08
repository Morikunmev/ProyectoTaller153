import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import ColaboradorListar from "./components/UsuarioComponents/ModColaborador/ColaboradorListar";
import Navbar from "./components/Navbar";
import "./styles/index.css";

const ColaboradorApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Navbar />
      <ColaboradorListar
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};
const container = document.getElementById("react-colaborador");
const root = createRoot(container);
root.render(<ColaboradorApp />);
