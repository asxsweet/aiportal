# RoboLearn - Robotics Education Platform

Production-ready full-stack platform for robotics learning with teacher/student roles, assignment lifecycle, project submission, comments, and AI assistant support.

## Architecture Overview

- **Frontend**: React + Vite + Tailwind + i18n (`en`, `ru`, `kz`)
- **Backend**: Node.js + Express, layered MVC
- **Database**: MongoDB + Mongoose
- **Auth**: JWT with role-based authorization
- **AI**: Gemini-backed assistant/evaluation with resilient fallback logic

## Backend Structure

`server/src`:

- `config/` - database connection and runtime config
- `models/` - Mongoose domain models (`User`, `Assignment`, `Project`, `Comment`, `Rating`)
- `controllers/` - request orchestration and business logic
- `routes/` - API route definitions, no business logic
- `middlewares/` - auth/role/error middleware
- `services/` - external integrations and domain services (AI)
- `validators/` - Zod validators
- `utils/` - helpers, DTO mappers, async utilities

## Frontend Structure

`client/src`:

- `app/` - pages and route composition
- `components/` - reusable UI/layout/common components
- `features/` - feature-oriented hooks/services (auth, assignments, ai)
- `services/` - API integration layer
- `hooks/` - shared hooks
- `i18n/` - translations and i18n bootstrapping
- `lib/` - low-level utilities (axios setup, downloads, media URLs)

## API Response Format

All controller responses are standardized:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

Error response:

```json
{
  "success": false,
  "data": null,
  "message": "Human-readable error message"
}
```

Controller helpers:

- `ok(res, data, message?)`
- `fail(res, message, status?, data?)`

## Setup

### 1) Prerequisites

- Node.js 18+
- MongoDB Atlas (or MongoDB 6+)

### 2) Environment

Create `server/.env`:

```env
PORT=4001
MONGO_URI=mongodb+srv://...
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

Optional `client/.env`:

```env
VITE_API_URL=http://localhost:4001
VITE_PROXY_TARGET=http://localhost:4001
```

### 3) Install

```bash
cd server && npm install
cd ../client && npm install
```

## Run

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

## Deployment Notes

- Use managed MongoDB (Atlas) with IP and user restrictions.
- Set strong `JWT_SECRET` in production.
- Configure CORS `CLIENT_ORIGIN` to deployed frontend origin only.
- Store uploads on persistent volume/object storage in cloud environments.
- Keep AI keys server-side only; never expose in frontend.
- Build frontend with `npm run build` and serve static assets via CDN/reverse proxy.
- Place API behind a process manager (PM2/systemd/container orchestrator) and reverse proxy (Nginx/Traefik).

## Stability Guarantees After Refactor

- Legacy duplicate backend files removed.
- Routes point to canonical `*.controller.js` files only.
- No business logic inside routes.
- Standardized response contract across all controllers.
- Frontend API layer remains compatible and stable.
