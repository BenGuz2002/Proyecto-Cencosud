import React, { useState } from 'react';
import axios from 'axios';
import './nuevosUs.css';

function NuevosUs() {
  const [formData, setFormData] = useState({
    nombre: '',
    departamento: '',
    fecha_ingreso: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que todos los campos estén llenos
    if (!formData.nombre || !formData.departamento || !formData.fecha_ingreso) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    axios.post('http://localhost:3001/usuario', formData)
      .then(res => {
        setSuccess('Usuario creado correctamente');
        setFormData({
          nombre: '',
          departamento: '',
          fecha_ingreso: ''
        });
        // Limpiar el mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      })
      .catch(err => {
        console.error("Error al crear usuario:", err.response?.data || err.message);
        setError('Error al crear el usuario: ' + (err.response?.data?.error || err.message));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="nuevos-us-container">
      <div className="form-wrapper">
        <h1>Agregar Nuevo Usuario</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="form-nuevo-usuario">
          <div className="form-grupo">
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre del usuario"
              className="input-field"
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="departamento">Departamento:</label>
            <input
              type="text"
              id="departamento"
              name="departamento"
              value={formData.departamento}
              onChange={handleInputChange}
              placeholder="Ingresa el departamento"
              className="input-field"
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="fecha_ingreso">Fecha de Ingreso:</label>
            <input
              type="date"
              id="fecha_ingreso"
              name="fecha_ingreso"
              value={formData.fecha_ingreso}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="form-botones">
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
            <button
              type="reset"
              className="btn-reset"
              onClick={() => {
                setFormData({
                  nombre: '',
                  departamento: '',
                  fecha_ingreso: ''
                });
                setError(null);
              }}
            >
              Limpiar
            </button>
          </div>
        </form>

        <div className="info-box">
          <h3>Instrucciones:</h3>
          <ul>
            <li>Completa todos los campos del formulario</li>
            <li>El nombre debe ser único</li>
            <li>Selecciona una fecha de ingreso válida</li>
            <li>Los datos se guardarán en la base de datos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NuevosUs;
