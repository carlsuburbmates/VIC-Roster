# VIC Roster – Comprehensive Codebase Analysis & Robustness Assessment

**Date:** 3 November 2025  
**Scope:** Full architecture review, data flow analysis, error handling gaps, and recommendations for robust implementation

---

## 1. Architecture Overview

### 1.1 Backend Stack
- **Framework:** FastAPI (Python 3.x)
- **Database:** SQLite (local file `backend/roster.db`)
- **Optimization:** PuLP MILP solver (linear programming)
- **Export:** openpyxl (Excel generation), datetime (metadata)
- **CORS:** Enabled for all origins (production risk)

### 1.2 Frontend Stack
- **Framework:** React 19.1.1 with Vite (rolldown-vite 7.1.14)
- **Routing:** React Router DOM 7.9.5 (three pages: App, NumDashboard, Instructions)
- **State Management:** React hooks (useState, useEffect, useMemo)
- **API Client:** Fetch API (no error retry logic)
- **Styling:** Inline CSS objects (no CSS-in-JS library)

### 1.3 Data Flow
```
User (Frontend) → POST /submit-profile → SQLite INSERT
                ↓
          GET /profiles (fetch all staff)
                ↓
          GET /generate-roster (PuLP solver)
                ↓
          GET /export-excel (workbook generation)
                ↓
          File download (.xlsx)
```

---

## 2. Detailed Component Analysis

### 2.1 Backend: `main.py`

#### **Database Schema**
```sql
CREATE TABLE profiles (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'RN',
  fte TEXT,
  shiftPref TEXT,
  maxNDs TEXT,
  softLock TEXT,
  hardLock TEXT,
  cycle TEXT,
  requests_quota INTEGER DEFAULT 2,
  preferences_quota INTEGER DEFAULT 2,
  flexible_work INTEGER DEFAULT 0,
  swap_willing INTEGER DEFAULT 1,
  overtime_opt_in INTEGER DEFAULT 0,
  availability_notes TEXT DEFAULT '',
  right_to_disconnect_ack INTEGER DEFAULT 0,
  local_induction_complete INTEGER DEFAULT 0,
  supplementary_availability TEXT DEFAULT '',
  submitted_at TEXT
);
```

**Issues:**
- ✅ UNIQUE constraint on email prevents duplicates
- ❌ No primary key constraint on email (id is auto-increment)
- ⚠️ `fte`, `maxNDs`, `shiftPref` stored as TEXT, not numeric (parsing needed)
- ⚠️ Boolean fields stored as INTEGER (0/1), requires conversion
- ❌ No indices on frequently queried columns (email, role, cycle)
- ❌ No timestamp column for audit (submitted_at exists, but no update tracking)

#### **API Endpoints**

| Endpoint | Method | Input | Output | Validation |
|----------|--------|-------|--------|-----------|
| `/submit-profile` | POST | Profile JSON | `{status: "success"}` | Email UNIQUE, rightToDisconnectAck mandatory |
| `/profiles` | GET | None | `[Profile]` | None (no auth) |
| `/generate-roster` | GET | None (uses DB) | Roster + Analytics | Status check (infeasible handling) |
| `/export-excel` | GET | None | FileResponse .xlsx | Calls generate_roster() internally |

**Issues Found:**

1. **Input Validation Gaps (Frontend)**
   - App.jsx validates FTE, maxNDs, requestsQuota, preferencesQuota, email
   - **Missing backend validation:** If frontend is bypassed, backend accepts any value for `fte`, `role`, `cycle`
   - **No type coercion:** `fte` and `maxNDs` expected as strings, but solver uses `float()` and `int()` without try-catch

2. **Error Handling**
   ```python
   # ✅ Good: Explicit error for duplicate email
   except sqlite3.IntegrityError:
       raise HTTPException(400, "Email already submitted")
   
   # ❌ Bad: Silent failures in lock parsing
   if hard_lock:
       try:
           day = int(hard_lock.split("-")[-1]) - 1  # Splits by "-", takes last token
           if 0 <= day < DAYS:
               ...
       except ValueError:
           pass  # Silently ignored if parsing fails
   ```

3. **Database Connection Issues**
   - SQLite opened with `check_same_thread=False` (OK for single-threaded, risky for async)
   - No connection pooling (OK for small scale, bottleneck if scaled)
   - Connection left open (no cleanup on app shutdown)

4. **Security Issues**
   - ✅ Parameterized queries (prevents SQL injection)
   - ❌ CORS allows all origins: `allow_origins=["*"]` (production risk)
   - ❌ No authentication/authorization (anyone can GET /profiles, POST new profiles)
   - ❌ No rate limiting

#### **PuLP Solver Logic**

**Constraints Implemented:**
1. ✅ Single shift per day per person: `lpSum(x[i][d][k]) <= 1`
2. ✅ Coverage: `lpSum(...) >= 1` for each day/shift
3. ✅ FTE target ±1: Work total between `target-1` and `target+1`
4. ✅ Max 6 shifts per rolling 7 days
5. ✅ Max night duties: `lpSum(ND shifts) <= maxNDs`
6. ✅ Shift turnarounds (banned pairs: E→D, N→D, N→E, D→N)
7. ✅ Soft/hard locks (but parsing is brittle)

**Issues:**
- ⚠️ Two-day break only checked in analytics, not enforced in solver (flexible work overrides exist but not as constraints)
- ⚠️ Weekend balancing not implemented (no variance constraint)
- ❌ No weighting for preference fulfillment vs. compliance (objective function only minimizes non-preferred shifts)
- ❌ No solver timeout (could hang on infeasible problems)
- ❌ Solver choice hardcoded (uses default CBC if available, fails silently otherwise)

**Objective Function:**
```python
pref_penalty = lpSum(
    x[name_index[profile["name"]]][d][k]
    for profile in profiles
    for d in range(DAYS)
    for k in range(len(SHIFTS))
    if SHIFTS[k] != profile["shiftPref"]
)
prob += pref_penalty
```
This minimizes non-preferred shifts, which is reasonable but doesn't balance fairness.

#### **Export Logic**

**Good:**
- ✅ Proper Excel styling (colors, borders, fonts)
- ✅ Role sorting (ANUM > CNS > RN > EN > GNP)
- ✅ Compliance summary sheet with analytics

**Issues:**
- ❌ No error handling if workbook.save() fails (e.g., disk full)
- ❌ File path is relative (`backend/Roster_Request.xlsx`), depends on CWD
- ⚠️ No file cleanup; old rosters overwritten without versioning
- ❌ No metadata embed (author, OPPIC ID, retention date, change log)

---

### 2.2 Frontend: `App.jsx` (Staff Profile Form)

#### **State & Validation**

**Good:**
- ✅ Comprehensive validation (name, email, FTE, maxNDs, quotas, RTD ack)
- ✅ Clear error messages
- ✅ Input types appropriate (select for FTE, number input for quotas)
- ✅ Success screen after submission

**Issues:**
1. **Validation Logic**
   ```javascript
   const validate = () => {
     if (!['0.6', '0.8', '1.0'].includes(form.fte)) err.fte = "Invalid FTE";
   };
   ```
   - Validates FTE as string, but allows leading/trailing whitespace in other fields
   - Email regex too lenient (`@` required, but not valid domain)

2. **API Error Handling**
   ```javascript
   const res = await fetch('http://localhost:8000/submit-profile', {...});
   if (res.ok) setSubmitted(true);
   ```
   - ❌ No else clause for failed requests
   - ❌ No error message display if 400/500 returned
   - ❌ No retry logic

3. **Hard-coded Backend URL**
   - `'http://localhost:8000/submit-profile'` repeated across pages
   - No environment variable support
   - Breaks if backend moves

---

### 2.3 Frontend: `NumDashboard.jsx` (Audit & Roster Display)

#### **State & Data Fetching**

**Good:**
- ✅ useEffect to fetch profiles on mount
- ✅ useMemo to optimize roster matrix computation
- ✅ Proper sorting (role order, then name)
- ✅ Rich compliance reporting with badges (FWA, Swap OK, Overtime, Inducted)

**Issues:**
1. **API Error Handling**
   ```javascript
   const runAudit = async () => {
     setLoading(true);
     try {
       const res = await fetch('http://localhost:8000/generate-roster');
       const data = await res.json();
       setResult(data);
     } catch (err) {
       console.error('Run App.4 Audit failed:', err);
       setResult({ status: 'error', message: 'Backend unreachable' });
     }
     setLoading(false);
   };
   ```
   - ✅ Try-catch catches network errors
   - ❌ Doesn't check `res.ok` (could parse error HTML as JSON)
   - ❌ Doesn't handle incomplete data or missing analytics

2. **Roster Matrix Build**
   - Reconstructs matrix from roster + profiles on each render
   - Could be expensive with 100+ staff

3. **Hard-coded URLs & Constants**
   - `'http://localhost:8000/profiles'` and `/generate-roster` hard-coded
   - `START_DATE = '2025-01-05'` hard-coded (should be dynamic)
   - `ROLE_ORDER`, `SHIFT_DETAILS` duplicated in backend

4. **Missing Export Button Logic**
   - NumDashboard shows "Export Appendix 4 PDF" button
   - Triggers `/export-excel` endpoint
   - ✅ Excel download works, but no error feedback if export fails

---

### 2.4 Frontend: `Instructions.jsx`

- Static content, mirrors PDF
- No API calls
- ✅ Navigation bar present
- Minor: Long inline CSS, no accessibility attributes (alt text, aria labels)

---

## 3. Error Handling & Validation Assessment

### 3.1 Input Validation Matrix

| Layer | Component | Validated | Not Validated | Risk Level |
|-------|-----------|-----------|---------------|-----------|
| Frontend | App.jsx | Name, email, FTE, maxNDs, quotas, RTD ack | Soft/hard lock format, cycle | Medium |
| Backend | /submit-profile | rightToDisconnectAck | fte, role, cycle (parsing expected but not checked) | High |
| Backend | /generate-roster | None (assumes DB data is valid) | Solver infeasibility handling | High |
| Backend | /export-excel | Calls generate_roster() | File I/O errors | Medium |

### 3.2 Network Resilience

| Scenario | Current Behavior | Risk |
|----------|------------------|------|
| Backend unreachable | Error logged to console, empty result displayed | High (silent failure) |
| Slow network (>10s) | No timeout, infinite loading state | Medium |
| Partial JSON response | .json() throws, caught by try-catch | Low |
| Duplicate email submit | 400 IntegrityError returned | ✅ Good |
| Infeasible roster | Status: "infeasible" returned | ✅ Good |

### 3.3 Data Persistence Issues

- ❌ No transaction management (partial updates possible on crash)
- ❌ No backup strategy
- ❌ SQLite database stored in relative path (fragile if CWD changes)
- ⚠️ No migration strategy (schema changes require manual ALTER)

---

## 4. Current Dependencies

### Backend
```
fastapi>=0.104.1
uvicorn[standard]>=0.24.0
pydantic>=2.0
pulp>=2.7
openpyxl>=3.10
(missing: PyPDF2 if PDF export planned)
```

**Missing:** `requirements.txt` or `pyproject.toml`

### Frontend
```
react@^19.1.1
react-dom@^19.1.1
react-router-dom@^7.9.5
vite (npm:rolldown-vite@7.1.14)
eslint, @vitejs/plugin-react, etc.
```

**Status:** ✅ package.json complete

---

## 5. Performance & Scalability Concerns

### Backend
- PuLP solver with 14 days × 3 shifts × N staff: O(N × 42) variables
  - 20 staff: ~840 binary variables → sub-second solve
  - 100 staff: ~4,200 variables → 2–5 seconds
  - **Recommendation:** Add solver timeout (60s), return partial roster if timeout
- SQLite: Single-file DB, no concurrent write support (OK for pilot, problematic at scale)
- No caching of roster results (rebuilds on every GET /generate-roster)

### Frontend
- useMemo prevents unnecessary recalculations
- Large roster table (100+ rows × 14 columns) could cause lag
- No virtualization (large tables could be slow)

---

## 6. Security Audit

| Threat | Current Status | Risk Level | Mitigation |
|--------|---|---|---|
| SQL Injection | Parameterized queries used | ✅ Low | No action needed |
| CORS misconfig | `allow_origins=["*"]` | ❌ High | Restrict to frontend origin |
| Auth/Authz | None | ❌ Critical | Add token-based auth (JWT or API key) |
| Rate limiting | None | ❌ High | Implement per-endpoint limits |
| Data retention | No purge policy | ⚠️ Medium | Implement 7-year archive + purge |
| Secrets | Hard-coded URLs | ⚠️ Medium | Use environment variables |

---

## 7. Robustness Improvement Roadmap

### Phase 1: Critical (Week 1)
1. **Add backend input validation** (`main.py`):
   - Validate FTE is numeric ("0.6", "0.8", "1.0")
   - Validate role is in ROLE_ORDER
   - Validate maxNDs is int 0–3
   - Reject invalid soft/hard lock formats early

2. **Add API error responses**:
   - Return 400 with detailed error message for validation failures
   - Return 500 for solver failures (infeasible + message)
   - Frontend displays error UI

3. **Add frontend error handling**:
   - Check `res.ok` before parsing JSON
   - Display error toast/modal if request fails
   - Add retry button for failed requests

4. **Create `requirements.txt`** documenting all deps

### Phase 2: High (Week 2–3)
1. **Database improvements**:
   - Add indices on email, role, cycle, submitted_at
   - Create migration system (Alembic or simple versioning script)
   - Add transaction support (context manager)

2. **Solver robustness**:
   - Add timeout (60s, return partial roster + warning)
   - Log solver status (optimal, suboptimal, infeasible)
   - Add solver selection logic (detect available solver)

3. **Export validation**:
   - Check disk space before saving
   - Version files (add timestamp to filename)
   - Add metadata sheet (author, generated date, retention policy)

4. **Frontend URL centralization**:
   - Create `constants.js` or `.env` for API base URL
   - Use environment variable `VITE_API_URL`

### Phase 3: Medium (Week 3–4)
1. **Security hardening**:
   - Restrict CORS to frontend origin
   - Add basic auth or API key authentication
   - Implement rate limiting (e.g., 10 requests/min per IP)
   - Log all submissions for audit trail

2. **Testing**:
   - Unit tests for solver constraints
   - Integration tests for API endpoints
   - Snapshot tests for Excel export
   - E2E tests for user workflows

3. **Performance**:
   - Add caching (roster valid for 1 hour if profiles unchanged)
   - Implement virtualized table for large rosters
   - Profile and optimize bottlenecks

4. **Documentation**:
   - README with setup, run commands, deployment notes
   - Schema documentation
   - API docs (OpenAPI/Swagger)
   - Admin guide (data seeding, migrations, backups)

### Phase 4: Nice-to-Have (Week 4+)
1. **Advanced solver features**:
   - Two-day break enforcement + flexibleWork override
   - Weekend/night balancing
   - Single-shift agreement support

2. **UI/UX**:
   - Real-time form validation feedback
   - Inline editing of profiles (admin view)
   - Roster comparison (current vs. new)
   - Download history & audit log

3. **Operational**:
   - Automated backups
   - Monitoring/alerting
   - Logging aggregation
   - Analytics dashboard (submission rates, solve times, errors)

---

## 8. Implementation Priority for Robust First Delivery

### Critical Path (Minimum Viable)
```
1. Backend validation + error responses
   ↓
2. Frontend error handling + URL centralization
   ↓
3. Database migration & indices
   ↓
4. requirements.txt + deployment docs
   ↓
5. Basic smoke tests
```

### Estimated Effort
- Backend validation: **2 hours**
- Frontend error handling: **1 hour**
- Database improvements: **3 hours**
- Documentation: **2 hours**
- Testing: **3 hours**
- **Total: ~11 hours for "robust v1"**

---

## 9. Code Quality Checklist

- ❌ No tests (unit, integration, E2E)
- ⚠️ Inline CSS (maintainability concern)
- ✅ Consistent naming (camelCase frontend, snake_case backend)
- ❌ No TypeScript (frontend error-prone)
- ✅ Pydantic models for type safety (backend)
- ⚠️ No logging (hard to debug in production)
- ❌ No analytics/monitoring

---

## 10. Recommended Next Steps for User

### Immediate (Today)
1. Review this analysis for architecture understanding
2. Identify priority features from "Outstanding Tasks" in handover
3. Decide: Focus on solver enhancements (fairness), or robustness first?

### Short-term (This Week)
1. Implement Phase 1 critical improvements (validation, error handling)
2. Create `requirements.txt` for reproducibility
3. Add 3–5 smoke tests to verify core workflows

### Medium-term (This Month)
1. Complete Phase 2 database/solver robustness
2. Add basic auth if multi-user deployment planned
3. Document admin procedures (data seeding, migrations, backups)

---

## Appendix A: Test Scenarios (To Be Implemented)

### Unit Tests
- `test_validate_fte()`: Ensure "0.6", "0.8", "1.0" valid, others rejected
- `test_hard_lock_parsing()`: Day extraction from "15 Nov" format
- `test_shift_turnaround_constraint()`: E→D, N→D banned pairs enforced
- `test_analytics_fatigue_score()`: Scoring logic for rest breaches, weekends, consecutive shifts

### Integration Tests
- `test_submit_profile_duplicate_email()`: Expect 400 IntegrityError
- `test_generate_roster_empty_profiles()`: Expect 400 "No profiles"
- `test_generate_roster_infeasible()`: Add constraints that force infeasible, verify status
- `test_export_excel_download()`: Verify .xlsx file generated with valid schema

### E2E Tests
- User submits profile → appears in /profiles → included in roster → exported to Excel

### Snapshot Tests
- Compare generated Excel to golden file (schema, formatting consistency)

---

**End of Analysis**  
*Generated 3 November 2025*
