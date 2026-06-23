$ErrorActionPreference = "Stop"
$files = @{}

$files["package.json"] = @'
{
  "name": "proyectodw-backend",
  "version": "1.0.0",
  "description": "Backend Etapa 3 - ProyectoDW (ISW-306)",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.4.0",
    "express-validator": "^7.2.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
'@

$files[".env.example"] = @'
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=proyectodw
JWT_SECRET=cambia_esto_por_una_clave_larga_y_secreta
JWT_EXPIRES_IN=2h
CORS_ORIGIN=http://localhost:5500
'@

$files[".gitignore"] = @'
node_modules/
.env
npm-debug.log*
.DS_Store
'@

$files["database\schema.sql"] = @'
CREATE DATABASE IF NOT EXISTS proyectodw
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE proyectodw;

CREATE TABLE IF NOT EXISTS usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL UNIQUE,
  password       VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TODO (Abimilet): agregar la tabla de la entidad principal del dashboard,
-- sus claves foraneas, indices y datos de prueba (seeds).
'@

$files["src\db.js"] = @'
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log("[DB] Conexion a MySQL OK");
}

module.exports = { pool, testConnection };
'@

$files["src\middlewares\auth.js"] = @'
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
}

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Datos invalidos",
      errors: errors.array().map((e) => ({ campo: e.path, error: e.msg })),
    });
  }
  next();
}

module.exports = { verifyToken, validate };
'@

$files["src\middlewares\error.js"] = @'
function notFound(req, res) {
  res.status(404).json({ message: "Ruta no encontrada" });
}

function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
}

module.exports = { notFound, errorHandler };
'@

$files["src\controllers\auth.controller.js"] = @'
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

async function register(req, res, next) {
  try {
    const { nombre, email, password } = req.body;
    const [existe] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existe.length > 0) {
      return res.status(409).json({ message: "El email ya esta registrado" });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hash]
    );
    return res.status(201).json({
      message: "Usuario registrado",
      data: { id: result.insertId, nombre, email },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }
    const usuario = rows[0];
    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    );
    return res.json({
      message: "Login correcto",
      data: {
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
'@

$files["src\routes\auth.routes.js"] = @'
const { Router } = require("express");
const { body } = require("express-validator");
const { validate } = require("../middlewares/auth");
const { register, login } = require("../controllers/auth.controller");

const router = Router();

router.post(
  "/register",
  [
    body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Email invalido"),
    body("password").isLength({ min: 6 }).withMessage("La contrasena debe tener al menos 6 caracteres"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email invalido"),
    body("password").notEmpty().withMessage("La contrasena es obligatoria"),
  ],
  validate,
  login
);

module.exports = router;
'@

$files["src\routes\recurso.routes.js"] = @'
// CRUD de la entidad principal -> RESPONSABLE: Jean
// Renombrar "recurso"/"recursos" por la entidad real (coordinar con Abimilet).
// Todas las rutas protegidas con verifyToken. Usar pool de ../db y queries con ? .
const { Router } = require("express");
const { verifyToken } = require("../middlewares/auth");
// const { pool } = require("../db");

const router = Router();

router.get("/", verifyToken, async (req, res, next) => {
  try { res.json({ message: "TODO Jean: listar", data: [] }); }
  catch (err) { next(err); }
});

router.get("/:id", verifyToken, async (req, res, next) => {
  try { res.json({ message: "TODO Jean: detalle " + req.params.id }); }
  catch (err) { next(err); }
});

router.post("/", verifyToken, async (req, res, next) => {
  try { res.status(201).json({ message: "TODO Jean: crear" }); }
  catch (err) { next(err); }
});

router.put("/:id", verifyToken, async (req, res, next) => {
  try { res.json({ message: "TODO Jean: actualizar " + req.params.id }); }
  catch (err) { next(err); }
});

router.delete("/:id", verifyToken, async (req, res, next) => {
  try { res.json({ message: "TODO Jean: eliminar " + req.params.id }); }
  catch (err) { next(err); }
});

module.exports = router;
'@

$files["src\routes\usuarios.routes.js"] = @'
// Sesion y perfil -> RESPONSABLE: Ismelin
// GET /api/usuarios/me  y  PUT /api/usuarios/perfil (protegidos con verifyToken).
const { Router } = require("express");
const { verifyToken } = require("../middlewares/auth");
// const { pool } = require("../db");

const router = Router();

router.get("/me", verifyToken, async (req, res, next) => {
  try { res.json({ message: "TODO Ismelin: perfil", data: req.user }); }
  catch (err) { next(err); }
});

module.exports = router;
'@

$files["src\app.js"] = @'
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const recursoRoutes = require("./routes/recurso.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const { notFound, errorHandler } = require("./middlewares/error");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/recursos", recursoRoutes);
app.use("/api/usuarios", usuariosRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
'@

$files["src\server.js"] = @'
require("dotenv").config();
const app = require("./app");
const { testConnection } = require("./db");

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log("[SERVER] Backend corriendo en http://localhost:" + PORT);
    });
  } catch (err) {
    console.error("[SERVER] No se pudo iniciar:", err.message);
    process.exit(1);
  }
})();
'@

foreach ($path in $files.Keys) {
  $dir = Split-Path $path -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $files[$path] | Set-Content -Path $path -Encoding UTF8 -NoNewline
}

Write-Host ""
Write-Host "Listo: $($files.Count) archivos creados." -ForegroundColor Green
Write-Host "Ahora corre:  npm install" -ForegroundColor Cyan