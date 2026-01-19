const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const cors = require('cors');
const crypto = require('crypto');



app.use(cors());
app.use(express.json());

// Función para hashear contraseña
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "5170",
    database: "cencosud"
});


app.post("/create", (req, res) => {
    // constantes para usuario
    const id = req.params.id;
    const nombre = req.body.nombre;
    const fecha_ingreso = req.body.fecha_ingreso;
    const departamento = req.body.departamento;

    // Constantes para fechas
    const fecha = req.body.fecha;
    const usuario_id = req.body.usuario_id;
    const evaluacion = req.body.evaluacion;
    const sueldo_base = req.body.sueldo_base;
    const bono = req.body.bono;

    db.query("INSERT INTO fechas (fecha, usuario_id, evaluacion, sueldo_base, bono) VALUES (?,?,?,?,?)", [fecha, usuario_id, evaluacion, sueldo_base, bono], 
    (err, result) => {
        if(err) {
            console.log(err);
        } 
        else {
            res.send("Registro insertado");
        }
    }
); 
});

app.post("/usuario", (req, res) => {
    const nombre = req.body.nombre;
    const fecha_ingreso = req.body.fecha_ingreso;
    const departamento = req.body.departamento;

    db.query(
        "INSERT INTO usuario (nombre, fecha_ingreso, departamento) VALUES (?,?,?)",
        [nombre, fecha_ingreso, departamento],
    (err, result) => {
        if(err) {
            console.log(err);
        } 
        else {
            res.send("Usuario registrado");
        }
    });
});

app.get("/usuario", (req, res) => {
  db.query("SELECT id, nombre, fecha_ingreso, departamento FROM usuario", (err, result) => {
    if (err) {
      res.status(500).send("Error al obtener usuarios");
    } else {
      res.json(result);
    }
  });
});

app.get("/usuario/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT id, nombre FROM usuario WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Error al obtener usuario", details: err.message });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
    } else {
      res.json(result);
    }
  });
});





app.listen(3001, () => {
  console.log('Servidor corriendo en puerto 3001');
});