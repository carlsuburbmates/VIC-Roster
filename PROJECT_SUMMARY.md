# VIC Roster — Project Summary & Architecture Revision

**Date**: 3 November 2025  
**Status**: Pilot Study (Pre-Production)  
**Critical Update**: Project architecture requires **fundamental redesign** from backend-dependent to **offline-first PWA**

---

## Executive Summary

VIC Roster is a **rostering prototype for nursing staff scheduling** at Victorian hospitals. **Current implementation is backend-dependent (FastAPI + SQLite)**, but the **target architecture is a fully offline-capable Progressive Web App (PWA)** with client-side MILP solving, local data persistence, and optional sync to hospital systems.

**Key Insight**: Current code does **NOT match specified requirements**. Full restructuring needed.

---

## Part 1: Current State (What Exists Today)

### 1.1 Current Architecture

```
Frontend (React + Vite)
    ↓ (HTTP calls)
Backend (FastAPI)
    ↓
SQLite Database
```

**Tech Stack:**
- **Frontend**: React 19, Vite, React Router DOM
- **Backend**: FastAPI 0.104.1, Uvicorn, PuLP 2.7.0 (MILP solver)
- **Database**: SQLite (file-based: `roster.db`)
- **Export**: OpenPyXL (Excel generation)

### 1.2 Current Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/submit-profile` | POST | Staff submit availability/preferences |
| `/profiles` | GET | Fetch all staff profiles |
| `/generate-roster` | GET | Run MILP solver, return optimized roster |
| `/export-excel` | GET | Generate Excel file of roster |

### 1.3 Current Data Model

**Profile (Staff Member)**
```python
{
  "name": str,
  "email": str,
  "role": str,  # ANUM, CNS, RN, EN, GNP
  "fte": str,  # 0.6, 0.8, 1.0
  "shiftPref": str,  # AM, PM, ND
  "maxNDs": str,  # 0-3
  "softLock": str,  # Preferred off days: "15 Nov"
  "hardLock": str,  # Unavailable: "17 Nov"
  "cycle": str,  # "27 Nov – 10 Dec"
  "requestsQuota": int,  # 0-4
  "preferencesQuota": int,  # 0-4
  "flexibleWork": bool,
  "swapWilling": bool,
  "overtimeOptIn": bool,
  "rightToDisconnectAck": bool,
  "localInductionComplete": bool
}
```

**Roster (Output)**
```json
{
  "status": "valid" | "infeasible",
  "roster": [
    {
      "AM": ["Staff A", "Staff B"],
      "PM": ["Staff C"],
      "ND": ["Staff D"]
    },
    ...  // 14 days
  ],
  "analytics": [
    {
      "name": "Staff A",
      "shifts": 10,
      "nightDuties": 2,
      "compliance": true
    }
  ]
}
```

### 1.4 Current UI Components

| Component | File | Purpose |
|-----------|------|---------|
| **App** | `App.jsx` | Profile submission form |
| **NUM Dashboard** | `NumDashboard.jsx` | Admin view: profiles list, roster generation, analytics |
| **Instructions** | `Instructions.jsx` | Content pages |
| **Error Modal** | `ErrorModal.jsx` | Toast/error notifications |

### 1.5 Current Roster Algorithm (Backend)

**Constraints (PuLP MILP):**
- 14-day cycle
- 3 shifts: AM (Day), PM (Evening), ND (Night)
- Minimum 1 staff per shift
- FTE target: `int(fte * 14)` shifts per person
- Max night duties: `maxNDs` per staff
- Banned consecutive shifts: E→D, N→D, N→E, D→N
- Hard locks: exclude days
- Soft locks: prefer off days (lower priority)

**Validation (Backend):**
```python
validate_fte(fte) → 0.6, 0.8, 1.0 only
validate_role(role) → ANUM, CNS, RN, EN, GNP
validate_max_nds(maxNDs) → 0-3 only
validate_lock_format(lock) → "DD MMM" format
```

### 1.6 Current Dependencies

**Backend (`requirements.txt`):**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pulp==2.7.0
openpyxl==3.11.0
python-multipart==0.0.6
```

**Frontend (`package.json`):**
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.9.5"
}
```

### 1.7 Deployment (Current)

**Development Only:**
```bash
# Backend
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend && npm run dev  # Vite on http://localhost:5173
```

**No production deployment yet.** Frontend hardcoded to `http://localhost:8000`.

---

## Part 2: Target State (Offline-First PWA)

### 2.1 Target Architecture

```
┌─────────────────────────────────────┐
│   PWA (React + Service Worker)      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Frontend (React Components)  │ │
│  │  - App (form entry)           │ │
│  │  - NumDashboard (roster view) │ │
│  └───────────────────────────────┘ │
│           ↓                         │
│  ┌───────────────────────────────┐ │
│  │  Rules Engine (Four Fs)       │ │
│  │  - Fatigue/rest rules         │ │
│  │  - Fair distribution          │ │
│  │  - Flexibility matching       │ │
│  │  - Request quotas             │ │
│  └───────────────────────────────┘ │
│           ↓                         │
│  ┌───────────────────────────────┐ │
│  │  Client-Side MILP Solver      │ │
│  │  (WASM or JS-based)           │ │
│  └───────────────────────────────┘ │
│           ↓                         │
│  ┌───────────────────────────────┐ │
│  │  IndexedDB (Offline Storage)  │ │
│  │  - Profiles                   │ │
│  │  - Rosters                    │ │
│  │  - Sync queue                 │ │
│  │  - Version locks              │ │
│  └───────────────────────────────┘ │
│           ↓ (on reconnect)         │
│  ┌───────────────────────────────┐ │
│  │  Sync Engine (HWS)            │ │
│  │  - Push/pull data             │ │
│  │  - Conflict resolution        │ │
│  │  - Version tracking           │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
      ↓ (Optional backend)
  Hospital System (HWS)
```

### 2.2 Target Tech Stack

| Layer | Current | Target |
|-------|---------|--------|
| **UI Framework** | React 19 | React 19 ✅ |
| **Build** | Vite | Vite ✅ |
| **Routing** | React Router | React Router ✅ |
| **Data Storage** | Backend SQLite | **IndexedDB (Dexie.js recommended)** |
| **Solver** | Backend PuLP | **WASM or JS MILP (OR-Tools WASM or jsLPSolve)** |
| **Offline Support** | None | **Service Worker + Web App Manifest** |
| **PDF Export** | Backend (OpenPyXL) | **Client-side (jsPDF + html2canvas)** |
| **Sync** | N/A | **Custom sync engine** |
| **Backend** | FastAPI + Uvicorn | **(Optional) Node.js simple sync service** |

### 2.3 Target Features

#### **Core: Work 100% Offline**
- ✅ Add profile offline
- ✅ Generate roster without internet
- ✅ Export PDF without server
- ✅ Edit/publish offline
- ✅ NUMs make changes while disconnected

#### **Four Fs Rules** (Client-Side)
1. **Fair**: Even distribution across staff
2. **Fatigue**: Rest periods, max consecutive shifts
3. **Flexibility**: Match shift preferences
4. **Request Quotas**: Honor swap/time-off requests

#### **Sync on Reconnect**
- Push local rosters to HWS
- Pull latest profiles from HWS
- Conflict detection (version locks)
- Manual merge on conflicts

---

## Part 3: Required Modifications

### 3.1 Phase 1: Remove Backend Dependency (Weeks 1-2)

#### **Task 1.1: Choose Client-Side MILP Solver**

**Options:**

| Option | Pros | Cons | Recommendation |
|--------|------|------|-----------------|
| **OR-Tools WASM** | Powerful, Google-backed, production-grade | 3MB, complexity, learning curve | ✅ Best for optimal solutions |
| **jsLPSolve** | Pure JS, lightweight (200KB), simple | Limited to LP not full MILP, less optimal | ✅ Good for MVP |
| **Custom Greedy Algorithm** | Minimal size, full control | May not find optimal roster | Use as fallback |

**Decision Needed**: Which solver? (OR-Tools WASM recommended)

---

#### **Task 1.2: Implement IndexedDB**

**Required Stores:**
```javascript
// Dexie.js schema
const db = new Dexie('VICRoster');
db.version(1).stores({
  profiles: '++id, email',           // Staff profiles
  rosters: '++id, cycleId, version', // Generated rosters
  shifts: '++id, staffId, dayIndex', // Individual shift assignments
  syncQueue: '++id, timestamp',      // Pending sync operations
  versionLocks: 'rostersId'          // Conflict prevention
});
```

**Implementation Files:**
- `frontend/src/db/store.js` — IndexedDB wrapper (CRUD operations)
- `frontend/src/db/migrations.js` — Schema versions
- `frontend/src/api/offline.js` — Offline-mode API (replaces current `api.js`)

---

#### **Task 1.3: Add Service Worker & PWA Manifest**

**Files to Create:**
- `frontend/public/manifest.json` — PWA metadata
- `frontend/src/service-worker.js` — Cache app shell + assets
- `frontend/src/index.jsx` — Register service worker

**manifest.json:**
```json
{
  "name": "VIC Roster",
  "short_name": "Roster",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "scope": "/",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

**Service Worker Strategy:**
- Network-first for API calls (fallback to IndexedDB)
- Cache-first for static assets (JS, CSS, images)
- Background sync for offline changes

---

#### **Task 1.4: Migrate Profile Storage**

**Before:**
```javascript
// App.jsx - submits to backend
const result = await submitProfile(payload);  // POST /submit-profile
```

**After:**
```javascript
// App.jsx - saves to IndexedDB
import { db } from './db/store';
const result = await db.profiles.add(payload);
```

**Files to Modify:**
- `frontend/src/App.jsx` — Use IndexedDB instead of API call
- `frontend/src/NumDashboard.jsx` — Fetch profiles from IndexedDB
- Remove all `api.js` calls to backend

---

### 3.2 Phase 2: Client-Side Solver (Weeks 3-4)

#### **Task 2.1: Integrate MILP Solver**

**If using OR-Tools WASM:**

**Files to Create:**
- `frontend/src/solver/ortools-solver.js` — OR-Tools wrapper
- `frontend/src/solver/constraints.js` — All Four Fs rules
- `frontend/src/solver/validator.js` — Input validation (move from backend)

**Example Structure:**
```javascript
// solver/constraints.js
export function buildConstraints(profiles, rosterConfig) {
  return {
    minStaffPerShift: 1,
    maxConsecutiveShifts: 5,
    mandatoryRest: 2,  // nights off per week
    fteLimits: profiles.map(p => ({
      name: p.name,
      target: Math.floor(p.fte * 14)
    })),
    hardLocks: profiles
      .filter(p => p.hardLock)
      .map(p => ({ name: p.name, daysOff: parseLock(p.hardLock) })),
    softLocks: profiles
      .filter(p => p.softLock)
      .map(p => ({ name: p.name, preferredOff: parseLock(p.softLock), weight: 0.5 })),
    requestQuotas: profiles.map(p => ({
      name: p.name,
      maxRequests: p.requestsQuota,
      maxPreferences: p.preferencesQuota
    }))
  };
}

export async function solveRoster(profiles, config) {
  const solver = new ORToolsSolver();
  const constraints = buildConstraints(profiles, config);
  const result = await solver.solve(constraints);
  return result;  // { status, roster, analytics }
}
```

**Files to Modify:**
- `frontend/src/NumDashboard.jsx` — Call client solver instead of backend
- Remove backend solver logic (no longer needed)

---

#### **Task 2.2: Implement Four Fs Rules Engine**

**Files to Create:**
- `frontend/src/rules/fairness.js` — Even shift distribution
- `frontend/src/rules/fatigue.js` — Rest periods, max shifts
- `frontend/src/rules/flexibility.js` — Preference matching
- `frontend/src/rules/requests.js` — Request quota enforcement

**Example (Fatigue Rules):**
```javascript
// rules/fatigue.js
export const FATIGUE_RULES = {
  MAX_CONSECUTIVE_SHIFTS: 5,
  MANDATORY_REST_DAYS_PER_WEEK: 2,
  NIGHT_SHIFT_CAP: 3,  // per 14-day cycle
  BANNED_SEQUENCES: [
    ['PM', 'AM'],  // Evening→Day not allowed
    ['ND', 'AM'],  // Night→Day not allowed
    ['ND', 'PM']   // Night→Evening not allowed
  ]
};

export function validateFatigue(assignment) {
  // Check consecutive shifts
  // Check rest days
  // Check banned sequences
  // Return { valid: bool, reason: str }
}
```

---

#### **Task 2.3: Move Validation to Frontend**

**Files to Create:**
- `frontend/src/validation/index.js` — All validation rules

**What to Move from Backend:**
```python
# backend/main.py (DELETE)
validate_fte()
validate_role()
validate_max_nds()
validate_lock_format()

# Becomes:
// frontend/src/validation/index.js (CREATE)
export function validateFTE(fte)
export function validateRole(role)
export function validateMaxNDs(maxNDs)
export function validateLockFormat(lock)
```

---

### 3.3 Phase 3: Client-Side PDF Export (Week 4)

#### **Task 3.1: Replace Backend Export with jsPDF**

**Files to Create:**
- `frontend/src/export/pdf.js` — PDF generation
- `frontend/src/export/excel.js` — Excel generation (optional)

**Files to Modify:**
- `frontend/src/NumDashboard.jsx` — Remove backend export call

**Implementation:**
```javascript
// export/pdf.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportRosterPDF(rosterData) {
  const canvas = await html2canvas(document.getElementById('roster-table'));
  const pdf = new jsPDF('landscape');
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 10, 10, 200, 100);
  pdf.save('roster.pdf');
}
```

**Dependencies to Add:**
```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

---

### 3.4 Phase 4: Sync Engine (Week 5)

#### **Task 4.1: Implement Sync Queue**

**Files to Create:**
- `frontend/src/sync/queue.js` — Track pending changes
- `frontend/src/sync/hws.js` — HWS API integration
- `frontend/src/sync/conflicts.js` — Conflict detection/resolution

**Sync Queue Model:**
```javascript
// IndexedDB syncQueue store
{
  id: 1,
  type: 'profile' | 'roster',
  operation: 'create' | 'update' | 'delete',
  data: {...},
  timestamp: Date,
  status: 'pending' | 'synced' | 'failed',
  version: 1
}
```

**Conflict Detection:**
```javascript
// sync/conflicts.js
export function detectConflict(local, remote) {
  if (local.version !== remote.version) {
    return {
      hasConflict: true,
      reason: 'Version mismatch',
      local,
      remote
    };
  }
  return { hasConflict: false };
}

export function resolveConflict(local, remote, strategy = 'manual') {
  if (strategy === 'manual') {
    // Show user both versions, let them choose
    return null;  // Wait for user input
  }
  if (strategy === 'server-wins') {
    return remote;
  }
  if (strategy === 'local-wins') {
    return local;
  }
}
```

#### **Task 4.2: Online/Offline Status & Background Sync**

**Files to Create:**
- `frontend/src/sync/network.js` — Connectivity detection
- `frontend/src/components/StatusBar.jsx` — Show online/offline status

**Implementation:**
```javascript
// sync/network.js
export function onOnline(callback) {
  window.addEventListener('online', callback);
}

export function onOffline(callback) {
  window.addEventListener('offline', callback);
}

export async function triggerSync() {
  const pendingChanges = await db.syncQueue
    .where('status').equals('pending')
    .toArray();
  
  for (const change of pendingChanges) {
    try {
      const result = await pushToHWS(change);
      await db.syncQueue.update(change.id, { status: 'synced' });
    } catch (err) {
      console.error('Sync failed:', err);
    }
  }
}
```

---

### 3.5 Phase 5: Clean Up Backend (Week 6)

#### **Task 5.1: Decide Backend Fate**

**Option A: Delete Backend Entirely**
```bash
rm -rf backend/
```
(Keep git history for reference)

**Option B: Keep Backend for Optional HWS Sync**
- Convert to simple Node.js service
- Only handles `/push` and `/pull` HWS sync
- No MILP solving, no profile storage

**Recommendation**: **Option A** (delete) for this pilot. Backend adds complexity with no value once offline-first is working.

---

### 3.6 Phase 6: Testing & Documentation (Week 6)

#### **Task 6.1: Update README**

**New README should cover:**
- PWA installation (Add to Home Screen)
- Offline usage (no internet needed)
- Sync to HWS (when connected)
- Troubleshooting offline conflicts
- Development setup (no backend required)

#### **Task 6.2: Test Scenarios**

```
✅ Scenario 1: Offline Mode
  - No internet
  - Submit profile → saved to IndexedDB
  - Generate roster → client solver runs
  - Export PDF → jsPDF generates locally
  - All works without backend

✅ Scenario 2: Reconnect & Sync
  - Add profile offline
  - Connect to internet
  - Auto-sync to HWS
  - Receive updated profiles from HWS
  - Resolve any conflicts

✅ Scenario 3: Conflict Resolution
  - Edit roster locally
  - HWS has newer version
  - Show user both versions
  - Let user choose or merge manually

✅ Scenario 4: Large Dataset
  - 50+ staff profiles
  - Solver completes in <5 seconds
  - No janky UI freezes
```

---

## Part 4: File Structure After Redesign

```
vic-roster-ai/
├── frontend/
│   ├── public/
│   │   ├── manifest.json (NEW)
│   │   └── icons/ (NEW)
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx (MODIFIED)
│   │   │   ├── NumDashboard.jsx (MODIFIED)
│   │   │   ├── Instructions.jsx
│   │   │   ├── ErrorModal.jsx
│   │   │   └── StatusBar.jsx (NEW)
│   │   ├── db/ (NEW)
│   │   │   ├── store.js
│   │   │   └── migrations.js
│   │   ├── solver/ (NEW)
│   │   │   ├── ortools-solver.js (or jsLPSolve)
│   │   │   ├── constraints.js
│   │   │   └── validator.js
│   │   ├── rules/ (NEW)
│   │   │   ├── fairness.js
│   │   │   ├── fatigue.js
│   │   │   ├── flexibility.js
│   │   │   └── requests.js
│   │   ├── sync/ (NEW)
│   │   │   ├── queue.js
│   │   │   ├── hws.js
│   │   │   ├── conflicts.js
│   │   │   └── network.js
│   │   ├── export/ (NEW)
│   │   │   ├── pdf.js
│   │   │   └── excel.js
│   │   ├── validation/ (NEW)
│   │   │   └── index.js
│   │   ├── service-worker.js (NEW)
│   │   ├── index.jsx (MODIFIED - register SW)
│   │   └── main.jsx
│   ├── package.json (MODIFIED - add deps)
│   ├── vite.config.js (MODIFIED)
│   └── README.md (MODIFIED)
├── backend/ (DELETE - not needed)
├── .env.example
├── PROJECT_SUMMARY.md (THIS FILE)
└── README.md (root-level)
```

---

## Part 5: New Dependencies

### Frontend `package.json` Additions

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.5",
    "dexie": "^4.0.0",           // IndexedDB wrapper (NEW)
    "or-tools": "^9.9.3963",     // OR-Tools WASM (NEW) OR
    "jslpsolver": "^0.4.4",      // jsLPSolve (NEW) - choose one
    "jspdf": "^2.5.1",           // PDF generation (NEW)
    "html2canvas": "^1.4.1"      // HTML to image (NEW)
  }
}
```

---

## Part 6: Development Workflow (After Redesign)

### Development
```bash
cd frontend
npm install
npm run dev

# Visit http://localhost:5173
# NO backend needed
# All data stored locally
# Solver runs in browser
```

### Build for Deployment
```bash
npm run build

# Output: dist/ folder (static files only)
# Can be deployed to any static host:
# - GitHub Pages
# - Netlify
# - Hospital web server
# - Even served locally with Python: python3 -m http.server
```

### Testing
```bash
npm run test

# Test offline scenarios
# Test solver with 50+ profiles
# Test sync conflicts
```

---

## Part 7: Migration Path

### Week 1-2: Phase 1 (Remove Backend)
- [x] Choose MILP solver
- [ ] Set up IndexedDB with Dexie
- [ ] Add Service Worker
- [ ] Migrate profile storage
- [ ] Test offline profile submission

### Week 3-4: Phase 2 (Client Solver)
- [ ] Integrate MILP solver
- [ ] Implement Four Fs rules
- [ ] Move validation to frontend
- [ ] Test roster generation (50+ profiles)

### Week 4: Phase 3 (PDF Export)
- [ ] Add jsPDF + html2canvas
- [ ] Implement client-side PDF export
- [ ] Remove backend export endpoint

### Week 5: Phase 4 (Sync Engine)
- [ ] Implement sync queue
- [ ] Add HWS sync logic
- [ ] Handle conflict detection
- [ ] Test offline→online sync

### Week 5-6: Phase 5-6 (Cleanup & Testing)
- [ ] Delete backend (or keep minimal sync service)
- [ ] Update README
- [ ] Full offline scenario testing
- [ ] Deploy PWA

---

## Part 8: Open Questions for Stakeholders

### Architecture Decisions
1. **MILP Solver**: Use OR-Tools WASM (powerful) or jsLPSolve (lightweight)?
2. **Backend**: Delete entirely or keep for HWS sync?
3. **Four Fs Definition**: Exact rules for each F (Fair, Fatigue, Flexibility, Requests)?

### HWS Integration
4. **HWS Sync Format**: CSV, JSON, REST API, real-time?
5. **Conflict Resolution**: Auto-merge, manual, or server-wins?
6. **Data Structure**: What fields does HWS expect from rosters?

### Deployment
7. **Where to Host**: GitHub Pages, hospital server, cloud VM?
8. **Domain/URL**: What URL will NUMs use to access the app?
9. **Backup Strategy**: How often to backup rosters?

---

## Part 9: Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Solver performance** | Slow with 50+ staff | Benchmark early, consider solver choice |
| **IndexedDB quota** | Data might be lost | Monitor storage, add cleanup logic |
| **Sync conflicts** | Data inconsistency | Implement version locks + manual resolution |
| **Service Worker bugs** | App stuck offline | Comprehensive testing, version strategy |
| **Browser compat** | Users on old browsers | Progressive enhancement, graceful fallback |

---

## Part 10: Success Criteria

✅ **Phase 1 Complete**: App works 100% offline (no backend)  
✅ **Phase 2 Complete**: Roster generated in <5 seconds for 50+ profiles  
✅ **Phase 3 Complete**: PDF exported locally without server  
✅ **Phase 4 Complete**: Sync works, conflicts detected & resolved  
✅ **Pilot Success**: 30+ NUMs test the app offline for 2 weeks  

---

## Summary: What Needs to Happen

| Item | Current | Change | Priority |
|------|---------|--------|----------|
| **Backend** | FastAPI + PuLP | Delete or minimal | HIGH |
| **Data Storage** | Backend SQLite | IndexedDB (Dexie) | HIGH |
| **Solver** | Backend Python | Client WASM/JS | HIGH |
| **PDF Export** | Backend (OpenPyXL) | Client (jsPDF) | MEDIUM |
| **Offline** | Not supported | Full support via SW | HIGH |
| **Sync** | N/A | Custom sync engine | MEDIUM |
| **Validation** | Backend | Frontend | MEDIUM |
| **Deployment** | N/A | Static hosting (any) | LOW |

---

**Document Version**: 1.0  
**Last Updated**: 3 November 2025  
**Next Review**: After Phase 1 architecture decisions
