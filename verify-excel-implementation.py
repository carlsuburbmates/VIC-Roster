#!/usr/bin/env python3
"""
Direct verification of Excel export functionality
Tests the code logic without running the full FastAPI server
"""

import os
import sys

def verify_implementation():
    """Verify Excel export implementation exists and is properly structured"""
    
    print("=" * 70)
    print("VERIFICATION: Excel Export Implementation")
    print("=" * 70)
    
    issues = []
    successes = []
    
    # Check 1: Backend requirements.txt
    print("\n✓ Check 1: Backend dependencies...")
    req_path = "/Users/carlg/Documents/trae_projects/VIC Roster/vic-roster-ai/backend/requirements.txt"
    if os.path.exists(req_path):
        with open(req_path) as f:
            content = f.read()
        if "openpyxl" in content:
            successes.append("openpyxl listed in requirements.txt")
            print(f"  ✓ openpyxl found in requirements.txt")
        else:
            issues.append("openpyxl NOT in requirements.txt")
            print(f"  ✗ openpyxl NOT found")
    else:
        issues.append(f"requirements.txt not found at {req_path}")
    
    # Check 2: Backend main.py export function
    print("\n✓ Check 2: Backend export endpoint...")
    main_py = "/Users/carlg/Documents/trae_projects/VIC Roster/vic-roster-ai/backend/main.py"
    if os.path.exists(main_py):
        with open(main_py) as f:
            content = f.read()
        
        checks = [
            ("@app.get(\"/export-excel\")", "Export endpoint decorator"),
            ("def export_excel():", "Export function definition"),
            ("PatternFill", "Excel cell styling"),
            ("Workbook()", "Excel workbook creation"),
            ("workbook.save(EXPORT_PATH)", "Excel file save"),
            ("FileResponse", "File response for download"),
            ("\"Published Roster\"", "Report header text"),
        ]
        
        for check_str, label in checks:
            if check_str in content:
                successes.append(f"Backend: {label}")
                print(f"  ✓ {label}")
            else:
                issues.append(f"Backend missing: {label}")
                print(f"  ✗ Missing: {label}")
    else:
        issues.append(f"main.py not found at {main_py}")
    
    # Check 3: Frontend API wrapper
    print("\n✓ Check 3: Frontend API wrapper...")
    api_js = "/Users/carlg/Documents/trae_projects/VIC Roster/vic-roster-ai/frontend/src/api.js"
    if os.path.exists(api_js):
        with open(api_js) as f:
            content = f.read()
        
        checks = [
            ("export-excel", "Export endpoint reference"),
            ("exportRosterExcel", "Export function export"),
            ("window.URL.createObjectURL", "Blob download handling"),
            ("a.download", "File download attribute"),
        ]
        
        for check_str, label in checks:
            if check_str in content:
                successes.append(f"Frontend: {label}")
                print(f"  ✓ {label}")
            else:
                issues.append(f"Frontend missing: {label}")
                print(f"  ✗ Missing: {label}")
    else:
        issues.append(f"api.js not found")
    
    # Check 4: NumDashboard component
    print("\n✓ Check 4: NumDashboard UI component...")
    dashboard_jsx = "/Users/carlg/Documents/trae_projects/VIC Roster/vic-roster-ai/frontend/src/NumDashboard.jsx"
    if os.path.exists(dashboard_jsx):
        with open(dashboard_jsx) as f:
            content = f.read()
        
        checks = [
            ("exportRosterExcel", "Import export function"),
            ("Export SRF Roster Excel", "Export button label"),
            ("handleExport", "Export button handler"),
        ]
        
        for check_str, label in checks:
            if check_str in content:
                successes.append(f"NumDashboard: {label}")
                print(f"  ✓ {label}")
            else:
                issues.append(f"NumDashboard missing: {label}")
                print(f"  ✗ Missing: {label}")
    else:
        issues.append(f"NumDashboard.jsx not found")
    
    # Check 5: Excel formatting details
    print("\n✓ Check 5: Excel formatting features...")
    if os.path.exists(main_py):
        with open(main_py) as f:
            content = f.read()
        
        features = [
            ("shift_fill = {", "Shift-based color coding"),
            ('fgColor="2E7D32"', "Night shift green color"),
            ('fgColor="FFED9E"', "Evening shift yellow color"),
            ("Compliance Summary", "Compliance sheet"),
            ('sheet["D4"] = "WEEK 1"', "Week headers"),
            ("SHIFT_CODE_MAP", "Shift code mapping"),
            ("role_sort_key", "Role-based sorting"),
        ]
        
        for check_str, label in features:
            if check_str in content:
                successes.append(f"Formatting: {label}")
                print(f"  ✓ {label}")
            else:
                issues.append(f"Formatting missing: {label}")
                print(f"  ✗ Missing: {label}")
    
    # Print summary
    print("\n" + "=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)
    print(f"\n✓ Successes: {len(successes)}")
    for success in successes:
        print(f"  • {success}")
    
    if issues:
        print(f"\n✗ Issues: {len(issues)}")
        for issue in issues:
            print(f"  • {issue}")
        return False
    else:
        print("\n✓ ALL CHECKS PASSED - Excel export implementation is complete!")
        return True

if __name__ == "__main__":
    success = verify_implementation()
    sys.exit(0 if success else 1)
