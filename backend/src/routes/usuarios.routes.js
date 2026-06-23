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