import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Servir HTML/CSS/JS
app.use(express.static(path.join(__dirname, "..")));

const DB_PATH = path.join(__dirname, "database.json");

// ---------------------- UTILIDADES ----------------------

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { usuarios: [], productos: [] };
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

let activeSession = null;

// ---------------------- PRODUCTOS ----------------------

// Obtener todos los productos
app.get("/productos", (req, res) => {
  const db = readDB();
  res.json(db.productos);
});

// Obtener un producto por ID
app.get("/productos/:id", (req, res) => {
  const db = readDB();
  const producto = db.productos.find((p) => String(p.id) === req.params.id);

  if (!producto)
    return res.status(404).json({ error: "Producto no encontrado" });

  res.json(producto);
});

// Crear un producto nuevo
app.post("/productos", (req, res) => {
  const db = readDB();
  const nuevo = {
    id: String(Date.now()),
    ...req.body,
  };

  db.productos.push(nuevo);
  saveDB(db);

  res.json({ mensaje: "Producto creado", producto: nuevo });
});

// EDITAR un producto (CORREGIDO)
app.put("/productos/:id", (req, res) => {
  const db = readDB();
  const id = req.params.id;

  const index = db.productos.findIndex((p) => String(p.id) === id);
  if (index === -1)
    return res.status(404).json({ error: "Producto no encontrado" });

  db.productos[index] = { ...db.productos[index], ...req.body };
  saveDB(db);

  res.json({ mensaje: "Producto actualizado", producto: db.productos[index] });
});

// ELIMINAR producto (CORREGIDO)
app.delete("/productos/:id", (req, res) => {
  const db = readDB();
  const id = req.params.id;

  const index = db.productos.findIndex((p) => String(p.id) === id);
  if (index === -1)
    return res.status(404).json({ error: "Producto no encontrado" });

  const eliminado = db.productos.splice(index, 1)[0];
  saveDB(db);

  res.json({ mensaje: "Producto eliminado", producto: eliminado });
});

// ---------------------- AUTENTICACIÓN ----------------------

// Registrar usuario
app.post("/register", (req, res) => {
  const db = readDB();
  const { nombre, correo, clave } = req.body;

  if (!nombre || !correo || !clave)
    return res.status(400).json({ error: "Faltan datos" });

  const existe = db.usuarios.some((u) => u.correo === correo);
  if (existe) return res.status(409).json({ error: "Correo ya registrado" });

  const nuevo = {
    id: Date.now(),
    nombre,
    correo,
    clave,
    rol: "cliente",
    carrito: [],
  };

  db.usuarios.push(nuevo);
  saveDB(db);

  res.json({
    mensaje: "Usuario registrado",
    usuario: {
      id: nuevo.id,
      nombre: nuevo.nombre,
      correo: nuevo.correo,
      rol: nuevo.rol,
    },
  });
});

// Login
app.post("/login", (req, res) => {
  const db = readDB();
  const { correo, clave } = req.body;

  const user = db.usuarios.find((u) => u.correo === correo);

  if (!user)
    return res.status(401).json({ error: "Correo no registrado" });

  if (user.clave !== clave)
    return res.status(401).json({ error: "Clave incorrecta" });

  activeSession = {
    id: user.id,
    nombre: user.nombre,
    rol: user.rol,
  };

  res.json({
    mensaje: "Login exitoso",
    usuario: {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
    },
  });
});

// Logout
app.post("/logout", (req, res) => {
  activeSession = null;
  res.json({ mensaje: "Sesión cerrada" });
});

// Obtener sesión
app.get("/session", (req, res) => {
  if (!activeSession) return res.json({ session: null });

  const db = readDB();
  const user = db.usuarios.find((u) => u.id === activeSession.id);

  if (!user) {
    activeSession = null;
    return res.json({ session: null });
  }

  res.json({ session: user });
});

// ---------------------- CARRITO ----------------------

app.get("/carrito", (req, res) => {
  if (!activeSession)
    return res.status(401).json({ error: "No hay sesión activa" });

  const db = readDB();
  const user = db.usuarios.find((u) => u.id === activeSession.id);

  res.json({ carrito: user.carrito });
});

app.post("/carrito", (req, res) => {
  if (!activeSession)
    return res.status(401).json({ error: "No hay sesión activa" });

  const db = readDB();
  const userIndex = db.usuarios.findIndex((u) => u.id === activeSession.id);

  db.usuarios[userIndex].carrito = req.body.carrito;
  saveDB(db);

  res.json({ mensaje: "Carrito actualizado" });
});

// ---------------------- SERVIDOR ----------------------
const PORT = 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
