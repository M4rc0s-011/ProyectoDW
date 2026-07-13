const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const path = require("path");
const { requireAuth } = require("./middlewares/session");
const authRoutes = require("./routes/auth.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const { notFound, errorHandler } = require("./middlewares/error");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.use(session({
  secret: "clave-secreta-proyectodw",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 1000 * 60 * 60 * 2 }
}));

// Express sirve el frontend (mismo origen -> sesiones sin CORS)
app.use(express.static(path.join(__dirname, "../../")));

app.use("/api/session", require("./routes/session.routes"));



const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/registros", requireAuth, require("./routes/admin.routes"));
app.use("/api/usuarios", usuariosRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;