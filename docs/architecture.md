# Architecture notes (tiers vs layers)

- Layers (lớp) là phân tách logic trong code. Ở backend dùng 3 lớp: controller → service → repository.
- Tiers (tầng) là ranh giới triển khai/chạy tách nhau qua network. SPA là tầng trình bày; API là tầng ứng dụng; PostgreSQL là tầng dữ liệu.
- Dù FE và BE cùng deploy trên Render, vẫn là nhiều tầng. Thêm PostgreSQL là tổng 3 tiers.
- "1 tier, 3 layers" là deploy chung (monolith) nhưng vẫn tách lớp nội bộ. Với SPA + API + DB, 2–3 tiers phù hợp hơn.

Render deployment overview

- Frontend (Static Site)
  - Build Command: `npm ci && npm run build`
  - Publish Directory: `dist`
  - Environment: `VITE_API_BASE_URL=https://your-api.onrender.com`
- Backend (Web Service)
  - Build Command: `npm ci && npm run build` (or `npm ci`)
  - Start Command: `npm start` (e.g., `node dist/server.js`)
  - Environment: `PORT`, `DATABASE_URL`, `CORS_ORIGIN`
- Database
  - Use Render PostgreSQL or an external managed PostgreSQL.

Notes

- Keep backend strictly layered: controllers should not call repositories directly; go through services.
- Define DB access in repositories; keep services stateless and unit-testable.
- For Tailwind, configure in frontend only (no need on backend).
