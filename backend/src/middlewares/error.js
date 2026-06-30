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