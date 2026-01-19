import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Inicio from '../paginas/inicio';
import Total from '../paginas/total';
import Usuarios from '../paginas/usuarios';
import NuevosUs from '../paginas/nuevosUs';
import NuevaNom from '../paginas/nuevaNom';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/total" element={<Total />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route path="/nuevos-usuarios" element={<NuevosUs />} />
      <Route path="/nueva-nomina" element={<NuevaNom />} />
    </Routes>
  );
}

export default AppRoutes;
