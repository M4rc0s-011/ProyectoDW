function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ message: "No autorizado. Inicia sesion." });
}
module.exports = { requireAuth };