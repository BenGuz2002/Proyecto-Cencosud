import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './nuevaNom.css';

function NuevaNom() {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    usuario_id: '',
    fecha: new Date().toISOString().split('T')[0],
    evaluacion: '',
    sueldo_base: '',
    bono: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar lista de usuarios
  useEffect(() => {
    axios.get('http://localhost:3001/usuario')
      .then(res => {
        setUsuarios(res.data);
      })
      .catch(err => {
        console.error("Error al obtener usuarios:", err);
        setError('Error al cargar usuarios');
      })
      .finally(() => {
        setLoadingUsuarios(false);
      });
  }, []);

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
    if (!formData.usuario_id || !formData.fecha || !formData.evaluacion || !formData.sueldo_base || !formData.bono) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const datosEnvio = {
      usuario_id: parseInt(formData.usuario_id),
      fecha: formData.fecha,
      evaluacion: formData.evaluacion,
      sueldo_base: parseFloat(formData.sueldo_base),
      bono: parseFloat(formData.bono)
    };

    axios.post('http://localhost:3001/create', datosEnvio)
      .then(res => {
        setSuccess('Nómina creada correctamente');
        setFormData({
          usuario_id: '',
          fecha: new Date().toISOString().split('T')[0],
          evaluacion: '',
          sueldo_base: '',
          bono: ''
        });
        // Limpiar el mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      })
      .catch(err => {
        console.error("Error al crear nómina:", err.response?.data || err.message);
        setError('Error al crear la nómina: ' + (err.response?.data?.error || err.message));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="nueva-nom-container">
      <div className="form-wrapper">
        <h1>Crear Nueva Nómina</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loadingUsuarios ? (
          <p className="loading">Cargando usuarios...</p>
        ) : (
          <form onSubmit={handleSubmit} className="form-nueva-nomina">
            <div className="form-grupo">
              <label htmlFor="usuario_id">Empleado:</label>
              <select
                id="usuario_id"
                name="usuario_id"
                value={formData.usuario_id}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Selecciona un empleado</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} (ID: {usuario.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grupo">
              <label htmlFor="fecha">Fecha:</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="evaluacion">Evaluación:</label>
              <input
                type="text"
                id="evaluacion"
                name="evaluacion"
                value={formData.evaluacion}
                onChange={handleInputChange}
                placeholder="Ej: Excelente, Muy Bueno, Bueno, etc."
                className="input-field"
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="sueldo_base">Sueldo Base:</label>
              <input
                type="number"
                id="sueldo_base"
                name="sueldo_base"
                value={formData.sueldo_base}
                onChange={handleInputChange}
                placeholder="Ej: 500000"
                step="1000"
                className="input-field"
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="bono">Bono (%):</label>
              <input
                type="number"
                id="bono"
                name="bono"
                value={formData.bono}
                onChange={handleInputChange}
                placeholder="Ej: 10"
                step="0.1"
                min="0"
                max="100"
                className="input-field"
              />
            </div>

            <div className="form-botones">
              <button
                type="submit"
                disabled={loading}
                className="btn-submit"
              >
                {loading ? 'Creando...' : 'Crear Nómina'}
              </button>
              <button
                type="reset"
                className="btn-reset"
                onClick={() => {
                  setFormData({
                    usuario_id: '',
                    fecha: '',
                    evaluacion: '',
                    sueldo_base: '',
                    bono: ''
                  });
                  setError(null);
                }}
              >
                Limpiar
              </button>
            </div>
          </form>
        )}

        <div className="info-box">
          <h3>Instrucciones:</h3>
          <ul>
            <li>Selecciona un empleado de la lista</li>
            <li>Ingresa la fecha de la nómina</li>
            <li>Ingresa el tipo de evaluación (ej: Excelente, Muy Bueno, etc.)</li>
            <li>Ingresa el sueldo base del período</li>
            <li>Ingresa el porcentaje de bono (0-100%)</li>
            <li>Los datos se guardarán en la base de datos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NuevaNom;
