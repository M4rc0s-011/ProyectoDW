-- ProyectoDW - Etapa 3 - Base de datos
-- Tabla de registros del sistema de gestion + datos de ejemplo

CREATE TABLE IF NOT EXISTS registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL,
  telefono VARCHAR(20),
  categoria VARCHAR(50),
  estado VARCHAR(20) DEFAULT 'pendiente',
  fecha DATE
);

INSERT INTO registros (nombre, apellido, cedula, email, telefono, categoria, estado, fecha) VALUES
('Ana', 'Perez', '001-1234567-8', 'ana@test.com', '809-111-2222', 'A', 'activo', '2026-01-15'),
('Luis', 'Gomez', '002-7654321-9', 'luis@test.com', '829-333-4444', 'B', 'pendiente', '2026-02-10'),
('Maria', 'Diaz', '003-1112223-4', 'maria@test.com', '849-555-6666', 'A', 'inactivo', '2026-03-05');