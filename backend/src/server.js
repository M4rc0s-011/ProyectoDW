require("dotenv").config();
const app = require("./app");
const { testConnection } = require("./db");

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log("[SERVER] Backend corriendo en http://localhost:" + PORT);
    });
  } catch (err) {
    console.error("[SERVER] No se pudo iniciar:", err);
    process.exit(1);
  }
})();