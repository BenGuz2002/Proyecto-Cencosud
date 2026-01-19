import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './usuarios.css';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editandoDatos, setEditandoDatos] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);
  const datosPerPagina = 20;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    
    axios.get("http://localhost:3001/usuario")
      .then(res => {
        setUsuarios(res.data);
      })
      .catch(err => {
        console.error("Error al obtener usuarios:", err);
        setError('Error al cargar los usuarios. Por favor, intente de nuevo.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const abrirEditar = (usuario) => {
    setEditandoId(usuario.id);
    // Asegurar que la fecha esté en formato YYYY-MM-DD para el input type="date"
    const fechaFormato = usuario.fecha_ingreso 
      ? usuario.fecha_ingreso.split('T')[0] || usuario.fecha_ingreso
      : '';
    setEditandoDatos({ 
      ...usuario,
      fecha_ingreso: fechaFormato
    });
  };

  const cancelarEditar = () => {
    setEditandoId(null);
    setEditandoDatos({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditandoDatos({
      ...editandoDatos,
      [name]: value
    });
  };

  const guardarCambios = (usuarioId) => {
    const idNumero = parseInt(usuarioId);
    console.log(`Guardando cambios para usuario ID: ${idNumero}`, editandoDatos);
    
    axios.put(`http://localhost:3001/usuario/${idNumero}`, editandoDatos)
      .then(res => {
        console.log('Usuario actualizado correctamente:', res.data);
        // Actualizar la lista de usuarios
        setUsuarios(usuarios.map(u => u.id === usuarioId ? { ...u, ...editandoDatos } : u));
        setEditandoId(null);
        setEditandoDatos({});
        setError('');
      })
      .catch(err => {
        console.error("Error completo:", err);
        console.error("Error al actualizar usuario:", err.response?.data || err.message);
        setError('Error al actualizar el usuario: ' + (err.response?.data?.error || err.message));
      });
  };

  // Lógica de paginación
  const totalPaginas = Math.ceil(usuarios.length / datosPerPagina);
  const indiceInicial = (paginaActual - 1) * datosPerPagina;
  const indiceFinal = indiceInicial + datosPerPagina;
  const usuariosEnPagina = usuarios.slice(indiceInicial, indiceFinal);

  const irAPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    setEditandoId(null);
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h1>Usuarios</h1>
        <button 
          onClick={() => navigate('/nuevos-usuarios')}
          className="btn-nuevo-usuario"
        >
          + Nuevo Usuario
        </button>
      </div>
      
      {loading && <p className="loading">Cargando usuarios...</p>}
      {error && <p className="error">Error: {error}</p>}
      
      {!loading && usuarios.length > 0 && (
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Departamento</th>
              <th>Fecha de Ingreso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosEnPagina.map((usuario) => (
              editandoId === usuario.id ? (
                <tr key={usuario.id} className="fila-editando">
                  <td>{usuario.id}</td>
                  <td>
                    <input
                      type="text"
                      name="nombre"
                      value={editandoDatos.nombre || ''}
                      onChange={handleInputChange}
                      className="input-editar"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="departamento"
                      value={editandoDatos.departamento || ''}
                      onChange={handleInputChange}
                      className="input-editar"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="fecha_ingreso"
                      value={editandoDatos.fecha_ingreso || ''}
                      onChange={handleInputChange}
                      className="input-editar"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => guardarCambios(usuario.id)}
                      className="btn-guardar"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelarEditar}
                      className="btn-cancelar"
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.departamento}</td>
                  <td>{new Date(usuario.fecha_ingreso).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => abrirEditar(usuario)}
                      className="btn-editar"
                      title="Editar usuario"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      )}

      {!loading && usuarios.length > datosPerPagina && (
        <div className="paginacion">
          <button
            onClick={() => irAPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="btn-paginacion"
          >
            ← Anterior
          </button>
          
          <div className="numeros-pagina">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
              <button
                key={numero}
                onClick={() => irAPagina(numero)}
                className={`btn-numero ${paginaActual === numero ? 'activo' : ''}`}
              >
                {numero}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => irAPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="btn-paginacion"
          >
            Siguiente →
          </button>
        </div>
      )}

      <div className="info-paginacion">
        Mostrando {indiceInicial + 1} a {Math.min(indiceFinal, usuarios.length)} de {usuarios.length} usuarios (Página {paginaActual} de {totalPaginas})
      </div>
      
      {!loading && usuarios.length === 0 && !error && (
        <p className="no-data">No hay usuarios disponibles</p>
      )}
    </div>
  );
}

export default Usuarios;
