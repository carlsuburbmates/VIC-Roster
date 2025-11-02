# VIC Roster – Implementation Checklist for Robust First Delivery

**Goal:** Systematically address robustness gaps to ensure production-ready implementation.  
**Timeline:** 1–2 weeks  
**Owner:** Next developer taking over from current handover

---

## Phase 1: Critical (Days 1–2)

### Backend Input Validation
- [ ] Create validation helper functions in `main.py`:
  - [ ] `validate_fte(value: str) -> bool` — only "0.6", "0.8", "1.0"
  - [ ] `validate_role(value: str) -> bool` — only ROLE_ORDER values
  - [ ] `validate_max_nds(value: str) -> bool` — 0–3 integer
  - [ ] `validate_lock_format(value: str) -> tuple` — parse "DD MMM" → (day_int, valid_bool)
- [ ] Add validation to `/submit-profile` before DB insert
- [ ] Return 400 with detailed error messages for failures
- [ ] **Test:** POST invalid FTE → expect 400 with message

### Backend Error Responses
- [ ] `/generate-roster`: Return detailed error if infeasible
  ```python
  # Current: status: "infeasible"
  # New: status: "infeasible", message: "Cannot meet coverage + fatigue constraints", details: {failed_constraint: "..."}
  ```
- [ ] `/export-excel`: Catch file I/O errors, return 500 with message
- [ ] Add logging for all HTTP errors (log to stdout, parse in deployment)

### Frontend Error Handling
- [ ] Wrap all `fetch()` calls in try-catch blocks
- [ ] Check `res.ok` before calling `.json()`
- [ ] Display error toast/modal with user-friendly message
- [ ] Add retry button for failed API calls
- [ ] **Test:** Simulate backend down → expect error UI, not blank page

### Frontend Hard-coded URLs
- [ ] Create `src/api.js` (or `src/constants.js`):
  ```javascript
  export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  export const endpoints = {
    profiles: `${API_BASE_URL}/profiles`,
    generateRoster: `${API_BASE_URL}/generate-roster`,
    exportExcel: `${API_BASE_URL}/export-excel`,
    submitProfile: `${API_BASE_URL}/submit-profile`,
  };
  ```
- [ ] Replace all hard-coded URLs in App.jsx, NumDashboard.jsx
- [ ] Create `.env.local` with `VITE_API_URL=http://localhost:8000` for dev
- [ ] Update vite.config.js to support environment variables

### Backend Dependencies
- [ ] Create `backend/requirements.txt`:
  ```
  fastapi==0.104.1
  uvicorn[standard]==0.24.0
  pydantic==2.5.0
  pulp==2.7.0
  openpyxl==3.11.0
  ```
- [ ] Test installation: `pip install -r requirements.txt`

### Phase 1 Testing
- [ ] Create `backend/tests/test_validation.py`:
  - [ ] `test_validate_fte_valid()` → True for "0.6", "0.8", "1.0"
  - [ ] `test_validate_fte_invalid()` → False for "0.5", "abc", empty
  - [ ] `test_validate_lock_format_valid()` → parse "15 Nov" → (15, True)
  - [ ] `test_validate_lock_format_invalid()` → reject malformed strings
- [ ] Run tests: `python -m pytest backend/tests/ -v`

### Phase 1 Deliverables
- [ ] ✅ `main.py` with validation functions + error responses
- [ ] ✅ `src/api.js` with centralized URLs
- [ ] ✅ App.jsx, NumDashboard.jsx updated to use `api.js`
- [ ] ✅ Error UI components (toast or modal)
- [ ] ✅ `requirements.txt` created
- [ ] ✅ 5+ unit tests passing
- [ ] ✅ Git commit: "Phase 1: Add validation, error handling, centralize URLs"

---

## Phase 2: Database & Solver (Days 3–4)

### Database Indices
- [ ] Analyze query patterns:
  - [ ] `SELECT ... WHERE email = ?` → add index on `email`
  - [ ] `SELECT ... WHERE role = ?` → add index on `role`
  - [ ] `SELECT ... WHERE cycle = ?` → add index on `cycle`
- [ ] Create migration script `backend/migrations/001_add_indices.sql`:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
  CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
  CREATE INDEX IF NOT EXISTS idx_profiles_cycle ON profiles(cycle);
  ```
- [ ] Execute migration: `sqlite3 backend/roster.db < backend/migrations/001_add_indices.sql`
- [ ] Verify: `SELECT * FROM sqlite_master WHERE type='index';`

### Database Transactions
- [ ] Update `/submit-profile` to use transaction:
  ```python
  try:
      conn.execute("BEGIN")
      conn.execute("INSERT INTO profiles ...")
      conn.commit()
  except Exception as e:
      conn.rollback()
      raise HTTPException(500, "Database error")
  ```
- [ ] Test: Simulate insert error → verify rollback

### Solver Robustness
- [ ] Add timeout to PuLP solver:
  ```python
  import time
  start = time.time()
  prob.solve(timeLimit=60)  # Add timeout
  elapsed = time.time() - start
  if elapsed > 59:
      return {"status": "suboptimal", "message": "Solver timeout", "roster": ...}
  ```
- [ ] Verify solver availability:
  ```python
  from pulp import listSolvers
  available_solvers = listSolvers(onlyAvailable=True)
  if not available_solvers:
      raise RuntimeError("No LP solver available; install pulp[cbc]")
  ```
- [ ] Log solver name and status:
  ```python
  logger.info(f"Solver: {prob.solver.name}, Status: {LpStatus[prob.status]}")
  ```

### Export Versioning & Validation
- [ ] Add timestamp to export filename:
  ```python
  timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
  EXPORT_PATH = os.path.join(BASE_DIR, f"Roster_Request_{timestamp}.xlsx")
  ```
- [ ] Check disk space before save:
  ```python
  import shutil
  free_mb = shutil.disk_usage(BASE_DIR).free / (1024**2)
  if free_mb < 10:  # 10 MB minimum
      raise HTTPException(507, "Insufficient disk space")
  ```
- [ ] Add metadata sheet to Excel:
  ```python
  sheet_meta = workbook.create_sheet("Metadata", 0)
  sheet_meta["A1"] = "Generated:"
  sheet_meta["B1"] = datetime.now().isoformat()
  sheet_meta["A2"] = "Solver Status:"
  sheet_meta["B2"] = LpStatus[prob.status]
  sheet_meta["A3"] = "Retention Until:"
  sheet_meta["B3"] = (datetime.now() + timedelta(days=365*7)).strftime("%Y-%m-%d")
  ```

### Phase 2 Testing
- [ ] Create `backend/tests/test_database.py`:
  - [ ] `test_index_exists()` → verify indices created
  - [ ] `test_transaction_rollback()` → force insert error, verify no data committed
- [ ] Create `backend/tests/test_export.py`:
  - [ ] `test_export_excel_generated()` → verify .xlsx file created
  - [ ] `test_export_metadata_present()` → verify Metadata sheet exists
- [ ] Run solver timeout test: Force large problem, verify timeout returns suboptimal status

### Phase 2 Deliverables
- [ ] ✅ Database indices created and verified
- [ ] ✅ Transactions implemented in `/submit-profile`
- [ ] ✅ Solver timeout + availability check
- [ ] ✅ Export versioning + metadata sheet
- [ ] ✅ 10+ tests passing (Phase 1 + Phase 2)
- [ ] ✅ Git commit: "Phase 2: Add database indices, solver timeout, export robustness"

---

## Phase 3: Logging & Documentation (Days 5–6)

### Logging Infrastructure
- [ ] Add structured logging to `main.py`:
  ```python
  import logging
  logger = logging.getLogger(__name__)
  logger.basicConfig(level=logging.INFO)
  
  # Log key events:
  logger.info(f"Profile submitted: {profile.email}")
  logger.warning(f"Roster infeasible: {reason}")
  logger.error(f"Export failed: {e}")
  ```
- [ ] Log file location: `backend/roster.log` (append mode)

### README Documentation
- [ ] Create `README.md` at repo root:
  ```markdown
  # VIC Roster – Nursing Rostering Prototype
  
  ## Quick Start
  
  ### Backend
  ```bash
  cd backend
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
  ```
  
  ### Frontend
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  
  ### Access
  - Frontend: http://localhost:5173
  - Backend API: http://localhost:8000/docs (Swagger)
  
  ## Database
  - Location: `backend/roster.db` (SQLite)
  - Schema: See `backend/migrations/001_add_indices.sql`
  - Backup: `cp backend/roster.db backend/roster.db.backup`
  
  ## Deployment
  - See DEPLOYMENT.md
  
  ## Testing
  ```bash
  python -m pytest backend/tests/ -v
  npm run lint
  ```
  ```

### Admin Guide
- [ ] Create `ADMIN.md`:
  ```markdown
  # Admin Guide
  
  ## Data Seeding
  ```bash
  python backend/seed_profiles.py --cycle "27 Nov – 10 Dec" --count 7
  ```
  
  ## Database Migrations
  ```bash
  sqlite3 backend/roster.db < backend/migrations/001_add_indices.sql
  ```
  
  ## Backups
  - Daily backup: `cp backend/roster.db backend/backups/roster_$(date +%Y%m%d).db.backup`
  - Retention: Keep for 7 years (regulatory requirement)
  
  ## Troubleshooting
  - Backend unreachable: Check port 8000 with `lsof -i :8000`
  - Solver timeout: Increase timeout in main.py or reduce staff count
  - Excel export fails: Check disk space with `df -h`
  ```

### API Documentation
- [ ] Run FastAPI auto-docs: `http://localhost:8000/docs` (Swagger UI)
- [ ] Export as `API.md` for reference

### Phase 3 Deliverables
- [ ] ✅ Logging added to `main.py`
- [ ] ✅ `README.md` with quick start, deployment links
- [ ] ✅ `ADMIN.md` with seeding, migrations, backups
- [ ] ✅ `API.md` or link to Swagger docs
- [ ] ✅ Git commit: "Phase 3: Add logging, documentation"

---

## Phase 4: Testing & QA (Days 7–8)

### Unit Test Coverage
- [ ] Run existing tests from Phase 1–2
- [ ] Add missing coverage:
  - [ ] Analytics scoring tests
  - [ ] FTE rounding tests
  - [ ] ROLE_ORDER sorting tests
- [ ] Target: >70% coverage for `main.py`
- [ ] Run: `coverage run -m pytest backend/tests/ && coverage report`

### Integration Tests
- [ ] Create `backend/tests/test_integration.py`:
  - [ ] `test_full_submission_workflow()`: POST profile → GET profiles → verify in list
  - [ ] `test_roster_generation_workflow()`: Add profiles → generate-roster → verify coverage
  - [ ] `test_export_workflow()`: Generate roster → export-excel → verify .xlsx valid
- [ ] Run: `pytest backend/tests/test_integration.py -v`

### Frontend E2E Tests
- [ ] Manual testing checklist:
  - [ ] Submit valid profile → success message
  - [ ] Submit invalid email → error displayed
  - [ ] Click "Generate Roster" → loading spinner → results displayed
  - [ ] Click "Export Appendix 4 PDF" → .xlsx downloads
  - [ ] Navigate between pages → no broken links
- [ ] (Optional) Set up Cypress or Playwright for automation

### Smoke Test Script
- [ ] Create `test_smoke.sh`:
  ```bash
  #!/bin/bash
  # Smoke test: Verify full workflow
  set -e
  
  echo "1. Start backend..."
  cd backend && uvicorn main:app &
  BG_PID=$!
  sleep 2
  
  echo "2. Submit profile..."
  curl -X POST http://localhost:8000/submit-profile \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","fte":"1.0",...}'
  
  echo "3. Generate roster..."
  curl http://localhost:8000/generate-roster
  
  echo "4. Export Excel..."
  curl -o test_roster.xlsx http://localhost:8000/export-excel
  
  kill $BG_PID
  echo "✅ Smoke test passed"
  ```
- [ ] Run before each release

### Phase 4 Deliverables
- [ ] ✅ >70% unit test coverage
- [ ] ✅ Integration tests passing
- [ ] ✅ E2E manual checklist completed
- [ ] ✅ Smoke test script created
- [ ] ✅ Git commit: "Phase 4: Add comprehensive testing"

---

## Phase 5: Security Hardening (Days 9–10)

### CORS Restriction
- [ ] Update `main.py`:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:5173", "https://yourdomain.com"],  # Restrict
      allow_methods=["GET", "POST"],
      allow_headers=["Content-Type"],
  )
  ```

### Rate Limiting
- [ ] Install `slowapi`: `pip install slowapi`
- [ ] Add rate limiter:
  ```python
  from slowapi import Limiter
  from slowapi.util import get_remote_address
  
  limiter = Limiter(key_func=get_remote_address)
  app.state.limiter = limiter
  
  @app.post("/submit-profile")
  @limiter.limit("10/minute")
  def submit_profile(...):
      ...
  ```

### Basic Authentication (Optional)
- [ ] If multi-user deployment, add token auth:
  ```python
  from fastapi.security import HTTPBearer
  
  security = HTTPBearer()
  
  @app.get("/profiles")
  async def get_profiles(credentials: HTTPAuthCredentials = Depends(security)):
      # Validate token
      ...
  ```

### Audit Trail
- [ ] Add audit logging table:
  ```sql
  CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY,
    action TEXT,
    email TEXT,
    timestamp TEXT,
    details TEXT
  );
  ```
- [ ] Log all submissions and exports
- [ ] Query: `SELECT * FROM audit_log WHERE action='export' ORDER BY timestamp DESC;`

### Phase 5 Deliverables
- [ ] ✅ CORS restricted to known origins
- [ ] ✅ Rate limiting enabled on endpoints
- [ ] ✅ (Optional) JWT/token auth implemented
- [ ] ✅ Audit logging implemented
- [ ] ✅ Security checklist completed
- [ ] ✅ Git commit: "Phase 5: Add security hardening"

---

## Phase 6: Final Validation & Deployment (Days 11–12)

### Pre-Release Checklist
- [ ] All Phase 1–5 deliverables complete
- [ ] All tests passing: `pytest backend/tests/ && npm run lint`
- [ ] No console errors in frontend (check browser DevTools)
- [ ] Logs reviewed for warnings
- [ ] README & admin docs complete
- [ ] No hard-coded secrets or passwords in code
- [ ] Database backup created: `cp backend/roster.db backend/roster.db.pre-release`

### Deployment Preparation
- [ ] Document deployment steps in `DEPLOYMENT.md`
- [ ] Provide `.env.example` for configuration
- [ ] Create systemd service file (if Linux deployment)
- [ ] Test deploy to staging environment (if available)

### Final Release
- [ ] Tag release: `git tag -a v1.0.0-robust -m "First robust delivery with validation, error handling, testing"`
- [ ] Push: `git push origin main && git push origin v1.0.0-robust`
- [ ] Create GitHub Release with changelog
- [ ] Notify stakeholders

### Phase 6 Deliverables
- [ ] ✅ All tests passing
- [ ] ✅ Pre-release checklist signed off
- [ ] ✅ Deployment documentation complete
- [ ] ✅ `v1.0.0-robust` release tagged and pushed
- [ ] ✅ Handover complete to operational team

---

## Summary: Timeline & Effort

| Phase | Scope | Days | Est. Hours | Deliverables |
|-------|-------|------|-----------|--------------|
| 1 | Validation, errors, URLs | 2 | 8 | 5 tests, 3 files updated |
| 2 | Database, solver, export | 2 | 8 | Indices, timeouts, metadata |
| 3 | Logging, documentation | 2 | 6 | README, ADMIN, API docs |
| 4 | Testing, QA | 2 | 10 | >70% coverage, smoke test |
| 5 | Security | 2 | 6 | CORS, rate limit, audit log |
| 6 | Final validation, deploy | 2 | 4 | Release tag, handover |
| **Total** | | **12 days** | **42 hours** | **v1.0.0-robust** |

---

## How to Use This Checklist

1. **Start at Phase 1:** Check off each item as completed
2. **Commit after each phase:** Provides clear version history
3. **Run tests continuously:** Don't defer testing to Phase 4
4. **Document as you go:** Keep README/ADMIN updated with discoveries
5. **Review CODEBASE_ANALYSIS.md:** Reference for technical details

---

**Owner Signature/Handover Date:** _______________  
**Next Developer:** _______________  
**Date Started:** _______________  
**Target Completion:** _______________

