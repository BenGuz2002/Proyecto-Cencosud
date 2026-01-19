const express = require('express');
const app = express();
const mysql = require('mysql2');
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

db.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
  } else {
    console.log('Conectado a MySQL correctamente');
  }
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

    // Validar que tenga los datos requeridos
    if (!nombre || !fecha_ingreso || !departamento) {
        return res.status(400).json({ error: "Faltan datos requeridos: nombre, fecha_ingreso, departamento" });
    }

    db.query(
        "INSERT INTO usuario (nombre, fecha_ingreso, departamento) VALUES (?,?,?)",
        [nombre, fecha_ingreso, departamento],
    (err, result) => {
        if(err) {
            console.error('Error en POST /usuario:', err);
            res.status(500).json({ error: "Error al crear usuario", details: err.message });
        } 
        else {
            res.status(201).json({ 
                message: "Usuario registrado correctamente", 
                id: result.insertId 
            });
        }
    });
});

app.get("/usuario", (req, res) => {
  db.query("SELECT id, nombre, fecha_ingreso, departamento FROM usuario", (err, result) => {
    if (err) {
      console.error('Error en query GET /usuario:', err);
      res.status(500).json({ error: "Error al obtener usuarios", details: err.message });
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

// GET - Obtener todas las fechas
app.get("/fechas", (req, res) => {
  db.query("SELECT * FROM fechas", (err, result) => {
    if (err) {
      console.error('Error en query GET /fechas:', err);
      res.status(500).json({ error: "Error al obtener fechas", details: err.message });
    } else {
      res.json(result);
    }
  });
});

// GET - Obtener fechas por usuario
app.get("/fechas/:usuario_id", (req, res) => {
  const usuario_id = req.params.usuario_id;
  db.query("SELECT * FROM fechas WHERE usuario_id = ?", [usuario_id], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Error al obtener fechas", details: err.message });
    } else {
      res.json(result);
    }
  });
});

// PUT - Editar usuario
app.put("/usuario/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, fecha_ingreso, departamento } = req.body;

  // Validar que tenga los datos requeridos
  if (!nombre || !fecha_ingreso || !departamento) {
    return res.status(400).json({ error: "Faltan datos requeridos: nombre, fecha_ingreso, departamento" });
  }

  console.log(`PUT /usuario/:id - ID: ${id}, nombre: ${nombre}, fecha: ${fecha_ingreso}, depto: ${departamento}`);

  db.query(
    "UPDATE usuario SET nombre = ?, fecha_ingreso = ?, departamento = ? WHERE id = ?",
    [nombre, fecha_ingreso, departamento, id],
    (err, result) => {
      if (err) {
        console.error('Error en PUT /usuario/:id:', err);
        res.status(500).json({ error: "Error al actualizar usuario", details: err.message });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: `Usuario no encontrado con ID: ${id}` });
      } else {
        res.json({ message: "Usuario actualizado correctamente", id: id });
      }
    }
  );
});

app.listen(3001, () => {
  console.log('Servidor corriendo en puerto 3001');
});