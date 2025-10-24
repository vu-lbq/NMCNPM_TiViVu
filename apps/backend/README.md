# Backend (Node.js + Express.js)

Pattern: 3-layer architecture inside backend

- `controllers/`: map HTTP ↔ service, input validation
- `services/`: business logic, orchestration
- `repositories/`: data access (PostgreSQL queries/ORM)

Structure

- `models/`: types/schemas
- `routes/`: route declarations
- `middlewares/`: auth, logging, error handling, etc.
- `utils/`: helpers
- `config/`: env/config loader
- `db/migrations`, `db/seed`: database lifecycle scripts
- `tests/`: unit/integration tests

Environment (.env)

- `PORT`: API port (default 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: development | production | test
- `CORS_ORIGIN`: allowed frontend origin (e.g., <http://localhost:5173>)

Render (Web Service)

- Build Command: `npm ci && npm run build` (or just `npm ci` if no build)
- Start Command: `npm start` (e.g., `node dist/server.js`)
- Environment: `PORT`, `DATABASE_URL`, `CORS_ORIGIN`
