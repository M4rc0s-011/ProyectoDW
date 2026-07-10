const { Router } = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const { requireAuth } = require("../middlewares/session");
const router = Router();
// POST /api/session/login -> valida contra la tabla usuarios y crea la sesion
router.post("/login", async (req, res, next) => {
try {
const { email, password } = req.body;
if (!email || !password)
return res.status(400).json({ message: "Email y password obligatorios" });
const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
if (rows.length === 0) return res.status(401).json({ message: "Credenciales invalidas" });
const usuario = rows[0];
const ok = await bcrypt.compare(password, usuario.password);
if (!ok) return res.status(401).json({ message: "Credenciales invalidas" });
req.session.usuario = { id: usuario.id, nombre: usuario.nombre, email: usuario.email
};
res.json({ message: "Sesion iniciada", data: req.session.usuario });
} catch (err) { next(err); }
});
// GET /api/session/me -> hay sesion activa?
router.get("/me", requireAuth, (req, res) => {
res.json({ message: "Sesion activa", data: req.session.usuario });
});
// POST /api/session/logout -> destruye la sesion
router.post("/logout", (req, res) => {
req.session.destroy(() => {
res.clearCookie("connect.sid");
res.json({ message: "Sesion cerrada" });
});
});
module.exports = router;