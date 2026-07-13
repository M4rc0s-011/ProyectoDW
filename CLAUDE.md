# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Student group project (ISW-306, "Desarrollo Web") built in stages ("etapas"), one git branch per stage:
`etapa-1/maquetacion` (static HTML/CSS), `etapa-2/interactividad` (vanilla JS), `etapa-3/backend` (Express + MySQL API). Work happens on the branch for the current etapa.

The app is a registration dashboard: users log in, then create/list "registros" (people records).

## Structure

Two independent parts in one repo:

- **Frontend** — static files at the repo root, no build step:
  - `index.html` — dashboard (stats + table of registros)
  - `registro.html` — registration form
  - `app.js` — all client logic: real-time field validation (`REGLAS` rules + regexes), form submit, `fetch` calls to the API, DOM rendering of the table/counters
  - `style.css`
- **Backend** — Express REST API under `backend/` (see below).

The frontend talks to the backend at a **hardcoded** base URL `http://localhost:4000` (in `app.js`). The JWT is stored in `localStorage` under key `token` and sent as `Authorization: Bearer <token>`.

## Backend architecture (`backend/`)

- `src/server.js` — entry point. Loads `.env`, calls `testConnection()` and **exits (`process.exit(1)`) if the DB is unreachable**, then `app.listen`.
- `src/app.js` — builds the Express app: `helmet`, `cors` (origin from `CORS_ORIGIN`), JSON body parsing, a rate limiter on `/api/auth`, route mounting, then `notFound` + `errorHandler` last.
- `src/db.js` — single shared `mysql2/promise` connection **pool**. All queries use this pool with `?` placeholders.
- `src/middlewares/auth.js` — `verifyToken` (reads Bearer token, verifies JWT, sets `req.user`) and `validate` (turns express-validator errors into a 400 response).
- `src/middlewares/error.js` — `notFound` (404) and `errorHandler` (uses `err.status || 500`). Controllers propagate errors via `next(err)`.

### Routes (mounted in `src/app.js`)

- `/api/auth` → `auth.routes.js` (rate-limited): `POST /register`, `POST /login`. Validated with express-validator; logic in `controllers/auth.controller.js` (bcrypt hash/compare, JWT sign). **Public.**
- `/api/registros` → `admin.routes.js`: full CRUD on the `registros` table. **Currently NOT behind `verifyToken`** even though the frontend sends a token.
- `/api/usuarios` → `usuarios.routes.js`: `GET /me`, `PUT /perfil`. **Protected** with `verifyToken`.
- `GET /api/health` → `{ status: "ok" }`.

`src/routes/recurso.routes.js` is an **unfinished stub** (TODO placeholder, not mounted in `app.js`). Files carry `RESPONSABLE: <name>` / `TODO <name>` comments marking who owns unfinished pieces — don't treat those stubs as live code.

### API response convention

Success: `{ message, data }`. Errors: `{ message }`, or `{ message, errors: [{ campo, error }] }` for validation failures.

### Database (MySQL)

Two tables, split across two SQL files (run in this order):

1. `backend/database/schema.sql` — creates the `proyectodw` database and the `usuarios` table (auth: `id, nombre, email UNIQUE, password, fecha_registro`).
2. `backend/database/database.sql` — creates the `registros` table (the dashboard entity) plus seed rows.

## Commands

Backend (from `backend/`):

```bash
npm install
cp .env.example .env      # then edit; fill JWT_SECRET, DB_PASSWORD, etc.
npm run dev               # nodemon, auto-reload
npm start                 # plain node
```

Initialize the DB (MySQL must be running):

```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p proyectodw < backend/database/database.sql
```

Frontend: serve the repo root as static files — e.g. VS Code **Live Server on port 5500**. The port matters: `CORS_ORIGIN` in `.env` defaults to `http://localhost:5500` and must match how the frontend is served, or requests are blocked by CORS.

There are **no tests, linter, or build tooling** configured.

## Gotchas

- Backend won't start without a reachable MySQL matching the `.env` credentials — it exits on connection failure.
- Frontend API URL (`http://localhost:4000`) is hardcoded in `app.js`; changing `PORT` in `.env` means editing `app.js` too.
- Keep `CORS_ORIGIN` and the frontend's serving port in sync.
