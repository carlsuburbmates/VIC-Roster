# VIC Roster — Developer Handover Package

**Created**: 3 November 2025  
**For**: Development team taking over VIC Roster project  
**Status**: Ready for Phase 1 (after stakeholder decisions)

---

## 📋 What's Included in This Package

You now have **three comprehensive documents** for complete project understanding:

### 1. **PROJECT_SUMMARY.md** (10 parts, 400+ lines)
Complete project reference document covering:
- Part 1: Current state (FastAPI backend, SQLite)
- Part 2: Target state (offline-first PWA)
- Part 3: All required modifications (Phase-by-phase)
- Part 4: File structure after redesign
- Part 5: New dependencies needed
- Part 6: Development workflow
- Part 7: Migration path
- Part 8: Open questions for stakeholders
- Part 9: Risks & mitigation
- Part 10: Success criteria

**Use when**: Understanding what needs to change and why

### 2. **IMPLEMENTATION_CHECKLIST.md** (250+ lines)
Detailed 8-week execution plan with:
- **PRE-PHASE**: Blocking decisions needed from stakeholders (ASAP)
- **Phase 1** (Weeks 1-2): IndexedDB + Service Worker + remove backend
- **Phase 2** (Weeks 3-4): Client-side solver + Four Fs rules
- **Phase 3** (Week 4-5): Client-side PDF export
- **Phase 4** (Week 5-6): Sync engine + HWS integration
- **Phase 5** (Week 6): Backend cleanup
- **Phase 6** (Week 6-7): Documentation + testing
- **Phase 7** (Week 8): Pilot rollout

Each phase has:
- ✅ Specific tasks with checkboxes
- 📁 Files to create/modify
- ⏰ Deadlines
- 🧪 Tests to write
- 📝 Sign-off criteria

**Use when**: Tracking daily work, assigning tasks, measuring progress

### 3. **This File** (Orientation)
Quick reference for getting started.

---

## 🚨 CRITICAL: Must Do First

**BEFORE ANY CODING**, get answers to these questions (estimated 2-3 hours):

### Decision 1: Client-Side MILP Solver
**Question**: Which solver library?

| Option | Pros | Cons | Time | Recommendation |
|--------|------|------|------|---|
| **OR-Tools WASM** | Powerful, optimal, production | 3MB, complex, 10+ hours learning | Hours to implement | ✅ **Best** |
| **jsLPSolve** | Lightweight, JS, 3 hours to learn | LP-only (not full MILP), less optimal | Hours to integrate | Good for MVP |
| **Custom Greedy** | Fast, full control | May miss optimal rosters | Days to perfect | Fallback only |

**Impact**: This choice blocks Phase 2 schedule completely.  
**Owner**: Technical Lead  
**Deadline**: ASAP (same day if possible)

### Decision 2: Four Fs Rules Definition
**Question**: Exact rules for each F?

- **Fair**: How distribute shifts equally? Use variance threshold? Min-max fairness?
- **Fatigue**: Max 5 consecutive shifts? 2 days rest per week? Specific rest after night shifts?
- **Flexibility**: How weight preference matching vs fairness? Soft locks weight vs hard locks?
- **Request Quotas**: Max 2 swaps per person? Max 3 time-off requests? How enforce?

**Impact**: Phase 2 implementation details.  
**Owner**: NUM/Clinical Lead  
**Deadline**: ASAP

### Decision 3: HWS Integration Specification
**Question**: How to sync with hospital system?

- **Format**: CSV download/upload? JSON REST API? Real-time WebSocket?
- **Conflict handling**: Auto-merge? Manual review? Server always wins?
- **Data fields**: What fields do rosters need for HWS? Audit trail?
- **Frequency**: Push after generate? Pull on startup? Continuous sync?

**Impact**: Phase 4 implementation.  
**Owner**: HWS Technical Lead  
**Deadline**: Before Phase 4 (Week 5)

### Decision 4: Backend Future
**Question**: Keep or delete?

- **Option A (Recommended)**: Delete entire `backend/` directory. Frontend is 100% standalone PWA.
- **Option B**: Keep minimal Node.js sync service (only `/push` and `/pull` endpoints).

**Impact**: Phase 5 cleanup, ongoing ops burden.  
**Owner**: Technical Lead  
**Deadline**: Before Phase 5 (Week 6)

---

## 🗂️ File Structure (Now)

```
vic-roster-ai/
├── frontend/
│   ├── src/
│   │   ├── App.jsx (needs major refactor)
│   │   ├── NumDashboard.jsx (needs major refactor)
│   │   ├── api.js (to be deprecated)
│   │   └── ... other components
│   ├── package.json (needs dependency updates)
│   └── README.md (needs update)
├── backend/
│   ├── main.py (to be deleted or minimized)
│   ├── requirements.txt
│   └── __pycache__/
├── PROJECT_SUMMARY.md ← NEW
├── IMPLEMENTATION_CHECKLIST.md ← UPDATED
└── README.md (root)
```

---

## 📊 Project Scope

### Current Implementation (❌ Not matching spec)
- FastAPI backend with PuLP MILP solver
- SQLite database (file-based)
- React frontend calling backend APIs
- No offline support
- No sync capability
- **Problem**: Requires live server; breaks when offline

### Target Implementation (✅ Offline-first PWA)
- Pure React frontend
- Client-side solver (WASM or JS)
- IndexedDB local storage
- Service Worker for offline support
- Sync engine for HWS integration
- **Benefit**: Works 100% offline, optionally syncs when connected

### Timeline
- **Week 1-2**: Phase 1 (IndexedDB + PWA)
- **Week 3-4**: Phase 2 (Client solver + rules)
- **Week 4-5**: Phase 3 (PDF export)
- **Week 5-6**: Phase 4 (Sync engine)
- **Week 6**: Phase 5 (Cleanup)
- **Week 6-7**: Phase 6 (Docs + testing)
- **Week 8**: Phase 7 (Pilot launch)

---

## 🎯 Starting Phase 1 (After Stakeholder Decisions)

### Day 1: Environment Setup
```bash
cd frontend
npm install dexie jspdf html2canvas  # Add new deps
npm install --save-dev @testing-library/react  # For tests
```

### Day 1-2: Create Directory Structure
```bash
mkdir -p src/{db,solver,rules,sync,export,validation,components}
mkdir -p src/db/__tests__
mkdir -p public/icons
```

### Day 2-3: IndexedDB Implementation
- Create `src/db/store.js` (Dexie schema + CRUD)
- Create `src/db/migrations.js` (schema versions)
- Write tests: `src/db/__tests__/store.test.js`

### Day 3-4: Service Worker + PWA
- Create `src/service-worker.js`
- Create `public/manifest.json`
- Register SW in `src/main.jsx`
- Add manifest link to `index.html`

### Day 4-5: Refactor App.jsx
- Remove `submitProfile()` API call
- Replace with IndexedDB: `db.profiles.add(form)`
- Test: Submit → stores locally

### Day 5: Refactor NumDashboard.jsx
- Remove `fetchProfiles()` API call
- Replace with: `db.profiles.toArray()`
- Stub `generateRoster()` (will implement in Phase 2)

---

## 🧪 Testing During Phase 1

Before moving to Phase 2, verify:

```javascript
// Test 1: Can store profiles offline
const profile = { name: "John", email: "john@vic.edu.au", ... };
await db.profiles.add(profile);
const stored = await db.profiles.where('name').equals('John').first();
assert(stored !== undefined);

// Test 2: Service Worker cached app shell
// Go to DevTools → Application → Service Workers
// Should see: Service Worker ACTIVE

// Test 3: Works offline
// DevTools → Network → throttle to "Offline"
// Submit form → should save locally (no error)
// Refresh page → profile still there

// Test 4: PWA installable
// On mobile or DevTools emulation
// Should show "Add to Home Screen" prompt
```

---

## 📞 Key Contacts (Update as Needed)

| Role | Name | Email | Decisions |
|------|------|-------|-----------|
| **Technical Lead** | [Fill in] | [Fill in] | Solver choice, backend decision |
| **NUM/Clinical Lead** | [Fill in] | [Fill in] | Four Fs rules |
| **HWS Technical** | [Fill in] | [Fill in] | Sync spec |
| **Product Lead** | [Fill in] | [Fill in] | Overall direction |

---

## 📚 References & Documentation

- [Progressive Web Apps (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/)
- [Dexie.js Documentation](https://dexie.org/)
- [OR-Tools JS Guide](https://developers.google.com/optimization/install)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)

---

## ✅ Checklist Before You Start

- [ ] I have read `PROJECT_SUMMARY.md` completely
- [ ] I have read `IMPLEMENTATION_CHECKLIST.md` completely
- [ ] I have stakeholder answers to all 4 blocking decisions
- [ ] I have updated the "Key Contacts" table above
- [ ] I have created a shared workspace/repo access
- [ ] I have set up development environment (Node.js 18+, npm 9+)
- [ ] I have GitHub branch permissions
- [ ] I have scheduled kickoff meeting with stakeholders

---

## 🚀 Ready to Start?

1. **Get stakeholder decisions** (2-3 hours max)
2. **Read both reference documents** (2-3 hours)
3. **Run Phase 1 setup** (2-3 hours)
4. **Begin Phase 1 tasks** from IMPLEMENTATION_CHECKLIST.md

---

## 📞 Questions?

If anything is unclear:
1. Check `PROJECT_SUMMARY.md` Part 1-10
2. Check `IMPLEMENTATION_CHECKLIST.md` for specific task details
3. Ask stakeholders in the decision table above
4. Create GitHub issue with `[QUESTION]` prefix

---

**Good luck! This is an exciting migration to an offline-capable app.** 🎉

Document prepared: 3 November 2025
