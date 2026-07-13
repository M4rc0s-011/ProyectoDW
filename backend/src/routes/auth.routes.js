const { Router } = require("express");
const { body } = require("express-validator");
const { validate } = require("../middlewares/auth");
const { register, login } = require("../controllers/auth.controller");

const router = Router();

router.post(
  "/register",
  [
    body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Email invalido"),
    body("password").isLength({ min: 6 }).withMessage("La contrasena debe tener al menos 6 caracteres"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email invalido"),
    body("password").notEmpty().withMessage("La contrasena es obligatoria"),
  ],
  validate,
  login
);

module.exports = router;