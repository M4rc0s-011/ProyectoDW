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