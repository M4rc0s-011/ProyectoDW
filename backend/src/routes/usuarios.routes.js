// Sesion y perfil -> RESPONSABLE: Ismelin
// GET /api/usuarios/me  y  PUT /api/usuarios/perfil (protegidos con verifyToken).
const { Router } = require("express");
 const { verifyToken } = require("../middlewares/auth"); 
const { pool } = require("../db"); 
const router = Router();
 // GET /api/usuarios/me -> datos del usuario logueado
 router.get("/me", verifyToken, async (req, res, next) => {  
  try {
  const [rows] = await pool.query(
  "SELECT id, nombre, email, fecha_registro FROM usuarios WHERE id = ?",
   [req.user.id]
   ); 
    if (rows.length === 0) { 
  return res.status(404).json({ message: "Usuario no encontrado" });    
}    
res.json({ message: "Perfil del usuario", data: rows[0] });  
} catch (err) { 
     next(err); 
 }
 });
  // PUT /api/usuarios/perfil -> actualizar nombre y email
 router.put("/perfil", verifyToken, async (req, res, next) => {
 try { 
const { nombre, email } = req.body;
if (!nombre || !email) { 
 return res.status(400).json({ message: "Nombre y email son obligatorios" });
 } 
 await pool.query(
 "UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?",
 [nombre, email, req.user.id] 
 );
 res.json({ message: "Perfil actualizado", data: { id: req.user.id, nombre, email }
 });
 } catch (err) { 
 next(err); 
 } 
});

module.exports = router;