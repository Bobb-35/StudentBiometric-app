# Backend Deployment (Render)

## 1. Deploy Backend
1. Open Render dashboard.
2. Click `New +` -> `Blueprint`.
3. Select your repo: `Bobb-35/StudentBiometric-app`.
4. Render will detect `render.yaml` and create `studentbiometric-backend`.
5. Click `Apply`.

## 2. Get Backend URL
After deploy, copy the backend URL, for example:
`https://studentbiometric-backend.onrender.com`

## 3. Connect Frontend to Backend
1. In GitHub repo settings, create repository variable:
`VITE_API_URL=https://studentbiometric-backend.onrender.com/api`
2. Re-run `Deploy Frontend to GitHub Pages` workflow.

## 4. CORS
`CORS_ALLOWED_ORIGINS` is already set in `render.yaml` to allow GitHub Pages.

## Notes
- Current backend uses in-memory H2 database for demo use.
- Data resets when service restarts.
