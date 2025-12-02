# Frontend (React + Vite + TailwindCSS)

Structure

- `src/`: application source code
- `public/`: static assets
- `.env.example`: example env file

Environment

- `VITE_API_BASE_URL`: Base URL of the backend API (e.g., <https://your-api.onrender.com>)

Tailwind quick notes

- Install Tailwind and PostCSS, generate `tailwind.config.js` and `postcss.config.js`.
- Add `@tailwind base; @tailwind components; @tailwind utilities;` in `src/index.css`.

Render (Static Site)

- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Environment: set `VITE_API_BASE_URL` to your backend URL.
