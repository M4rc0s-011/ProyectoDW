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