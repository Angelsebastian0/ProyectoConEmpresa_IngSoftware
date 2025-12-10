import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
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
const PUB_PATH = path.join(__dirname, "publicaciones.json");


// ---------------------- UTILIDADES ----------------------

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { usuarios: [], productos: [] };
  }
}

function readPublicaciones() {
  try {
    const data = fs.readFileSync(PUB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { publicaciones: [] };
  }
}

function savePublicaciones(data) {
  fs.writeFileSync(PUB_PATH, JSON.stringify(data, null, 2));
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

//Publicaciones

app.get("/publicaciones", (req, res) => {
  const pub = readPublicaciones();
  res.json(pub.publicaciones);
});

app.post("/publicaciones", (req, res) => {
  if (!activeSession || activeSession.rol !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }

  const pub = readPublicaciones();
  const nueva = {
    id: Date.now(),
    titulo: req.body.titulo || "",
    contenido: req.body.contenido || "",
    imagen: req.body.imagen || "",
    fecha: new Date().toISOString()
  };

  pub.publicaciones.push(nueva);
  savePublicaciones(pub);

  res.json({ mensaje: "Publicación creada", publicacion: nueva });
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

// ---------------------- PEDIDOS / CHECKOUT ----------------------
app.post("/pedidos", async (req, res) => {
  try {
    const { customer, items, total, paymentMethod } = req.body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Datos de pedido incompletos" });
    }

    const db = readDB();
    const pedido = {
      id: String(Date.now()),
      customer,
      items,
      total,
      paymentMethod: paymentMethod || "nequi",
      status: "Pendiente",
      createdAt: new Date().toISOString()
    };

    db.pedidos = db.pedidos || [];
    db.pedidos.push(pedido);
    saveDB(db);

    // Pedido creado en estado Pendiente. La confirmación (pago) debe
    // realizarse con POST /pedidos/:id/confirm para decrementar stock
    // y enviar la factura.
    res.json({ ok: true, pedidoId: pedido.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error procesando el pedido" });
  }
});

// Endpoint para confirmar el pedido: verifica stock, decrementa,
// marca como Pagado, genera PDF y envía correo.
app.post("/pedidos/:id/confirm", async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const db = readDB();
    db.pedidos = db.pedidos || [];
    const pIndex = db.pedidos.findIndex(p => String(p.id) === String(pedidoId));
    if (pIndex === -1) return res.status(404).json({ error: "Pedido no encontrado" });

    const pedido = db.pedidos[pIndex];
    if (pedido.status !== "Pendiente") return res.status(400).json({ error: "Pedido no está en estado Pendiente" });

    // Verificar stock disponible
    const insufficient = [];
    pedido.items.forEach(it => {
      const prod = db.productos.find(p => String(p.id) === String(it.id));
      const available = prod ? (prod.stock || 0) : 0;
      if (!prod || available < it.cantidad) {
        insufficient.push({ id: it.id, nombre: it.nombre, required: it.cantidad, available });
      }
    });

    if (insufficient.length > 0) {
      return res.status(400).json({ error: "Stock insuficiente", details: insufficient });
    }

    // Decrementar stock
    pedido.items.forEach(it => {
      const prodIndex = db.productos.findIndex(p => String(p.id) === String(it.id));
      if (prodIndex !== -1) {
        db.productos[prodIndex].stock = (db.productos[prodIndex].stock || 0) - it.cantidad;
      }
    });

    // Marcar como pagado
    db.pedidos[pIndex].status = "Pagado";
    db.pedidos[pIndex].paidAt = new Date().toISOString();
    saveDB(db);

    // Generar PDF en memoria (reutiliza la lógica previa)
    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const pdfPromise = new Promise((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

    const customer = pedido.customer;
    const items = pedido.items;
    const total = pedido.total;

    doc.fontSize(18).text("Factura - Crossing Families Coffee", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Pedido: ${pedido.id}`);
    doc.text(`Fecha: ${pedido.createdAt}`);
    doc.moveDown();
    doc.text("Cliente:");
    doc.text(`${customer.nombre}`);
    doc.text(`${customer.direccion}`);
    doc.text(`Tel: ${customer.telefono}`);
    doc.text(`Email: ${customer.email}`);
    doc.moveDown();
    doc.text("Resumen de productos:");
    items.forEach((it, idx) => {
      doc.text(`${idx + 1}. ${it.nombre} — ${it.cantidad} x $${it.precio} = $${it.cantidad * it.precio}`);
    });
    doc.moveDown();
    doc.text(`Total: $${total}`, { align: "right" });
    doc.end();

    const pdfBuffer = await pdfPromise;

    // Envío de correo de prueba con Ethereal (si no hay credenciales)
    let testAccount = null;
    try {
      testAccount = await nodemailer.createTestAccount();
    } catch (err) {
      console.warn("No se pudo crear cuenta Ethereal:", err);
    }

    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
    } else if (testAccount) {
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    }

    let info = null;
    if (transporter) {
      info = await transporter.sendMail({
        from: 'no-reply@crossingcoffee.local',
        to: customer.email,
        subject: `Factura Pedido ${pedido.id}`,
        text: `Adjunto encontrará la factura de su pedido ${pedido.id}`,
        attachments: [ { filename: `factura-${pedido.id}.pdf`, content: pdfBuffer } ]
      });

      if (nodemailer.getTestMessageUrl && info) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Vista previa del correo (Ethereal):", previewUrl);
      }
    } else {
      console.warn("No se configuró transporter de correo. Pedido marcado como pagado, pero no se envió email.");
    }

    res.json({ ok: true, pedidoId: pedido.id, emailPreview: info ? nodemailer.getTestMessageUrl(info) : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error confirmando el pedido" });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
