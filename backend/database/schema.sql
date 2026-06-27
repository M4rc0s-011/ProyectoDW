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

-- ProyectoDW - Etapa 3 - Base de datos (export)
-- Tabla usuarios + datos de prueba (todos con contrasena: 123456)
CREATE TABLE IF NOT EXISTS usuarios (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
email VARCHAR(150) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nombre, email, password) VALUES
('Ana Perez', 'ana@test.com',
'$2b$10$3iCi5kJRlM1HC4gERtb7CeY9N5O3ulw8z9NX65SDk./uzKZVzxYYK'),
('Luis Gomez', 'luis@test.com',
'$2b$10$3iCi5kJRlM1HC4gERtb7CeY9N5O3ulw8z9NX65SDk./uzKZVzxYYK'),
('Maria Diaz', 'maria@test.com',
'$2b$10$3iCi5kJRlM1HC4gERtb7CeY9N5O3ulw8z9NX65SDk./uzKZVzxYYK');