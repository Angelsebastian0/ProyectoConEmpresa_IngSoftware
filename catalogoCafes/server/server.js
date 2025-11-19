//server.js

import express from "express";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.static(path.join(__dirname, "..")));
app.use(cors());
app.use(bodyParser.json());

const DB_PATH = "catalogoCafes/server/database.json";


// Leer DB
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

// Guardar DB
function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/* GET – obtener productos */
app.get("/productos", (req, res) => {
  const db = readDB();
  res.json(db.productos);
});

/* GET – obtener producto por ID */
app.get("/productos/:id", (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);

  const producto = db.productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(producto);
});


/* POST – agregar producto */
app.post("/productos", (req, res) => {
  const db = readDB();
  const nuevo = {
    id: Date.now(),
    ...req.body
  };

  db.productos.push(nuevo);
  saveDB(db);

  res.json({ mensaje: "Producto agregado", producto: nuevo });
});

/* PUT – actualizar producto */
app.put("/productos/:id", (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);

  const index = db.productos.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });

  db.productos[index] = { ...db.productos[index], ...req.body };
  saveDB(db);

  res.json({ mensaje: "Producto actualizado" });
});

/* DELETE – eliminar */
app.delete("/productos/:id", (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);

  db.productos = db.productos.filter(p => p.id !== id);
  saveDB(db);

  res.json({ mensaje: "Producto eliminado" });
});

app.listen(3000, () => console.log("Servidor iniciado en http://localhost:3000"));
