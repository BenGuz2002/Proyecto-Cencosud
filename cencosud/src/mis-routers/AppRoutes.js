import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Inicio from '../paginas/inicio';
import Total from '../paginas/total';
import Usuarios from '../paginas/usuarios';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/total" element={<Total />} />
      <Route path="/usuarios" element={<Usuarios />} />
    </Routes>
  );
}

export default AppRoutes;
