const { Router } = require("express");
const bcrypt = require("bcryptjs");
const { verifyToken } = require("../middlewares/auth");
const { pool } = require("../db");
const router = Router();
// GET /api/admin/usuarios -> listar todos
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, email, fecha_registro FROM usuarios ORDER BY id DESC"
    );
    res.json({ message: "Lista de usuarios", data: rows });
  } catch (err) { next(err); }
});
// GET /api/admin/usuarios/:id -> detalle
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, email, fecha_registro FROM usuarios WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado"
});
    res.json({ message: "Usuario", data: rows[0] });
  } catch (err) { next(err); }
});

// POST /api/admin/usuarios -> crear
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password)
      return res.status(400).json({ message: "Nombre, email y password son obligatorios"
});
    const [existe] = await pool.query("SELECT id FROM usuarios WHERE email = ?",
[email]);
    if (existe.length > 0) return res.status(409).json({ message: "El email ya esta registrado" });
    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hash]
    );
    res.status(201).json({ message: "Usuario creado", data: { id: r.insertId, nombre,
email } });
  } catch (err) { next(err); }
});
// PUT /api/admin/usuarios/:id -> actualizar
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const { nombre, email } = req.body;
    if (!nombre || !email)
      return res.status(400).json({ message: "Nombre y email son obligatorios" });
    const [r] = await pool.query(
      "UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?",
      [nombre, email, req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario actualizado", data: { id: Number(req.params.id), nombre,
email } });
  } catch (err) { next(err); }
});
// DELETE /api/admin/usuarios/:id -> eliminar
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const [r] = await pool.query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  } catch (err) { next(err); }
});
module.exports = router;