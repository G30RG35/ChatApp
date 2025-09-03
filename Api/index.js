// archivo: index.js
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const db = require("./db");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

app.use(express.json());

// ---------- USUARIOS ----------
app.get("/usuarios", async (req, res) => {
  try {
    await db.poolConnect;
    const result = await db.pool.request().query("SELECT * FROM users");
    res.json(result.recordset);
  } catch (err) {
    console.error("GET /usuarios:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/usuarios/:id", async (req, res) => {
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input("id", db.sql.VarChar(36), req.params.id)
      .query("SELECT * FROM users WHERE id = @id");
    if (result.recordset.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("GET /usuarios/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/usuarios", async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const id = uuidv4();
    const result = await db.pool
      .request()
      .input("id", db.sql.VarChar(36), id)
      .input("email", db.sql.VarChar(255), email)
      .input("password_hash", db.sql.VarChar(255), password)
      .input("first_name", db.sql.VarChar(100), "")
      .input("last_name", db.sql.VarChar(100), "")
      .input("username", db.sql.VarChar(100), username)
      .input("avatar_url", db.sql.VarChar(255), "")
      .input("phone_number", db.sql.VarChar(20), "")
      .input("bio", db.sql.VarChar(255), "")
      .input("location", db.sql.VarChar(100), "")
      .input("status", db.sql.VarChar(50), "offline")
      .input("last_seen", db.sql.DateTime, null)
      .input("language_code", db.sql.VarChar(10), "")
      .input("is_verified", db.sql.Bit, 0)
      .input("verification_code", db.sql.VarChar(10), "")
      .input("verification_expires", db.sql.DateTime, null)
      .input("created_at", db.sql.DateTime, new Date())
      .input("updated_at", db.sql.DateTime, new Date())
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
    console.error("POST /usuarios:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input("email", db.sql.VarChar(255), email)
      .input("password_hash", db.sql.VarChar(255), password)
      .query(
        "SELECT id, username, email, first_name, last_name FROM users WHERE email = @email AND password_hash = @password_hash"
      );
    if (result.recordset.length === 0)
      return res.status(401).json({ error: "Credenciales incorrectas" });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("POST /login:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/cambiar-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    // Verifica que el usuario y la contraseña actual sean correctos
    const result = await db.pool
      .request()
      .input("email", db.sql.VarChar(255), email)
      .input("oldPassword", db.sql.VarChar(255), oldPassword)
      .query(
        "SELECT id FROM users WHERE email = @email AND password_hash = @oldPassword"
      );
    if (result.recordset.length === 0)
      return res.status(401).json({ error: "Contraseña anterior incorrecta" });
    // Actualiza la contraseña
    await db.pool
      .request()
      .input("newPassword", db.sql.VarChar(255), newPassword)
      .input("email", db.sql.VarChar(255), email)
      .query(
        "UPDATE users SET password_hash = @newPassword WHERE email = @email"
      );
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("POST /cambiar-password:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- CONTACTOS ----------
// ---------- CONTACTOS ----------
app.get("/contactos/:userId", async (req, res) => {
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
      .input("userId", db.sql.VarChar(36), userId)
      .query(sqlQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error("GET /contactos/:userId:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/contactos", async (req, res) => {
  const { user_id, contact_id, nickname, is_favorite } = req.body;
  if (!user_id || !contact_id)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const id = uuidv4();
    const result = await db.pool
      .request()
      .input("id", db.sql.VarChar(36), id)
      .input("user_id", db.sql.VarChar(36), user_id)
      .input("contact_id", db.sql.VarChar(36), contact_id)
      .input("nickname", db.sql.VarChar(100), nickname || null)
      .input("is_favorite", db.sql.Bit, is_favorite ? 1 : 0)
      .query(
        `INSERT INTO contacts (id, user_id, contact_id, nickname, is_favorite) 
         OUTPUT INSERTED.id 
         VALUES (@id, @user_id, @contact_id, @nickname, @is_favorite)`
      );
    res
      .status(201)
      .json({ id, user_id, contact_id, nickname, is_favorite: !!is_favorite });
  } catch (err) {
    if (
      err.originalError &&
      err.originalError.info &&
      err.originalError.info.number === 2627
    ) {
      // Unique constraint violation
      return res.status(409).json({ error: "El contacto ya existe" });
    }
    console.error("POST /contactos:", err);
    res.status(500).json({ error: err.message });
  }
});

app.patch("/contactos/:id", async (req, res) => {
  const { id } = req.params;
  const { nickname, is_favorite } = req.body;
  if (!nickname && typeof is_favorite === "undefined")
    return res.status(400).json({ error: "No hay datos para actualizar" });
  try {
    await db.poolConnect;
    const request = db.pool.request().input("id", db.sql.VarChar(36), id);
    let setClauses = [];
    if (nickname !== undefined) {
      request.input("nickname", db.sql.VarChar(100), nickname);
      setClauses.push("nickname = @nickname");
    }
    if (typeof is_favorite !== "undefined") {
      request.input("is_favorite", db.sql.Bit, is_favorite ? 1 : 0);
      setClauses.push("is_favorite = @is_favorite");
    }
    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No hay datos para actualizar" });
    }
    const sql = `UPDATE contacts SET ${setClauses.join(", ")} WHERE id = @id`;
    await request.query(sql);
    res.json({ success: true });
  } catch (err) {
    console.error("PATCH /contactos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/contactos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.poolConnect;
    await db.pool
      .request()
      .input("id", db.sql.VarChar(36), id)
      .query("DELETE FROM contacts WHERE id = @id");
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /contactos/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- MENSAJES ----------
app.get("/mensajes/:conversacionId", async (req, res) => {
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input("conversacionId", db.sql.Int, req.params.conversacionId)
      .query(
        "SELECT * FROM mensajes WHERE conversacion_id = @conversacionId ORDER BY created_at ASC"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("GET /mensajes/:conversacionId:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/mensajes/grupo/:idGroup", async (req, res) => {
  const { idGroup } = req.params;
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input("idGroup", db.sql.VarChar(36), idGroup)
      .query(
        `SELECT 
          m.id, 
          m.conversacion_id AS conversation_id, 
          m.remitente_id AS sender_id, 
          u.username AS sender_name, 
          u.avatar_url AS sender_avatar, 
          m.contenido AS content, 
          m.tipo, 
          m.created_at, 
          m.status
        FROM messages m
        LEFT JOIN users u ON u.id = m.remitente_id
        WHERE m.conversacion_id = @idGroup
        ORDER BY m.created_at ASC`
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("GET /mensajes/grupo/:idGroup:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/mensajes", async (req, res) => {
  const { conversacion_id, remitente_id, contenido, tipo } = req.body;
  if (!conversacion_id || !remitente_id || !contenido)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input("conversacion_id", db.sql.Int, conversacion_id)
      .input("remitente_id", db.sql.Int, remitente_id)
      .input("contenido", db.sql.NVarChar, contenido)
      .input("tipo", db.sql.NVarChar, tipo || "texto")
      .query(
        "INSERT INTO mensajes (conversacion_id, remitente_id, contenido, tipo) OUTPUT INSERTED.id VALUES (@conversacion_id, @remitente_id, @contenido, @tipo)"
      );
    res
      .status(201)
      .json({
        id: result.recordset[0].id,
        conversacion_id,
        remitente_id,
        contenido,
        tipo,
      });
  } catch (err) {
    console.error("POST /mensajes:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- CONVERSACIONES ----------
app.get("/conversaciones/:userId", async (req, res) => {
  const userId = req.params.userId;
  const sqlQuery = `
    SELECT
  c.id AS conversation_id,
  c.name,
  c.is_group,
  c.updated_at,
  m.id AS last_message_id,
  m.content AS last_message,
  m.created_at AS last_message_time,
  u.username AS last_sender_username,
  -- NUEVO: nombre del contacto (para chats privados)
  (
    SELECT TOP 1 u2.username
    FROM conversation_participants cp2
    JOIN users u2 ON u2.id = cp2.user_id
    WHERE cp2.conversation_id = c.id AND cp2.user_id <> @userId
  ) AS contact_username,
  (
    SELECT TOP 1 u2.avatar_url
    FROM conversation_participants cp2
    JOIN users u2 ON u2.id = cp2.user_id
    WHERE cp2.conversation_id = c.id AND cp2.user_id <> @userId
  ) AS contact_avatar
FROM conversations c
INNER JOIN conversation_participants cp ON cp.conversation_id = c.id
LEFT JOIN messages m ON m.id = (
  SELECT TOP 1 id FROM messages
  WHERE conversation_id = c.id
  ORDER BY created_at DESC
)
LEFT JOIN users u ON u.id = m.sender_id
WHERE cp.user_id = @userId
ORDER BY c.updated_at DESC
  `;
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input("userId", db.sql.VarChar(36), userId)
      .query(sqlQuery);
    res.json(result.recordset);
    console.log(result.recordset);
  } catch (err) {
    console.error("GET /conversaciones/:userId:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/conversaciones", async (req, res) => {
  const { tipo } = req.body;
  if (!tipo) return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input("tipo", db.sql.NVarChar, tipo)
      .query(
        "INSERT INTO conversaciones (tipo) OUTPUT INSERTED.id VALUES (@tipo)"
      );
    res.status(201).json({ id: result.recordset[0].id, tipo });
  } catch (err) {
    console.error("POST /conversaciones:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- GRUPOS ----------
// Obtener grupos
app.get("/grupos", async (req, res) => {
  try {
    await db.poolConnect;
    const result = await db.pool.request().query(
      `SELECT id, name, description, avatar_url, created_by, is_public, max_members, created_at, updated_at FROM groups`
    );
    res.json(result.recordset);
  } catch (err) {
    console.error("GET /grupos:", err);
    res.status(500).json({ error: err.message });
  }
});

// Crear grupo con participantes (actualizado para usar conversation_participants)
app.post("/grupos", async (req, res) => {
  console.log("body ", req.body);
  const { name, participants, created_by } = req.body;
  console.log("Creando grupo:", { name, participants, created_by });

  if (!name || !created_by || !Array.isArray(participants) || participants.length === 0)
    return res.status(400).json({ error: "Faltan datos requeridos (name, created_by y participants)" });
  try {
    await db.poolConnect;
    const groupId = uuidv4();

    // 1. Crear el grupo
    await db.pool
      .request()
      .input("id", db.sql.VarChar(36), groupId)
      .input("name", db.sql.NVarChar, name)
      .input("created_by", db.sql.VarChar(36), created_by)
      .input("created_at", db.sql.DateTime, new Date())
      .input("updated_at", db.sql.DateTime, new Date())
      .query(
        `INSERT INTO groups (id, name, created_by, created_at, updated_at)
         VALUES (@id, @name, @created_by, @created_at, @updated_at)`
      );

    // 2. Crear la conversación asociada al grupo
    await db.pool
      .request()
      .input("id", db.sql.VarChar(36), groupId)
      .input("name", db.sql.NVarChar, name)
      .input("is_group", db.sql.Bit, 1)
      .input("created_by", db.sql.VarChar(36), created_by)
      .input("created_at", db.sql.DateTime, new Date())
      .input("updated_at", db.sql.DateTime, new Date())
      .query(
        `INSERT INTO conversations (id, name, is_group, created_by, created_at, updated_at)
         VALUES (@id, @name, @is_group, @created_by, @created_at, @updated_at)`
      );

    // 3. Insertar participantes en conversation_participants (incluye al creador)
    const allParticipants = Array.from(new Set([created_by, ...participants]));
    for (const userId of allParticipants) {
      await db.pool
        .request()
        .input("id", db.sql.VarChar(36), uuidv4())
        .input("conversation_id", db.sql.VarChar(36), groupId)
        .input("user_id", db.sql.VarChar(36), userId)
        .input("role", db.sql.NVarChar, userId === created_by ? "admin" : "member")
        .input("joined_at", db.sql.DateTime, new Date())
        .input("left_at", db.sql.DateTime, null)
        .query(
          `INSERT INTO conversation_participants (id, conversation_id, user_id, role, joined_at, left_at)
           VALUES (@id, @conversation_id, @user_id, @role, @joined_at, @left_at)`
        );
    }

    res.status(201).json({
      id: groupId,
      name,
      created_by,
      participantIds: allParticipants,
      created_at: new Date(),
      updated_at: new Date(),
    });
  } catch (err) {
    console.error("POST /grupos:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- LLAMADAS ----------
app.get("/llamadas/:userId", async (req, res) => {
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input("userId", db.sql.Int, req.params.userId)
      .query("SELECT * FROM llamadas WHERE usuario_id = @userId");
    res.json(result.recordset);
  } catch (err) {
    console.error("GET /llamadas/:userId:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/llamadas", async (req, res) => {
  const { usuario_id, tipo, estado } = req.body;
  if (!usuario_id || !tipo)
    return res.status(400).json({ error: "Faltan datos requeridos" });
  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input("usuario_id", db.sql.Int, usuario_id)
      .input("tipo", db.sql.NVarChar, tipo)
      .input("estado", db.sql.NVarChar, estado || "pendiente")
      .query(
        "INSERT INTO llamadas (usuario_id, tipo, estado) OUTPUT INSERTED.id VALUES (@usuario_id, @tipo, @estado)"
      );
    res
      .status(201)
      .json({ id: result.recordset[0].id, usuario_id, tipo, estado });
  } catch (err) {
    console.error("POST /llamadas:", err);
    res.status(500).json({ error: err.message });
  }
});
// ---------- EMAIL CÓDIGOS (mejorado) ----------

// Genera un código aleatorio de 6 dígitos
function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post("/enviar-codigo", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Falta el email" });

  const codigo = generarCodigo();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.correo,
      pass: process.env.pass,
    },
  });

  const mailOptions = {
    from: process.env.correo,
    to: email,
    subject: "Código de verificación",
    text: `Tu código de verificación es: ${codigo}`,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Guarda el código en la base de datos (en la tabla users, si existe el usuario, actualiza; si no, inserta provisional)
    await db.poolConnect;
    // Busca si ya existe un usuario con ese email
    const existe = await db.pool
      .request()
      .input("email", db.sql.VarChar(255), email)
      .query("SELECT id FROM users WHERE email = @email");
    if (existe.recordset.length > 0) {
      // Actualiza el código y expiración
      await db.pool
        .request()
        .input("email", db.sql.VarChar(255), email)
        .input("verification_code", db.sql.VarChar(10), codigo)
        .input("verification_expires", db.sql.DateTime, expires)
        .query(
          "UPDATE users SET verification_code = @verification_code, verification_expires = @verification_expires WHERE email = @email"
        );
    } else {
      // Inserta usuario provisional solo con email y código
      const id = uuidv4();
      await db.pool
        .request()
        .input("id", db.sql.VarChar(36), id)
        .input("email", db.sql.VarChar(255), email)
        .input("verification_code", db.sql.VarChar(10), codigo)
        .input("verification_expires", db.sql.DateTime, expires)
        .query(
          `INSERT INTO users (id, email, verification_code, verification_expires, is_verified, created_at, updated_at)
           VALUES (@id, @email, @verification_code, @verification_expires, 0, GETDATE(), GETDATE())`
        );
    }

    res.json({ success: true, message: "Código enviado" });
  } catch (err) {
    console.error("POST /enviar-codigo:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/verificar-email", async (req, res) => {
  const { email, code } = req.body;
  console.log(req.body);
  if (!email || !code)
    return res.status(400).json({ error: "Faltan datos requeridos" });

  try {
    await db.poolConnect;
    const result = await db.pool
      .request()
      .input("email", db.sql.VarChar(255), email)
      .input("code", db.sql.VarChar(10), code)
      .query(
        `SELECT id, verification_expires FROM users WHERE email = @email AND verification_code = @code`
      );
    if (result.recordset.length === 0)
      return res
        .status(400)
        .json({ success: false, error: "Código incorrecto" });

    const expires = result.recordset[0].verification_expires;
    if (expires && new Date() > expires)
      return res.status(400).json({ success: false, error: "Código expirado" });

    // Marca como verificado
    await db.pool
      .request()
      .input("email", db.sql.VarChar(255), email)
      .query("UPDATE users SET is_verified = 1 WHERE email = @email");

    res.json({ success: true });
  } catch (err) {
    console.error("POST /verificar-email:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/reenviar-codigo", async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  if (!email) return res.status(400).json({ error: "Falta el email" });

  // Simplemente reutiliza la lógica de enviar-codigo
  req.body = { email };
  app._router.handle(req, res, () => {}, "post", "/enviar-codigo");
});

// ---------- MENSAJES DE PRUEBA (DATA FAKE) ----------
// Inserta mensajes de prueba en memoria para simular funcionamiento
const mensajesFake = [
  {
    id: "m1",
    conversation_id: "aaaa1111-aaaa-1111-aaaa-111111111111",
    sender_id: "11111111-1111-1111-1111-111111111111", // Pedro
    sender_name: "Pedro",
    sender_avatar: "",
    content: "¡Hola a todos, soy Pedro!",
    tipo: "text",
    created_at: new Date(),
    status: "sent",
  },
  {
    id: "m2",
    conversation_id: "aaaa1111-aaaa-1111-aaaa-111111111111",
    sender_id: "22222222-2222-2222-2222-222222222222", // Bob
    sender_name: "Bob",
    sender_avatar: "",
    content: "¡Hola Pedro! Soy Bob.",
    tipo: "text",
    created_at: new Date(),
    status: "sent",
  },
  {
    id: "m3",
    conversation_id: "aaaa1111-aaaa-1111-aaaa-111111111111",
    sender_id: "3374e106-6ec3-4c7e-b127-5eb7be480a71", // Tú
    sender_name: "Jorge",
    sender_avatar: "",
    content: "¡Bienvenidos al grupo!",
    tipo: "text",
    created_at: new Date(),
    status: "sent",
  },
];

// Endpoint para mensajes de grupo (simulado)
app.get("/mensajes/grupo/:idGroup", async (req, res) => {
  const { idGroup } = req.params;
  // Devuelve los mensajes fake si la conversación es la de prueba
  if (idGroup === "aaaa1111-aaaa-1111-aaaa-111111111111") {
    return res.json(mensajesFake);
  }
  // Si no, responde vacío
  res.json([]);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en el puerto ${PORT}`);
});
