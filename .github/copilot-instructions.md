## VIC Roster — Copilot instructions

This repo contains a small two-tier rostering prototype: a React/Vite frontend and a FastAPI backend implementing a simple MILP roster generator (pulp + sqlite). The purpose of these instructions is to help AI coding agents be productive quickly by pointing to the architecture, key files, developer workflows and discoverable project-specific patterns.

Keep edits small and focused. Preserve existing UI wording in `frontend/src/*.jsx` (this app surfaces official content and deadlines).

Key facts
- Backend: FastAPI app at `backend/main.py`. Main behavior:
  - Endpoints: POST `/submit-profile`, GET `/profiles`, GET `/generate-roster`.
  - Uses `sqlite3` with a local `roster.db` created at import time (path is relative to the process CWD).
  - Roster algorithm: `pulp` MILP with DAYS=14, SHIFTS = ['AM','PM','ND'], MIN_STAFF=1 (pilot). FTE -> integer target = int(fte * DAYS).
  - Some imports (reportlab, FileResponse) are present but no explicit PDF endpoint in `main.py` — don't assume an export route exists unless you add it.

- Frontend: Vite + React in `frontend/`.
  - Main components: `frontend/src/App.jsx` (profile form), `frontend/src/NumDashboard.jsx` (NUM dashboard + run audit), `frontend/src/Instructions.jsx` (content pages).
  - Frontend calls backend at `http://localhost:8000` (hard-coded). If you change backend host/port, update the fetch URLs or add environment-driven config.

Quick run (dev)
- Frontend (from repo root):
  1. cd `vic-roster-ai/frontend`
  2. npm install
  3. npm run dev
  - scripts in `frontend/package.json`: `dev` (vite), `build`, `preview`, `lint`.

- Backend (from repo root):
  1. Create a Python venv and install dependencies used by `main.py`. Minimal list inferred from imports: `fastapi`, `uvicorn`, `pydantic`, `pulp`, `reportlab`.
  2. Run the app (example):
     - cd `vic-roster-ai/backend`
     - `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
  Notes: `sqlite` file `roster.db` will be created relative to the working directory used by the Python process. Run uvicorn from `backend/` to keep the DB next to `main.py`, or change to an absolute path.

Data flows & integration points
- Frontend POST `/submit-profile` sends JSON shaped like `Profile` (fields in `backend/main.py`: name, email, fte, shiftPref, maxNDs, softLock, hardLock, cycle).
- NUM dashboard calls GET `/generate-roster` which runs the MILP and returns JSON {status, roster}.

Project-specific conventions / gotchas
- Hard-coded localhost:8000 in frontend fetch calls — fix or parameterize when containerising or deploying.
- SQLite DB path is relative; this is an important source of bugs when running the backend from different CWDs.
- Parsing of soft/hard locks is brittle: `main.py` expects the last token after `-` to be a day number (e.g. `15 Nov`) — validate safely if you modify.
- The MILP uses pulp and assumes a solver is available. In some environments pulp chooses default CBC; tests should confirm solver availability.

Places to look for implementation examples
- `vic-roster-ai/backend/main.py` — roster constraints, endpoints, and DB schema.
- `vic-roster-ai/frontend/src/App.jsx` — form validation, submit flow, and deadline copy.
- `vic-roster-ai/frontend/src/NumDashboard.jsx` — how the UI loads `/profiles` and triggers `/generate-roster`.

Suggested tasks for an AI agent
- Small bugfixes: make backend DB path explicit (configurable), add basic PDF export endpoint if needed, or harden soft/hard-lock parsing.
- Improve dev ergonomics: move frontend fetch base URL into `import.meta.env` (Vite env), add `requirements.txt` or `pyproject.toml` listing Python deps.
- Add tests: small unit tests for roster generation (create profiles, call `/generate-roster`, assert status/roster shape) and a smoke integration that posts a profile and fetches it.

If you modify runtime behavior, update `frontend/package.json` or add a README note explaining how to run backend and frontend together. After edits, verify by:
 - Running the backend and visiting `http://localhost:5173` (Vite default) to submit a profile and then running NUM → Run App.4 Audit.

Questions? If anything is ambiguous (e.g., desired solver, PDF output spec, or deployment expectations), ask the maintainers before large refactors.

---
Files referenced: `backend/main.py`, `vic-roster-ai/frontend/package.json`, `vic-roster-ai/frontend/src/App.jsx`, `vic-roster-ai/frontend/src/NumDashboard.jsx`, `vic-roster-ai/frontend/src/Instructions.jsx`.
