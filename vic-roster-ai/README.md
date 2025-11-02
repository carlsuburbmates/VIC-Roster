# VIC Roster — Rostering Prototype

A small two-tier rostering prototype with a React/Vite frontend and FastAPI backend implementing a simple MILP roster generator (pulp + sqlite).

## Quick Start (Development)

### Backend

1. Create a Python virtual environment and activate it:
   ```bash
   cd vic-roster-ai/backend
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server (creates `roster.db` in the current directory):
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`.

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   Visit `http://localhost:5173` to open the app.

## API Endpoints

- **POST `/submit-profile`** — Submit a staff profile
- **GET `/profiles`** — Retrieve all staff profiles
- **GET `/generate-roster`** — Generate a roster using the MILP solver

## Project Structure

- `backend/main.py` — FastAPI application, roster algorithm, and SQLite database management
- `frontend/src/App.jsx` — Profile form and submission logic
- `frontend/src/NumDashboard.jsx` — NUM dashboard and roster generation UI
- `frontend/src/Instructions.jsx` — Content pages

## Key Technical Details

- **Frontend**: Vite + React
- **Backend**: FastAPI with PuLP MILP solver
- **Database**: SQLite (file: `roster.db`)
- **Roster Configuration**: 14-day cycle, shifts: AM/PM/ND, min staff: 1

## Important Notes

- The frontend is hard-coded to connect to `http://localhost:8000`. Update this if deploying to a different host/port.
- The SQLite database file is created relative to the working directory. Run the backend from `backend/` to keep the DB next to `main.py`.
- The MILP solver uses PuLP's default solver (CBC in most environments).

## Development Workflow

1. Ensure both backend and frontend are running (in separate terminal windows)
2. Submit a profile via the frontend form
3. Use the NUM dashboard to generate and view the roster
4. Check the backend logs for any errors

## Scripts

### Frontend (`frontend/package.json`)

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

### Backend

Use standard `uvicorn` commands; see [Uvicorn documentation](https://www.uvicorn.org/).
