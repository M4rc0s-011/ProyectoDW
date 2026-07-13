Sistema de Gestión — ProyectoDW (ISW-306)
Aplicación web para registrar y administrar personas, desarrollada de forma incremental en 4 etapas durante el trimestre.

Descripción
Dashboard de gestión de "registros" (fichas de personas). El usuario inicia sesión, y desde el panel puede crear, listar, editar y eliminar registros. La autenticación se maneja con sesiones de servidor (express-session); las rutas de datos quedan protegidas y solo responden con una sesión activa.

Stack
Frontend: HTML5, CSS3, Bootstrap 5, JavaScript (vanilla)
Backend: Node.js + Express, sesiones con express-session
Base de datos: MySQL (Railway)
Estructura

ProyectoDW/
├── index.html        -> Dashboard (privado)
├── registro.html     -> Formulario de registro/edición (privado)
├── login.html        -> Inicio de sesión
├── app.js            -> Lógica del frontend
├── style.css         -> Estilos
└── backend/
    ├── src/
    │   ├── server.js     -> Punto de entrada (arranca tras verificar DB)
    │   ├── app.js        -> Configura Express, sirve el frontend y monta rutas
    │   ├── db.js         -> Pool de conexiones MySQL
    │   ├── routes/       -> session, registros, auth, usuarios
    │   └── middlewares/  -> protección de sesión y manejo de errores
    └── database/
        └── database.sql  -> esquema + datos de ejemplo
El frontend lo sirve el propio Express: se accede todo desde http://localhost:4000.

Cómo correrlo
cd backend
npm install
Crear .env (ver .env.example) con las credenciales de MySQL
Cargar la base de datos:

mysql -u root -p < database/database.sql
npm run dev
Abrir http://localhost:4000/login.html
Credenciales de prueba
Email	Password
marcos@test.com	123456
Endpoints principales
Método	Ruta	Descripción	Sesión
POST	/api/session/login	Iniciar sesión	—
POST	/api/session/logout	Cerrar sesión	✔️
GET	/api/registros	Listar registros	✔️
POST	/api/registros	Crear registro	✔️
PUT	/api/registros/:id	Editar registro	✔️
DELETE	/api/registros/:id	Eliminar registro	✔️
Convención de respuesta: éxito { message, data } · error { message }.

Etapas del proyecto
Etapa	Rama	Contenido
1	etapa-1/maquetacion	Maquetación estática (HTML/CSS)
2	etapa-2/interactividad	Validación y DOM (JS vanilla)
3	etapa-3/backend	API REST con Express + MySQL
4	etapa-4/base	Sesiones, CRUD e integración
Equipo
Integrante	Rol
Marcos Rodríguez	Arquitectura, sesiones e integración
Kirsys Méndez	Interfaz con Bootstrap
Jean De la Rosa	CRUD completo
Ismelin Batista	Login/logout y protección de rutas
Abimilet Peralta	Base de datos, calidad y documentación