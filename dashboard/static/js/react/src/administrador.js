import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import AdministradorListar from "./components/UsuarioComponents/ModAdministrador/AdministradorListar";
import Navbar from "./components/Navbar";
import "./styles/index.css";

const AdministradorApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Navbar />
      <AdministradorListar
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};
const container = document.getElementById("react-administrador");
const root = createRoot(container);
root.render(<AdministradorApp />);
