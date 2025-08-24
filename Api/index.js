// archivo: index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./db');

app.use(express.json());

// ---------- USUARIOS ----------
app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/usuarios/:id', (req, res) => {
  db.query('SELECT * FROM usuarios WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(results[0]);
  });
});

app.post('/usuarios', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: "Faltan datos requeridos" });
  db.query('INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, username, email });
  });
});

// ---------- CONTACTOS ----------
app.get('/contactos/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT c.id, c.contact_id, u.username AS name, u.email, u.avatar, c.nickname, c.created_at
    FROM contacts c
    JOIN users u ON u.id = c.contact_id
    WHERE c.user_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/contactos', (req, res) => {
  const { user_id, contact_id, nickname } = req.body;
  if (!user_id || !contact_id) return res.status(400).json({ error: "Faltan datos requeridos" });
  db.query('INSERT INTO contacts (user_id, contact_id, nickname) VALUES (?, ?, ?)', [user_id, contact_id, nickname || null], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "El contacto ya existe" });
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, user_id, contact_id, nickname });
  });
});

// ---------- MENSAJES ----------
app.get('/mensajes/:conversacionId', (req, res) => {
  db.query('SELECT * FROM mensajes WHERE conversacion_id = ? ORDER BY created_at ASC', [req.params.conversacionId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/mensajes', (req, res) => {
  const { conversacion_id, remitente_id, contenido, tipo } = req.body;
  if (!conversacion_id || !remitente_id || !contenido) return res.status(400).json({ error: "Faltan datos requeridos" });
  db.query('INSERT INTO mensajes (conversacion_id, remitente_id, contenido, tipo) VALUES (?, ?, ?, ?)', [conversacion_id, remitente_id, contenido, tipo || 'texto'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, conversacion_id, remitente_id, contenido, tipo });
  });
});

// ---------- CONVERSACIONES ----------
app.get('/conversaciones/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT c.id, c.tipo, c.created_at, cm.mensaje_id, m.contenido AS ultimo_mensaje
    FROM conversaciones c
    LEFT JOIN (
      SELECT conversacion_id, MAX(id) AS mensaje_id
      FROM mensajes
      GROUP BY conversacion_id
    ) cm ON c.id = cm.conversacion_id
    LEFT JOIN mensajes m ON m.id = cm.mensaje_id
    WHERE c.id IN (
      SELECT conversacion_id FROM participantes_conversacion WHERE usuario_id = ?
    )
    ORDER BY c.created_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/conversaciones', (req, res) => {
  const { tipo } = req.body;
  if (!tipo) return res.status(400).json({ error: "Faltan datos requeridos" });
  db.query('INSERT INTO conversaciones (tipo) VALUES (?)', [tipo], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, tipo });
  });
});

// ---------- GRUPOS ----------
app.get('/grupos', (req, res) => {
  db.query('SELECT * FROM grupos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/grupos', (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: "Falta el nombre del grupo" });
  db.query('INSERT INTO grupos (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, nombre, descripcion });
  });
});

// ---------- LLAMADAS ----------
app.get('/llamadas/:userId', (req, res) => {
  db.query('SELECT * FROM llamadas WHERE usuario_id = ?', [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/llamadas', (req, res) => {
  const { usuario_id, tipo, estado } = req.body;
  if (!usuario_id || !tipo) return res.status(400).json({ error: "Faltan datos requeridos" });
  db.query('INSERT INTO llamadas (usuario_id, tipo, estado) VALUES (?, ?, ?)', [usuario_id, tipo, estado || 'pendiente'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, usuario_id, tipo, estado });
  });
});

// ---------- CAMBIAR CONTRASEÑA ----------
app.post('/cambiar-password', (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) return res.status(400).json({ error: "Faltan datos requeridos" });
  db.query('SELECT id FROM usuarios WHERE email = ? AND password = ?', [email, oldPassword], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: "Contraseña anterior incorrecta" });
    db.query('UPDATE usuarios SET password = ? WHERE email = ?', [newPassword, email], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Contraseña actualizada correctamente" });
    });
  });
});

// ---------- LOGIN ----------
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Faltan datos requeridos" });
  db.query('SELECT id, username, email FROM usuarios WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: "Credenciales incorrectas" });
    res.json(results[0]);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en el puerto ${PORT}`);
});
