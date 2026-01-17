const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Cambiar según tu usuario de MySQL
  password: '5170',
  database: 'cencosud' // Cambiar según tu base de datos
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('✅ Conectado a MySQL correctamente');
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando correctamente' });
});

// Ruta para obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
  const query = 'SELECT * FROM usuario';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error en la query:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json(results);
  });
});

// Ruta para obtener un usuario por ID
app.get('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM usuario WHERE id = ?';
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error en la query:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json(results);
  });
});

// Ruta para insertar un nuevo usuario
app.post('/api/usuarios', (req, res) => {
  const { nombre, departamento, fecha_ingreso } = req.body;
  
  if (!nombre || !departamento || !fecha_ingreso) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  
  const query = 'INSERT INTO usuario (nombre, departamento, fecha_ingreso) VALUES (?, ?, ?)';
  
  connection.query(query, [nombre, departamento, fecha_ingreso], (err, results) => {
    if (err) {
      console.error('Error al insertar:', err);
      return res.status(500).json({ error: 'Error al insertar usuario' });
    }
    res.json({ mensaje: 'Usuario insertado correctamente', id: results.insertId });
  });
});

// Ruta para actualizar un usuario
app.put('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, departamento, fecha_ingreso } = req.body;
  
  const query = 'UPDATE usuario SET nombre = ?, departamento = ?, fecha_ingreso = ? WHERE id = ?';
  
  connection.query(query, [nombre, departamento, fecha_ingreso, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar:', err);
      return res.status(500).json({ error: 'Error al actualizar usuario' });
    }
    res.json({ mensaje: 'Usuario actualizado correctamente' });
  });
});

// Ruta para eliminar un usuario
app.delete('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM usuario WHERE id = ?';
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar:', err);
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  });
});

// Manejo de errores de conexión
connection.on('error', (err) => {
  console.error('Error en la conexión MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('La conexión a MySQL se perdió.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.log('MySQL rechazó la conexión (demasiadas conexiones).');
  }
  if (err.code === 'ECONNREFUSED') {
    console.log('MySQL rechazó la conexión.');
  }
});

// Puerto del servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
