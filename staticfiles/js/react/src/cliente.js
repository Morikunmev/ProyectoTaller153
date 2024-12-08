import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import ClienteListar from "./components/VentaComponents/ModCliente/ClienteListar";
import Navbar from "./components/Navbar";
import "./styles/index.css";

const ClienteApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Navbar />
      <ClienteListar
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

const container = document.getElementById("react-cliente");
const root = createRoot(container);
root.render(<ClienteApp />);
