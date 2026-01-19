import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './total.css';

function Total() {
  const [datosCompletos, setDatosCompletos] = useState([]);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Filtros
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [ordenAntiguedad, setOrdenAntiguedad] = useState('asc'); // 'asc' o 'desc'
  const [filtroSueldoMin, setFiltroSueldoMin] = useState('');
  const [filtroSueldoMax, setFiltroSueldoMax] = useState('');
  
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [anosDisponibles, setAnosDisponibles] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const datosPerPagina = 20;

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([
      axios.get("http://localhost:3001/usuario"),
      axios.get("http://localhost:3001/fechas")
    ])
      .then(([usuariosRes, fechasRes]) => {
        const usuarios = usuariosRes.data;
        const fechas = fechasRes.data;

        // Combinar datos y calcular
        const datosProcessados = fechas.map(fecha => {
          const usuario = usuarios.find(u => u.id === fecha.usuario_id);

          // Calcular bono
          const bonoPorcentaje = fecha.bono || 0;
          const bonoCalculado = (fecha.sueldo_base * bonoPorcentaje) / 100;

          // Calcular total
          const total = fecha.sueldo_base + bonoCalculado;

          // Calcular antigüedad (años)
          const fechaIngreso = new Date(usuario.fecha_ingreso);
          const fechaFecha = new Date(fecha.fecha);
          const msEnUnAno = 365 * 24 * 60 * 60 * 1000;
          const antiguedad = Math.max(0, (fechaFecha - fechaIngreso) / msEnUnAno).toFixed(2);

          return {
            fecha: fecha.fecha,
            id_empleado: usuario.id,
            nombre: usuario.nombre,
            departamento: usuario.departamento,
            evaluacion: fecha.evaluacion,
            sueldo_base: fecha.sueldo_base,
            bono_porcentaje: bonoPorcentaje,
            bono_calculado: Math.round(bonoCalculado),
            total: Math.round(total),
            fecha_ingreso: usuario.fecha_ingreso,
            antiguedad: antiguedad,
          };
        });

        setDatosCompletos(datosProcessados);
        setDatos(datosProcessados);
        
        // Extraer meses y años únicos para los filtros
        const meses = [...new Set(datosProcessados.map(d => {
          const fecha = new Date(d.fecha);
          return fecha.getMonth();
        }))].sort((a, b) => a - b);
        
        const anos = [...new Set(datosProcessados.map(d => {
          const fecha = new Date(d.fecha);
          return fecha.getFullYear();
        }))].sort((a, b) => b - a);
        
        setMesesDisponibles(meses);
        setAnosDisponibles(anos);
      })
      .catch(err => {
        console.error("Error al obtener datos:", err);
        setError('Error al cargar los datos. Por favor, intente de nuevo.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let datosFiltered = [...datosCompletos];

    // Filtrar por mes
    if (filtroMes !== '') {
      datosFiltered = datosFiltered.filter(d => {
        const fecha = new Date(d.fecha);
        return fecha.getMonth() === parseInt(filtroMes);
      });
    }

    // Filtrar por año
    if (filtroAno !== '') {
      datosFiltered = datosFiltered.filter(d => {
        const fecha = new Date(d.fecha);
        return fecha.getFullYear() === parseInt(filtroAno);
      });
    }

    // Filtrar por rango de sueldo
    if (filtroSueldoMin !== '') {
      datosFiltered = datosFiltered.filter(d => parseFloat(d.sueldo_base) >= parseFloat(filtroSueldoMin));
    }
    if (filtroSueldoMax !== '') {
      datosFiltered = datosFiltered.filter(d => parseFloat(d.sueldo_base) <= parseFloat(filtroSueldoMax));
    }

    // Ordenar por antigüedad
    datosFiltered.sort((a, b) => {
      const antiguedadA = parseFloat(a.antiguedad);
      const antiguedadB = parseFloat(b.antiguedad);
      return ordenAntiguedad === 'desc' ? antiguedadB - antiguedadA : antiguedadA - antiguedadB;
    });

    setDatos(datosFiltered);
    setPaginaActual(1); // Resetear a primera página cuando cambian filtros
  }, [filtroMes, filtroAno, ordenAntiguedad, filtroSueldoMin, filtroSueldoMax, datosCompletos]);

  // Lógica de paginación
  const totalPaginas = Math.ceil(datos.length / datosPerPagina);
  const indiceInicial = (paginaActual - 1) * datosPerPagina;
  const indiceFinal = indiceInicial + datosPerPagina;
  const datosEnPagina = datos.slice(indiceInicial, indiceFinal);

  const irAPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  return (
    <div className="total-container">
      <div className="total-header">
        <h1>Detalle de Nómina</h1>
        <button 
          onClick={() => navigate('/nueva-nomina')}
          className="btn-nueva-nomina"
        >
          + Nueva Nómina
        </button>
      </div>

      {loading && <p className="loading">Cargando datos...</p>}
      {error && <p className="error">Error: {error}</p>}

      {!loading && datosCompletos.length > 0 && (
        <>
          <div className="filtros">
            <div className="filtro-grupo">
              <label htmlFor="mes">Mes:</label>
              <select 
                id="mes" 
                value={filtroMes} 
                onChange={(e) => setFiltroMes(e.target.value)}
              >
                <option value="">Todos los meses</option>
                {mesesDisponibles.map(mes => (
                  <option key={mes} value={mes}>
                    {new Date(2024, mes).toLocaleDateString('es-ES', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-grupo">
              <label htmlFor="ano">Año:</label>
              <select 
                id="ano" 
                value={filtroAno} 
                onChange={(e) => setFiltroAno(e.target.value)}
              >
                <option value="">Todos los años</option>
                {anosDisponibles.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            <div className="filtro-grupo">
              <label htmlFor="orden">Ordenar por antigüedad:</label>
              <select 
                id="orden" 
                value={ordenAntiguedad} 
                onChange={(e) => setOrdenAntiguedad(e.target.value)}
              >
                <option value="asc">Menor a Mayor</option>
                <option value="desc">Mayor a Menor</option>
              </select>
            </div>

            <div className="filtro-grupo">
              <label htmlFor="sueldoMin">Sueldo Mínimo:</label>
              <input 
                id="sueldoMin" 
                type="number" 
                value={filtroSueldoMin} 
                onChange={(e) => setFiltroSueldoMin(e.target.value)}
                placeholder="Mínimo"
              />
            </div>

            <div className="filtro-grupo">
              <label htmlFor="sueldoMax">Sueldo Máximo:</label>
              <input 
                id="sueldoMax" 
                type="number" 
                value={filtroSueldoMax} 
                onChange={(e) => setFiltroSueldoMax(e.target.value)}
                placeholder="Máximo"
              />
            </div>
          </div>

          {datos.length > 0 ? (
        <table className="total-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>ID Empleado</th>
              <th>Nombre</th>
              <th>Departamento</th>
              <th>Evaluación</th>
              <th>Sueldo Base</th>
              <th>Bono %</th>
              <th>Bono Calculado</th>
              <th>Total</th>
              <th>Fecha de Ingreso</th>
              <th>Antigüedad (años)</th>
            </tr>
          </thead>
          <tbody>
            {datosEnPagina.map((dato, index) => (
              <tr key={index}>
                <td>{new Date(dato.fecha).toLocaleDateString()}</td>
                <td>{dato.id_empleado}</td>
                <td>{dato.nombre}</td>
                <td>{dato.departamento}</td>
                <td>{dato.evaluacion}</td>
                <td>${dato.sueldo_base.toLocaleString()}</td>
                <td>{dato.bono_porcentaje}%</td>
                <td>${dato.bono_calculado.toLocaleString()}</td>
                <td>${dato.total.toLocaleString()}</td>
                <td>{new Date(dato.fecha_ingreso).toLocaleDateString()}</td>
                <td>{dato.antiguedad}</td>
              </tr>
            ))}
          </tbody>
        </table>
          ) : (
            <p className="no-data">No hay datos con los filtros seleccionados</p>
          )}

          {!loading && datos.length > datosPerPagina && (
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
            Mostrando {datos.length > 0 ? indiceInicial + 1 : 0} a {Math.min(indiceFinal, datos.length)} de {datos.length} registros (Página {totalPaginas > 0 ? paginaActual : 0} de {totalPaginas})
          </div>
        </>
      )}

      {!loading && datosCompletos.length === 0 && !error && (
        <p className="no-data">No hay datos disponibles</p>
      )}
    </div>
  );
}

export default Total;