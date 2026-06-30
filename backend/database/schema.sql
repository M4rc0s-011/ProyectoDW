CREATE DATABASE IF NOT EXISTS proyectodw
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE proyectodw;

CREATE TABLE IF NOT EXISTS usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL UNIQUE,
  password       VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TODO (Abimilet): agregar la tabla de la entidad principal del dashboard,
-- sus claves foraneas, indices y datos de prueba (seeds).