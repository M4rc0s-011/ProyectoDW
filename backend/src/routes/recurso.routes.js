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