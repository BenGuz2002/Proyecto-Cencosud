import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import './inicio.css';

function Inicio() {
  const [chartData, setChartData] = useState([]);
  const [datosCompletos, setDatosCompletos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [departamentosDisponibles, setDepartamentosDisponibles] = useState([]);
  const [anosDisponibles, setAnosDisponibles] = useState([]);
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [top5Empleados, setTop5Empleados] = useState([]);
  const [chartDataTorta, setChartDataTorta] = useState([]);

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

        // Combinar datos completos
        const datosCompletos = usuarios.map(usuario => {
          const fechasUsuario = fechas.filter(f => f.usuario_id === usuario.id);
          const sueldoBase = fechasUsuario.length > 0 
            ? fechasUsuario[0].sueldo_base 
            : 0;

          return {
            id: usuario.id,
            nombre: usuario.nombre,
            departamento: usuario.departamento,
            sueldo_base: sueldoBase,
            fechas: fechasUsuario
          };
        }).filter(dato => dato.sueldo_base > 0);

        setDatosCompletos(datosCompletos);

        // Extraer departamentos, años y meses únicos
        const departamentos = [...new Set(datosCompletos.map(d => d.departamento))];
        const anos = [...new Set(datosCompletos.flatMap(d => 
          d.fechas.map(f => new Date(f.fecha).getFullYear())
        ))].sort((a, b) => b - a);
        
        setDepartamentosDisponibles(departamentos);
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
    let datosFiltrados = [...datosCompletos];

    // Filtrar por departamento
    if (filtroDepartamento !== '') {
      datosFiltrados = datosFiltrados.filter(d => d.departamento === filtroDepartamento);
    }

    // Filtrar por año y mes
    if (filtroAno !== '') {
      datosFiltrados = datosFiltrados.map(usuario => ({
        ...usuario,
        fechas: usuario.fechas.filter(f => {
          const fecha = new Date(f.fecha);
          const year = fecha.getFullYear();
          if (filtroMes !== '') {
            const month = fecha.getMonth();
            return year === parseInt(filtroAno) && month === parseInt(filtroMes);
          }
          return year === parseInt(filtroAno);
        })
      })).filter(usuario => usuario.fechas.length > 0);
    }

    // Calcular gráfico
    const datosGrafico = datosFiltrados.map(usuario => ({
      nombre: usuario.nombre,
      sueldo_base: usuario.fechas.length > 0 ? usuario.fechas[0].sueldo_base : usuario.sueldo_base
    }));

    // Calcular ingresos por departamento
    const ingresosPorDepartamento = datosFiltrados.reduce((acc, usuario) => {
      const depto = usuario.departamento;
      const sueldo = usuario.fechas.length > 0 ? usuario.fechas[0].sueldo_base : usuario.sueldo_base;
      const existe = acc.find(d => d.name === depto);
      
      if (existe) {
        existe.value += sueldo;
      } else {
        acc.push({ name: depto, value: sueldo });
      }
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    setChartDataTorta(ingresosPorDepartamento);

    // Calcular top 5 empleados
    const top5 = datosFiltrados
      .sort((a, b) => (b.fechas.length > 0 ? b.fechas[0].sueldo_base : b.sueldo_base) - 
                       (a.fechas.length > 0 ? a.fechas[0].sueldo_base : a.sueldo_base))
      .slice(0, 4)
      .map(usuario => ({
        nombre: usuario.nombre,
        departamento: usuario.departamento,
        sueldo_base: usuario.fechas.length > 0 ? usuario.fechas[0].sueldo_base : usuario.sueldo_base
      }));

    setChartData(datosGrafico);
    setTop5Empleados(top5);

    // Extraer meses disponibles para el año seleccionado
    if (filtroAno !== '') {
      const meses = [...new Set(datosCompletos.flatMap(d => 
        d.fechas
          .filter(f => new Date(f.fecha).getFullYear() === parseInt(filtroAno))
          .map(f => new Date(f.fecha).getMonth())
      ))].sort((a, b) => a - b);
      setMesesDisponibles(meses);
    } else {
      setMesesDisponibles([]);
      setFiltroMes('');
    }
  }, [filtroDepartamento, filtroAno, filtroMes, datosCompletos]);

  return (
    <div className="inicio-container">
      <h1>Dashboard - Sueldos Base por Usuario</h1>

      {loading && <p className="loading">Cargando datos...</p>}
      {error && <p className="error">Error: {error}</p>}

      {!loading && (
        <div className="filtros-inicio">
          <div className="filtro-grupo">
            <label htmlFor="departamento">Departamento:</label>
            <select
              id="departamento"
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              className="input-filtro"
            >
              <option value="">Todos</option>
              {departamentosDisponibles.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
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
              className="input-filtro"
            >
              <option value="">Todos</option>
              {anosDisponibles.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label htmlFor="mes">Mes:</label>
            <select
              id="mes"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="input-filtro"
              disabled={filtroAno === ''}
            >
              <option value="">Todos</option>
              {mesesDisponibles.map((mes) => (
                <option key={mes} value={mes}>
                  {new Date(2024, mes).toLocaleDateString('es-ES', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <div className="chart-full-width">
          <h2>Sueldos Base por Usuario</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sueldo_base" fill="#61dafb" name="Sueldo Base" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && (top5Empleados.length > 0 || chartDataTorta.length > 0) && (
        <div className="bottom-section">
          <div className="empleados-section">
            <h2>Top 4 Mejores Empleados</h2>
            <div className="top6-grid">
              {top5Empleados.map((empleado, index) => (
                <div key={index} className="empleado-card">
                  <div className="rank-badge">{index + 1}</div>
                  <h3>{empleado.nombre}</h3>
                  <p className="departamento">{empleado.departamento}</p>
                  <p className="sueldo">
                    ${empleado.sueldo_base.toLocaleString('es-CL')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {chartDataTorta.length > 0 && (
            <div className="torta-section">
              <h2>Ingresos por Departamento</h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartDataTorta}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toLocaleString('es-CL')}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartDataTorta.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#61dafb', '#8ac926', '#ffc107', '#ff6b6b', '#4ecdc4', '#45b7d1'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString('es-CL')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {!loading && chartData.length === 0 && !error && (
        <p className="no-data">No hay datos disponibles</p>
      )}
    </div>
  );
}

export default Inicio;