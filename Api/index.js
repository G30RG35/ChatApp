// archivo: index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./db');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

app.use(express.json());

// ---------- USUARIOS ----------
app.get('/usuarios', async (req, res) => {
  try {
    await db.poolConnect;
    const result = await db.pool.request().query('SELECT * FROM users');
    res.json(result.recordset);
  } catch (err) {
    console.error('GET /usuarios:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/usuarios/:id', async (req, res) => {
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input('id', db.sql.VarChar(36), req.params.id)
      .query('SELECT * FROM users WHERE id = @id');
    if (result.recordset.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('GET /usuarios/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/usuarios', async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const id = uuidv4();
    const result = await db.pool
      .request()
      .input('id', db.sql.VarChar(36), id)
      .input('email', db.sql.VarChar(255), email)
      .input('password_hash', db.sql.VarChar(255), password)
      .input('first_name', db.sql.VarChar(100), "")
      .input('last_name', db.sql.VarChar(100), "")
      .input('username', db.sql.VarChar(100), username)
      .input('avatar_url', db.sql.VarChar(255), "")
      .input('phone_number', db.sql.VarChar(20), "")
      .input('bio', db.sql.VarChar(255), "")
      .input('location', db.sql.VarChar(100), "")
      .input('status', db.sql.VarChar(50), "offline")
      .input('last_seen', db.sql.DateTime, null)
      .input('language_code', db.sql.VarChar(10), "")
      .input('is_verified', db.sql.Bit, 0)
      .input('verification_code', db.sql.VarChar(10), "")
      .input('verification_expires', db.sql.DateTime, null)
      .input('created_at', db.sql.DateTime, new Date())
      .input('updated_at', db.sql.DateTime, new Date())
      .query(
      `INSERT INTO users (
        id, email, password_hash, first_name, last_name, username,
        avatar_url, phone_number, bio, location, status, last_seen,
        language_code, is_verified, verification_code, verification_expires,
        created_at, updated_at
      ) VALUES (
        @id, @email, @password_hash, @first_name, @last_name, @username,
        @avatar_url, @phone_number, @bio, @location, @status, @last_seen,
        @language_code, @is_verified, @verification_code, @verification_expires,
        @created_at, @updated_at
      )`
      );
    res.status(201).json({ id, username, email });
  } catch (err) {
    console.error('POST /usuarios:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input('email', db.sql.VarChar(255), email)
      .input('password_hash', db.sql.VarChar(255), password)
      .query('SELECT id, username, email, first_name, last_name FROM users WHERE email = @email AND password_hash = @password_hash');
    if (result.recordset.length === 0)
      return res.status(401).json({ error: "Credenciales incorrectas" });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('POST /login:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/cambiar-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input('email', db.sql.VarChar(255), email)
      .input('oldPassword', db.sql.VarChar(255), oldPassword)
      .query('SELECT id FROM users WHERE email = @email AND password_hash = @oldPassword');
    if (result.recordset.length === 0)
      return res.status(401).json({ error: "Contraseña anterior incorrecta" });
    await db.pool
      .request()
      .input('newPassword', db.sql.VarChar(255), newPassword)
      .input('email', db.sql.VarChar(255), email)
      .query('UPDATE users SET password_hash = @newPassword WHERE email = @email');
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error('POST /cambiar-password:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- CONTACTOS ----------
// ---------- CONTACTOS ----------
app.get('/contactos/:userId', async (req, res) => {
  const userId = req.params.userId;
  const sqlQuery = `
    SELECT 
      c.id, 
      c.contact_id, 
      u.username AS name, 
      u.email, 
      u.avatar_url, 
      c.nickname, 
      c.is_favorite, 
      c.created_at
    FROM contacts c
    JOIN users u ON u.id = c.contact_id
    WHERE c.user_id = @userId
  `;
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input('userId', db.sql.VarChar(36), userId)
      .query(sqlQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error('GET /contactos/:userId:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/contactos', async (req, res) => {
  const { user_id, contact_id, nickname, is_favorite } = req.body;
  if (!user_id || !contact_id)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const id = uuidv4();
    const result = await db.pool
      .request()
      .input('id', db.sql.VarChar(36), id)
      .input('user_id', db.sql.VarChar(36), user_id)
      .input('contact_id', db.sql.VarChar(36), contact_id)
      .input('nickname', db.sql.VarChar(100), nickname || null)
      .input('is_favorite', db.sql.Bit, is_favorite ? 1 : 0)
      .query(
        `INSERT INTO contacts (id, user_id, contact_id, nickname, is_favorite) 
         OUTPUT INSERTED.id 
         VALUES (@id, @user_id, @contact_id, @nickname, @is_favorite)`
      );
    res.status(201).json({ id, user_id, contact_id, nickname, is_favorite: !!is_favorite });
  } catch (err) {
    if (err.originalError && err.originalError.info && err.originalError.info.number === 2627) {
      // Unique constraint violation
      return res.status(409).json({ error: "El contacto ya existe" });
    }
    console.error('POST /contactos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/contactos/:id', async (req, res) => {
  const { id } = req.params;
  const { nickname, is_favorite } = req.body;
  if (!nickname && typeof is_favorite === 'undefined')
    return res.status(400).json({ error: "No hay datos para actualizar" });
  try {
    await db.poolConnect;
    const request = db.pool.request().input('id', db.sql.VarChar(36), id);
    let setClauses = [];
    if (nickname !== undefined) {
      request.input('nickname', db.sql.VarChar(100), nickname);
      setClauses.push('nickname = @nickname');
    }
    if (typeof is_favorite !== 'undefined') {
      request.input('is_favorite', db.sql.Bit, is_favorite ? 1 : 0);
      setClauses.push('is_favorite = @is_favorite');
    }
    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No hay datos para actualizar" });
    }
    const sql = `UPDATE contacts SET ${setClauses.join(', ')} WHERE id = @id`;
    await request.query(sql);
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /contactos/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/contactos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.poolConnect;
    await db.pool
      .request()
      .input('id', db.sql.VarChar(36), id)
      .query('DELETE FROM contacts WHERE id = @id');
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /contactos/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- MENSAJES ----------
app.get('/mensajes/:conversacionId', async (req, res) => {
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input('conversacionId', db.sql.Int, req.params.conversacionId)
      .query('SELECT * FROM mensajes WHERE conversacion_id = @conversacionId ORDER BY created_at ASC');
    res.json(result.recordset);
  } catch (err) {
    console.error('GET /mensajes/:conversacionId:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/mensajes', async (req, res) => {
  const { conversacion_id, remitente_id, contenido, tipo } = req.body;
  if (!conversacion_id || !remitente_id || !contenido)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input('conversacion_id', db.sql.Int, conversacion_id)
      .input('remitente_id', db.sql.Int, remitente_id)
      .input('contenido', db.sql.NVarChar, contenido)
      .input('tipo', db.sql.NVarChar, tipo || 'texto')
      .query(
        'INSERT INTO mensajes (conversacion_id, remitente_id, contenido, tipo) OUTPUT INSERTED.id VALUES (@conversacion_id, @remitente_id, @contenido, @tipo)'
      );
    res.status(201).json({ id: result.recordset[0].id, conversacion_id, remitente_id, contenido, tipo });
  } catch (err) {
    console.error('POST /mensajes:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- CONVERSACIONES ----------
app.get('/conversaciones/:userId', async (req, res) => {
  const { userId } = req.params.id;
  const sqlQuery = `
    SELECT c.id, c.tipo, c.created_at, cm.mensaje_id, m.contenido AS ultimo_mensaje
    FROM conversaciones c
    LEFT JOIN (
      SELECT conversacion_id, MAX(id) AS mensaje_id
      FROM mensajes
      GROUP BY conversacion_id
    ) cm ON c.id = cm.conversacion_id
    LEFT JOIN mensajes m ON m.id = cm.mensaje_id
    WHERE c.id IN (
      SELECT conversacion_id FROM participantes_conversacion WHERE usuario_id = @userId
    )
    ORDER BY c.created_at DESC
  `;
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input('userId', db.sql.Int, userId)
      .query(sqlQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error('GET /conversaciones/:userId:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/conversaciones', async (req, res) => {
  const { tipo } = req.body;
  if (!tipo) return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input('tipo', db.sql.NVarChar, tipo)
      .query('INSERT INTO conversaciones (tipo) OUTPUT INSERTED.id VALUES (@tipo)');
    res.status(201).json({ id: result.recordset[0].id, tipo });
  } catch (err) {
    console.error('POST /conversaciones:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- GRUPOS ----------
app.get('/grupos', async (req, res) => {
  try {
    await db.poolConnect;
    const result = await db.pool.request().query('SELECT * FROM grupos');
    res.json(result.recordset);
  } catch (err) {
    console.error('GET /grupos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/grupos', async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: "Falta el nombre del grupo" });
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input('nombre', db.sql.NVarChar, nombre)
      .input('descripcion', db.sql.NVarChar, descripcion || null)
      .query('INSERT INTO grupos (nombre, descripcion) OUTPUT INSERTED.id VALUES (@nombre, @descripcion)');
    res.status(201).json({ id: result.recordset[0].id, nombre, descripcion });
  } catch (err) {
    console.error('POST /grupos:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- LLAMADAS ----------
app.get('/llamadas/:userId', async (req, res) => {
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input('userId', db.sql.Int, req.params.userId)
      .query('SELECT * FROM llamadas WHERE usuario_id = @userId');
    res.json(result.recordset);
  } catch (err) {
    console.error('GET /llamadas/:userId:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/llamadas', async (req, res) => {
  const { usuario_id, tipo, estado } = req.body;
  if (!usuario_id || !tipo)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input('usuario_id', db.sql.Int, usuario_id)
      .input('tipo', db.sql.NVarChar, tipo)
      .input('estado', db.sql.NVarChar, estado || 'pendiente')
      .query(
        'INSERT INTO llamadas (usuario_id, tipo, estado) OUTPUT INSERTED.id VALUES (@usuario_id, @tipo, @estado)'
      );
    res.status(201).json({ id: result.recordset[0].id, usuario_id, tipo, estado });
  } catch (err) {
    console.error('POST /llamadas:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- EMAIL CÓDIGOS (sin cambios, solo ejemplo) ----------
app.post('/enviar-codigo', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Falta el email" });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tu-correo@gmail.com',
      pass: 'tu-contraseña'
    }
  });

  const mailOptions = {
    from: 'tu-correo@gmail.com',
    to: email,
    subject: 'Código de verificación',
    text: 'Tu código de verificación es: 123456'
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Código enviado" });
  } catch (err) {
    console.error('POST /enviar-codigo:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/verificar-email', (req, res) => {
  const { email, code } = req.body;
  if (code === "123456") {
    return res.json({ success: true });
  }
  res.status(400).json({ success: false, error: "Código incorrecto" });
});

app.post('/reenviar-codigo', async (req, res) => {
  const { oldEmail, newEmail } = req.body;
  if (!oldEmail || !newEmail) return res.status(400).json({ error: "Faltan emails requeridos" });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'correo@gmail.com',
      pass: 'contraseña'
    }
  });

  const mailOptions = {
    from: 'tu-correo@gmail.com',
    to: newEmail,
    subject: 'Reenvío de código de verificación',
    text: 'Tu código de verificación es: 123456'
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Código reenviado al nuevo correo" });
  } catch (err) {
    console.error('POST /reenviar-codigo:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en el puerto ${PORT}`);
});
