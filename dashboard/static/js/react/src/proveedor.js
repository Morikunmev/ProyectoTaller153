import React from 'react';
import { createRoot } from 'react-dom/client';
import ProveedorForm from './components/ProveedorForm';

const container = document.getElementById('react-proveedor');
const root = createRoot(container);
root.render(<ProveedorForm />);