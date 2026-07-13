// CRUD de registros. Protegido con requireAuth a nivel de mount en app.js
// (app.use("/api/registros", requireAuth, ...)), por eso no se repite aqui en cada ruta.
const { Router } = require("express");
const { pool } = require("../db");

const router = Router();

// GET /api/registros -> listar todos, mas recientes primero
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM registros ORDER BY id DESC");
    res.json({ message: "Lista de registros", data: rows });
  } catch (err) { next(err); }
});

// GET /api/registros/:id -> detalle de un registro puntual
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM registros WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Registro no encontrado" });
    res.json({ message: "Registro", data: rows[0] });
  } catch (err) { next(err); }
});

// POST /api/registros -> crear un registro nuevo
router.post("/", async (req, res, next) => {
  try {
    const { nombre, apellido, cedula, email, telefono, categoria, estado, fecha } = req.body;
    if (!nombre || !apellido || !cedula || !email) {
      return res.status(400).json({ message: "Nombre, apellido, cedula y email son obligatorios" });
    }
    const [r] = await pool.query(
      "INSERT INTO registros (nombre, apellido, cedula, email, telefono, categoria, estado, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [nombre, apellido, cedula, email, telefono || null, categoria || null, estado || "pendiente", fecha || null]
    );
    res.status(201).json({ message: "Registro creado", data: { id: r.insertId, ...req.body } });
  } catch (err) { next(err); }
});

// PUT /api/registros/:id -> actualizar un registro existente
router.put("/:id", async (req, res, next) => {
  try {
    const { nombre, apellido, cedula, email, telefono, categoria, estado, fecha } = req.body;
    const [r] = await pool.query(
      "UPDATE registros SET nombre=?, apellido=?, cedula=?, email=?, telefono=?, categoria=?, estado=?, fecha=? WHERE id=?",
      [nombre, apellido, cedula, email, telefono || null, categoria || null, estado || "pendiente", fecha || null, req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ message: "Registro no encontrado" });
    res.json({ message: "Registro actualizado", data: { id: Number(req.params.id), ...req.body } });
  } catch (err) { next(err); }
});

// DELETE /api/registros/:id -> eliminar un registro
router.delete("/:id", async (req, res, next) => {
  try {
    const [r] = await pool.query("DELETE FROM registros WHERE id = ?", [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ message: "Registro no encontrado" });
    res.json({ message: "Registro eliminado" });
  } catch (err) { next(err); }
});

module.exports = router;