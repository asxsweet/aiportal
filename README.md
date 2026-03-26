# Robotics Education Platform (RoboLearn)

Full-stack app: **React (Vite) + Tailwind** frontend, **Node.js + Express + MongoDB (Mongoose)** backend, **JWT** auth, **Multer** uploads (PDF/DOC/DOCX), mock **AI evaluation**, **i18n** (en / ru / kz).

## Prerequisites

- Node.js 18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) (or any MongoDB 6+)

## Database

1. Create a cluster and database user in Atlas; get your connection string.
2. Copy `server/.env.example` to `server/.env` and set **`MONGO_URI`**, **`JWT_SECRET`**, and optional `PORT` / `CLIENT_ORIGIN`.
3. No manual migrations: Mongoose creates collections on first write.

```bash
cd server
npm install
```

## Run API + client (recommended)

From the repo root (MongoDB must already be running and reachable):

```bash
npm install
npm run dev
```

This runs **server** and **client** together. If the UI shows proxy errors like `ECONNREFUSED` on `/api/...`, the API is not running or `client/.env` **`VITE_PROXY_TARGET`** does not match **`PORT`** in `server/.env`. If you see **`ECONNRESET`** on `/api/projects`, the API likely restarted mid-request (`node --watch` after a file save), hit a timeout, or crashed — retry the request and avoid editing server files while uploading; project submission can take a while when **Gemini** is enabled.

## Run API only

```bash
cd server
npm run dev
```

API: default `http://localhost:4001` (health: `GET /api/health`; port from `PORT` in `server/.env`). Uploads are stored under `server/uploads/`. The API uses an **MVC layout**: `src/models`, `src/controllers`, `src/routes`.

## Run client only

Start the API in another terminal first, then:

```bash
cd client
npm install
npm run dev
```

Client: `http://localhost:5173`. Vite proxies `/api` to `http://127.0.0.1:4001` by default (set **`VITE_PROXY_TARGET`** in `client/.env` to match your API host/port).

## Roles

- Register as **teacher** or **student**. Teachers only see their own assignments and related submissions; students see all assignments and only their own projects.

## Project layout

- `client/` — UI from the original design ZIP, wired to REST + i18n + auth.
- `server/` — Express routes under `/api/*`, Zod validation, JWT middleware.
- `server/src/models/` — Mongoose schemas: `User`, `Assignment`, `Project`, `Comment`, `Rating`.

## Original UI archive

The extracted Figma/Make export is in `ui-extract/` for reference; the working app lives in `client/`.
