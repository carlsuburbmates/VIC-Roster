from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import sqlite3
from pulp import LpProblem, LpMinimize, LpVariable, LpBinary, lpSum, value
from fastapi.responses import FileResponse
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill, Border, Side
import os

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Profile(BaseModel):
    name: str
    email: str
    role: str = "RN"
    fte: str
    shiftPref: str
    maxNDs: str
    softLock: str
    hardLock: str
    cycle: str

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, 'roster.db')
EXPORT_PATH = os.path.join(BASE_DIR, 'Roster_Request.xlsx')

conn = sqlite3.connect(DB_PATH, check_same_thread=False)
conn.execute('''
CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY,
    name TEXT, email TEXT UNIQUE, role TEXT DEFAULT 'RN', fte TEXT, shiftPref TEXT,
    maxNDs TEXT, softLock TEXT, hardLock TEXT, cycle TEXT,
    submitted_at TEXT
)
''')
conn.commit()

try:
    conn.execute("ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'RN'")
    conn.commit()
except sqlite3.OperationalError:
    pass

ROLE_ORDER = ['ANUM', 'CNS', 'RN', 'EN', 'GNP']

@app.post("/submit-profile")
def submit_profile(profile: Profile):
    try:
        conn.execute(
            "INSERT INTO profiles (name, email, role, fte, shiftPref, maxNDs, softLock, hardLock, cycle, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                profile.name,
                profile.email,
                profile.role,
                profile.fte,
                profile.shiftPref,
                profile.maxNDs,
                profile.softLock,
                profile.hardLock,
                profile.cycle,
                datetime.now().isoformat()
            )
        )
        conn.commit()
        return {"status": "success"}
    except sqlite3.IntegrityError:
        raise HTTPException(400, "Email already submitted")

@app.get("/profiles")
def get_profiles():
    cur = conn.execute("SELECT id, name, email, role, fte, shiftPref, maxNDs, softLock, hardLock, cycle, submitted_at FROM profiles")
    return [
        {
            "id": r[0],
            "name": r[1],
            "email": r[2],
            "role": r[3] or "RN",
            "fte": r[4],
            "shiftPref": r[5],
            "maxNDs": r[6],
            "softLock": r[7],
            "hardLock": r[8],
            "cycle": r[9],
            "submitted_at": r[10]
        }
        for r in cur.fetchall()
    ]

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


@app.get("/export-excel")
def export_excel():
    data = generate_roster()
    if not isinstance(data, dict):
        return data
    if data.get("status") != "valid":
        raise HTTPException(400, data.get("message", "Roster not compliant"))

    cur = conn.execute("SELECT name, COALESCE(role, 'RN') FROM profiles")
    staff_info = {row[0]: (row[1] or "RN").upper() for row in cur.fetchall()}

    roster_map = {name: [""] * 14 for name in staff_info.keys()}
    for day_index, day in enumerate(data["roster"]):
        for code, names in (("AM", day["AM"]), ("PM", day["PM"]), ("ND", day["ND"])):
            for name in names:
                if name not in roster_map:
                    roster_map[name] = [""] * 14
                    staff_info[name] = "RN"
                roster_map[name][day_index] = code

    code_map = {"AM": "D", "PM": "E", "ND": "N"}
    shift_fill = {
        "D": PatternFill("solid", fgColor="FFFFFF"),
        "E": PatternFill("solid", fgColor="FFED9E"),
        "N": PatternFill("solid", fgColor="2E7D32"),
        "OFF": PatternFill("solid", fgColor="E9ECEF"),
    }
    thin = Side(border_style="thin", color="D0D0D0")

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Roster Request"

    sheet.merge_cells("A1:P1")
    sheet["A1"] = "SRF Roster Request"
    sheet["A1"].font = Font(bold=True, size=16)
    sheet["A1"].alignment = Alignment(horizontal="center", vertical="center")

    sheet.merge_cells("A2:M2")
    sheet["A2"] = "KEY: E = Evening shift, D = Day Shift, N = Night duty, OFF = Day Off, R = Request, P = Preference"
    sheet["A2"].alignment = Alignment(horizontal="left")
    sheet["A2"].font = Font(size=11)

    sheet.merge_cells("N2:P2")
    sheet["N2"] = "To be taken down on: 19/11/25"
    sheet["N2"].alignment = Alignment(horizontal="center")
    sheet["N2"].font = Font(bold=True, color="FFFFFF")
    sheet["N2"].fill = PatternFill("solid", fgColor="6AA84F")

    sheet.merge_cells("A3:P3")
    sheet["A3"] = "Reminder: 2 requests and 2 preferences each fortnight."
    sheet["A3"].alignment = Alignment(horizontal="center")
    sheet["A3"].font = Font(italic=True, size=11)

    header_band = PatternFill("solid", fgColor="BBD0F7")
    sheet["A5"] = "Role"
    sheet["A5"].font = Font(bold=True)
    sheet["A5"].alignment = Alignment(horizontal="center", vertical="center")
    sheet.column_dimensions["A"].width = 10
    sheet["A5"].fill = header_band

    sheet["B5"] = "Name"
    sheet["B5"].font = Font(bold=True)
    sheet["B5"].alignment = Alignment(horizontal="center", vertical="center")
    sheet.column_dimensions["B"].width = 26
    sheet["B5"].fill = header_band

    sheet.merge_cells("C4:I4")
    sheet["C4"] = "WEEK 1"
    sheet["C4"].font = Font(bold=True)
    sheet["C4"].alignment = Alignment(horizontal="center")
    for col in "CDEFGHI":
        sheet[f"{col}4"].fill = header_band

    sheet.merge_cells("J4:P4")
    sheet["J4"] = "WEEK 2"
    sheet["J4"].font = Font(bold=True)
    sheet["J4"].alignment = Alignment(horizontal="center")
    for col in "JKLMNOP":
        sheet[f"{col}4"].fill = header_band

    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for idx, day_name in enumerate(days):
        col = chr(ord("C") + idx)
        sheet[f"{col}5"] = day_name
        sheet[f"{col}5"].font = Font(bold=True)
        sheet[f"{col}5"].alignment = Alignment(horizontal="center")
        sheet.column_dimensions[col].width = 11

        col_week2 = chr(ord("J") + idx)
        sheet[f"{col_week2}5"] = day_name
        sheet[f"{col_week2}5"].font = Font(bold=True)
        sheet[f"{col_week2}5"].alignment = Alignment(horizontal="center")
        sheet.column_dimensions[col_week2].width = 11

    start_row = 6
    def sort_key(item):
        name = item[0]
        role = staff_info.get(name, "RN")
        try:
            order_index = ROLE_ORDER.index(role)
        except ValueError:
            order_index = len(ROLE_ORDER)
        return (order_index, role, name)

    for row_index, (name, assignments) in enumerate(sorted(roster_map.items(), key=sort_key), start=start_row):
        role = staff_info.get(name, "RN")
        sheet[f"A{row_index}"] = role
        sheet[f"A{row_index}"].alignment = Alignment(horizontal="center", vertical="center")
        sheet[f"A{row_index}"].border = Border(left=thin, right=thin, top=thin, bottom=thin)

        sheet[f"B{row_index}"] = name
        sheet[f"B{row_index}"].alignment = Alignment(vertical="center")
        sheet[f"B{row_index}"].border = Border(left=thin, right=thin, top=thin, bottom=thin)

        for day_index in range(14):
            col_index = day_index if day_index < 7 else day_index - 7
            col_letter = chr(ord("C") + col_index) if day_index < 7 else chr(ord("J") + col_index)
            cell = sheet[f"{col_letter}{row_index}"]
            value = assignments[day_index] or ""
            if not value:
                value = "OFF"
            else:
                value = code_map.get(value, value)
            cell.value = value
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = Border(left=thin, right=thin, top=thin, bottom=thin)
            fill = shift_fill.get(value)
            if fill:
                cell.fill = fill
            if value == "N":
                cell.font = Font(color="FFFFFF", bold=True)
            elif value in {"D", "E"}:
                cell.font = Font(bold=True)

    for col in "CDEFGHIJKLMNOP":
        sheet[f"{col}5"].fill = header_band

    sheet_row_max = sheet.max_row
    for row in range(4, sheet_row_max + 1):
        for col in range(ord("A"), ord("P") + 1):
            cell = sheet[f"{chr(col)}{row}"]
            if not cell.border:
                cell.border = Border(left=thin, right=thin, top=thin, bottom=thin)

    workbook.save(EXPORT_PATH)
    return FileResponse(
        EXPORT_PATH,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="Roster_Request.xlsx"
    )
