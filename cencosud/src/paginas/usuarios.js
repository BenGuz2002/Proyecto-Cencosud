import React, { useState, useEffect } from 'react';
import './usuarios.css';
import { fetchAPI, ENDPOINTS } from '../config/api';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI(ENDPOINTS.USUARIOS);
      setUsuarios(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="usuarios-container">
      <h1>Usuarios</h1>
      
      {loading && <p>Cargando usuarios...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {!loading && usuarios.length > 0 && (
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Departamento</th>
              <th>Fecha de Ingreso</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.departamento}</td>
                <td>{new Date(usuario.fecha_ingreso).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {!loading && usuarios.length === 0 && !error && (
        <p>No hay usuarios disponibles</p>
      )}
    </div>
  );
}

export default Usuarios;