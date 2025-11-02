from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import sqlite3
from pulp import LpProblem, LpMinimize, LpVariable, LpBinary, lpSum, value
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from fastapi.responses import FileResponse
import os

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Profile(BaseModel):
    name: str
    email: str
    fte: str
    shiftPref: str
    maxNDs: str
    softLock: str
    hardLock: str
    cycle: str

conn = sqlite3.connect('roster.db', check_same_thread=False)
conn.execute('''
CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY,
    name TEXT, email TEXT UNIQUE, fte TEXT, shiftPref TEXT,
    maxNDs TEXT, softLock TEXT, hardLock TEXT, cycle TEXT,
    submitted_at TEXT
)
''')
conn.commit()

@app.post("/submit-profile")
def submit_profile(profile: Profile):
    try:
        conn.execute("INSERT INTO profiles (name, email, fte, shiftPref, maxNDs, softLock, hardLock, cycle, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                     (profile.name, profile.email, profile.fte, profile.shiftPref, profile.maxNDs, profile.softLock, profile.hardLock, profile.cycle, datetime.now().isoformat()))
        conn.commit()
        return {"status": "success"}
    except sqlite3.IntegrityError:
        raise HTTPException(400, "Email already submitted")

@app.get("/profiles")
def get_profiles():
    cur = conn.execute("SELECT * FROM profiles")
    return [{"id": r[0], "name": r[1], "email": r[2], "fte": r[3], "shiftPref": r[4],
             "maxNDs": r[5], "softLock": r[6], "hardLock": r[7], "cycle": r[8], "submitted_at": r[9]} for r in cur.fetchall()]

@app.get("/generate-roster")
def generate_roster():
    cur = conn.execute("SELECT name, fte, shiftPref, maxNDs, softLock, hardLock FROM profiles")
    staff = cur.fetchall()
    if not staff: raise HTTPException(400, "No profiles")

    DAYS = 14
    SHIFTS = ['AM', 'PM', 'ND']
    N = len(staff)
    S, D, K = range(N), range(DAYS), range(3)
    MIN_STAFF = 1  # Reduced for pilot

    prob = LpProblem("Roster", LpMinimize)
    x = LpVariable.dicts("assign", (S, D, K), cat=LpBinary)

    # COVERAGE
    for d in D:
        for k in K:
            prob += lpSum(x[i][d][k] for i in S) >= MIN_STAFF

    # FTE: FLOOR to integer shifts
    for i in S:
        fte = float(staff[i][1])
        target = int(fte * DAYS)  # e.g., 0.8*14 → 11
        prob += lpSum(x[i][d][k] for d in D for k in K) >= target
        prob += lpSum(x[i][d][k] for d in D for k in K) <= target + 1  # Allow ±1

    # MAX 6/WEEK
    for i in S:
        for w in [0, 1]:
            prob += lpSum(x[i][d][k] for d in range(w*7, w*7+7) for k in K) <= 6

    # MAX NDs
    for i in S:
        prob += lpSum(x[i][d][2] for d in D) <= int(staff[i][3])

    # 8h REST
    for i in S:
        for d in range(DAYS-1):
            for k1 in K:
                for k2 in K:
                    if (k1 == 0 and k2 == 2) or (k1 == 2 and k2 == 0): continue
                    prob += x[i][d][k1] + x[i][d+1][k2] <= 1

    # HARD LOCK
    for i in S:
        if staff[i][5]:
            try:
                day = int(staff[i][5].split('-')[-1]) - 1
                if 0 <= day < DAYS:
                    prob += lpSum(x[i][day][k] for k in K) == 0
            except: pass

    # SOFT LOCK
    soft_penalty = 0
    for i in S:
        if staff[i][4]:
            try:
                day = int(staff[i][4].split('-')[-1]) - 1
                if 0 <= day < DAYS:
                    soft_penalty += lpSum(x[i][day][k] for k in K) * 100
            except: pass
    prob += soft_penalty

    # PREFERENCE
    pref_map = {'AM': 0, 'PM': 1, 'ND': 2}
    prob += lpSum(x[i][d][k] for i in S for d in D for k in K if k != pref_map[staff[i][2]])

    prob.solve()
    if prob.status != 1:
        return {"status": "infeasible", "message": "Try reducing MIN_STAFF or adjusting FTE"}

    roster = []
    for d in D:
        day = {"day": d+1, "AM": [], "PM": [], "ND": []}
        for i in S:
            for k in K:
                if value(x[i][d][k]) == 1:
                    day[SHIFTS[k]].append(staff[i][0])
        roster.append(day)

    return {"status": "valid", "roster": roster}