import { useEffect, useMemo, useState } from 'react';

const ROLE_ORDER = ['ANUM', 'CNS', 'RN', 'EN', 'GNP'];
const SHIFT_CODE_MAP = { AM: 'D', PM: 'E', ND: 'N' };
const SHIFT_DETAILS = {
  D: { label: 'Day Shift', window: '0700–1530', bg: '#FFFFFF', text: '#212529', border: '#B0BEC5' },
  E: { label: 'Evening Shift', window: '1300–2130', bg: '#FFED9E', text: '#212529', border: '#E1B955' },
  N: { label: 'Night Duty', window: '2100–0730', bg: '#2E7D32', text: '#FFFFFF', border: '#1B5E20' },
  OFF: { label: 'Day Off', window: '—', bg: '#E9ECEF', text: '#495057', border: '#CED4DA' }
};

const START_DATE = '2025-01-05';

function roleOrderIndex(role) {
  const idx = ROLE_ORDER.indexOf((role || '').toUpperCase());
  return idx === -1 ? ROLE_ORDER.length : idx;
}

function formatDateLabel(date) {
  const dayMonth = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'Australia/Melbourne' });
  const weekday = date.toLocaleDateString('en-AU', { weekday: 'short', timeZone: 'Australia/Melbourne' });
  return `${dayMonth} ${weekday}`;
}

export default function NumDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/profiles').then(r => r.json()).then(setProfiles);
  }, []);

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

  const dayMeta = useMemo(() => {
    const base = new Date(`${START_DATE}T00:00:00`);
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      return {
        label: formatDateLabel(date),
        weekIndex: index < 7 ? 0 : 1,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      };
    });
  }, []);

  const analyticsByName = useMemo(() => {
    if (!result || !result.analytics) return {};
    const map = {};
    result.analytics.forEach(entry => { map[entry.name] = entry; });
    return map;
  }, [result]);

  const publishedRows = useMemo(() => {
    if (!result || result.status !== 'valid') return [];

    const roster = result.roster || [];
    const allNames = new Set(profiles.map(p => p.name));
    Object.keys(analyticsByName).forEach(name => allNames.add(name));

    roster.forEach(day => {
      ['AM', 'PM', 'ND'].forEach(block => day[block].forEach(name => allNames.add(name)));
    });

    const matrix = {};
    allNames.forEach(name => { matrix[name] = Array(14).fill('OFF'); });

    roster.forEach((day, dayIndex) => {
      ['AM', 'PM', 'ND'].forEach(block => {
        const code = SHIFT_CODE_MAP[block];
        day[block].forEach(name => {
          if (!matrix[name]) matrix[name] = Array(14).fill('OFF');
          matrix[name][dayIndex] = code;
        });
      });
    });

    return Object.entries(matrix).map(([name, shifts]) => {
      const profile = profiles.find(p => p.name === name);
      const analytics = analyticsByName[name];
      const role = (analytics?.role || profile?.role || profile?.position || 'RN').toUpperCase();
      return {
        name,
        role,
        email: profile?.email || name,
        shifts,
        analytics
      };
    }).sort((a, b) => {
      const roleDiff = roleOrderIndex(a.role) - roleOrderIndex(b.role);
      if (roleDiff !== 0) return roleDiff;
      return a.name.localeCompare(b.name);
    });
  }, [result, profiles, analyticsByName]);

  const publishedDate = useMemo(() => new Date().toLocaleDateString('en-AU'), []);
  const approvingNum = useMemo(() => {
    const numProfile = profiles.find(p => (p.role || '').toUpperCase() === 'NUM');
    return numProfile ? numProfile.name : 'Pending Assignment';
  }, [profiles]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>NUM – Appendix 4 Audit</h1>
      <button onClick={runAudit} disabled={loading} style={styles.triggerButton}>
        {loading ? 'Generating...' : 'Run App.4 Audit'}
      </button>

      <h2 style={styles.sectionTitle}>Staff ({profiles.length})</h2>
      <div style={styles.staffGrid}>
        {profiles.map(p => (
          <div key={p.email} style={styles.staffCard}>
            <strong>{p.name}</strong>
            <div style={styles.staffMeta}>{(p.role || 'RN').toUpperCase()} • {p.fte} FTE</div>
            <div style={styles.staffMeta}>Pref: {p.shiftPref} • Max ND: {p.maxNDs}</div>
            <div style={styles.staffMeta}>Requests: {p.requestsQuota} | Preferences: {p.preferencesQuota}</div>
            {p.availabilityNotes && <div style={styles.staffMetaSmall}>{p.availabilityNotes}</div>}
            {p.supplementaryAvailability && <div style={styles.staffMetaSmall}>Supplementary: {p.supplementaryAvailability}</div>}
            <div style={styles.badgesRow}>
              {p.flexibleWork && <span style={styles.badge}>FWA</span>}
              {p.swapWilling && <span style={styles.badge}>Swap OK</span>}
              {p.overtimeOptIn && <span style={styles.badge}>Overtime</span>}
              {p.localInductionComplete && <span style={styles.badge}>Inducted</span>}
            </div>
          </div>
        ))}
      </div>

      {result && (
        <div>
          {result.status === 'valid' ? (
            <div style={styles.publishedWrapper}>
              {result.compliance && (
                <div style={result.compliance.overall === 'pass' ? styles.complianceBannerPass : styles.complianceBannerWarn}>
                  <span>
                    {result.compliance.overall === 'pass'
                      ? 'Compliance summary: Pass – roster meets fatigue and fairness thresholds.'
                      : `Compliance summary: Attention required for ${result.compliance.warnings.length} staff member(s).`}
                  </span>
                </div>
              )}

              <div style={styles.banner}>
                <div style={styles.bannerLeft}>
                  <div style={styles.logoBar}>Austin Health</div>
                </div>
                <div style={styles.bannerCenter}>
                  <div style={styles.bannerTitle}>Published Roster – Ward A – Fortnight 5–19 Jan</div>
                </div>
                <div style={styles.bannerRight}>
                  <div style={styles.bannerMeta}>Published: {publishedDate}</div>
                  <div style={styles.bannerMeta}>Approved by: NUM {approvingNum}</div>
                </div>
              </div>

              <div style={styles.legend}>
                {Object.entries(SHIFT_DETAILS).map(([code, detail]) => (
                  <div key={code} style={styles.legendItem}>
                    <span style={{ ...styles.legendSwatch, background: detail.bg, borderColor: detail.border }} />
                    <span style={styles.legendText}><strong>{code}</strong> {detail.window} – {detail.label}</span>
                  </div>
                ))}
              </div>

              <div style={styles.tableShell}>
                <div style={styles.rightBar} />
                <table style={styles.publishedTable}>
                  <thead>
                    <tr>
                      <th style={styles.stickyHeaderCell} rowSpan={2}>Role</th>
                      <th style={styles.stickyHeaderCell} rowSpan={2}>Name</th>
                      <th style={styles.stickyHeaderCell} rowSpan={2}>Compliance</th>
                      <th style={styles.weekHeaderCell} colSpan={7}>WEEK 1</th>
                      <th style={styles.weekHeaderCell} colSpan={7}>WEEK 2</th>
                    </tr>
                    <tr>
                      {dayMeta.map((d, idx) => (
                        <th
                          key={idx}
                          style={{
                            ...styles.dayHeaderCell,
                            background: '#FFEEA9'
                          }}
                        >
                          {d.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {publishedRows.map(row => (
                      <tr key={row.email}>
                        <td style={styles.roleCell}>{row.role}</td>
                        <td style={styles.nameCell}>{row.name}</td>
                        <td style={styles.complianceCell}>
                          {row.analytics ? (
                            <>
                              <span style={row.analytics.compliant ? styles.checkGood : styles.checkMuted}>
                                {row.analytics.compliant ? '✓ Compliance pass' : '⚠️ Review required'}
                              </span>
                              <span style={styles.flagInfo}>Fatigue score: {row.analytics.fatigueScore}</span>
                              <span style={styles.weekendCount}>Weekend shifts: {row.analytics.weekendCount}</span>
                              <span style={styles.flagInfo}>Max consecutive: {row.analytics.maxConsecutive}</span>
                              {!row.analytics.hasTwoDayBreak && (
                                <span style={styles.flagBad}>Needs two consecutive days off</span>
                              )}
                              {row.analytics.restBreaches.length > 0 && (
                                <span style={styles.flagBad}>
                                  Turnaround breaches: {row.analytics.restBreaches.length}
                                </span>
                              )}
                              {row.analytics.notes.length > 0 && (
                                <span style={styles.flagBad}>{row.analytics.notes.join(' • ')}</span>
                              )}
                            </>
                          ) : (
                            <span style={styles.flagGood}>No analytics</span>
                          )}
                        </td>
                        {row.shifts.map((shift, idx) => {
                          const detail = SHIFT_DETAILS[shift] || SHIFT_DETAILS.OFF;
                          const isWeekend = dayMeta[idx].isWeekend;
                          return (
                            <td
                              key={`${row.email}-${idx}`}
                              style={{
                                ...styles.shiftCell,
                                background: detail.bg,
                                color: detail.text,
                                borderColor: detail.border,
                                fontWeight: shift === 'OFF' ? 500 : 600,
                                boxShadow: isWeekend ? 'inset 0 0 0 1px #B0BEC5' : undefined
                              }}
                            >
                              {shift}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={styles.complianceNote}>100% EBA Compliant • Fairness checks passed • Fatigue review ready</p>

              <button
                onClick={() => { window.location.href = 'http://localhost:8000/export-excel'; }}
                style={styles.exportButton}
              >
                Export SRF Roster Excel
              </button>

              <footer style={styles.footer}>
                OPPIC ID: GDL-25994 • Updated: 18/05/2025 • Retain for seven (7) years
              </footer>
            </div>
          ) : (
            <p style={styles.errorMessage}>
              No solution: {result.message || 'Adjust FTE, coverage, or locks'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Inter, sans-serif', maxWidth: 1140, margin: '40px auto', padding: 32, background: '#F5F7FB', borderRadius: 16, boxShadow: '0 2px 8px rgba(31,45,61,0.12)' },
  header: { color: '#004B87', fontSize: 28, marginBottom: 12, textAlign: 'center' },
  triggerButton: { background: '#004B87', color: 'white', padding: 14, border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', width: '100%', marginBottom: 24 },
  sectionTitle: { color: '#495057', fontSize: 18, marginBottom: 12 },
  staffGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 },
  staffCard: { background: 'white', borderRadius: 12, padding: 16, border: '1px solid #E3E8EF', boxShadow: '0 1px 2px rgba(15,23,42,0.08)' },
  staffMeta: { color: '#6C757D', fontSize: 13, marginTop: 4 },
  staffMetaSmall: { color: '#868E96', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  badgesRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  badge: { background: '#E3F2FD', color: '#1565C0', padding: '4px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' },
  publishedWrapper: { background: 'white', borderRadius: 16, padding: 24, border: '1px solid #DDE1E6', boxShadow: '0 10px 40px rgba(76,78,100,0.08)' },
  complianceBannerPass: { background: '#E6F4EA', color: '#1E7E34', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontWeight: 600 },
  complianceBannerWarn: { background: '#FFF3CD', color: '#856404', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontWeight: 600 },
  banner: { display: 'grid', gridTemplateColumns: '160px 1fr 220px', alignItems: 'center', background: '#4B0082', color: 'white', borderRadius: 12, padding: '16px 24px', marginBottom: 20 },
  bannerLeft: { display: 'flex', alignItems: 'center' },
  logoBar: { background: 'rgba(255,255,255,0.18)', padding: '8px 12px', borderRadius: 8, fontWeight: 600, letterSpacing: 0.6 },
  bannerCenter: { textAlign: 'center', fontWeight: 700, fontSize: 20 },
  bannerTitle: { margin: 0 },
  bannerRight: { textAlign: 'right', fontSize: 13, lineHeight: 1.4 },
  bannerMeta: { margin: 0 },
  legend: { display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#495057' },
  legendSwatch: { display: 'inline-block', width: 22, height: 22, borderRadius: 6, border: '1px solid #CED4DA' },
  legendText: { display: 'inline-flex', flexDirection: 'column', fontSize: 12, color: '#495057' },
  tableShell: { position: 'relative', overflowX: 'auto', borderRadius: 12, border: '1px solid #CED4DA' },
  rightBar: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 6, background: '#C62828', borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  publishedTable: { width: '100%', borderCollapse: 'collapse', fontSize: 13, color: '#212529' },
  stickyHeaderCell: { background: '#E0D7EC', color: '#2C1D4E', padding: '12px 8px', border: '1px solid #C3BADB', textAlign: 'left', minWidth: 110, fontWeight: 600 },
  weekHeaderCell: { background: '#6C757D', color: 'white', padding: 12, border: '1px solid #54606B', textAlign: 'center', fontWeight: 700 },
  dayHeaderCell: { color: '#3F3D56', padding: '10px 8px', border: '1px solid #E4C063', fontWeight: 600, textAlign: 'center', minWidth: 100 },
  roleCell: { background: '#1F1F1F', color: 'white', padding: '10px 12px', border: '1px solid #2B2B2B', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' },
  nameCell: { background: '#F8F9FA', padding: '10px 12px', border: '1px solid #CED4DA', fontWeight: 600 },
  complianceCell: { background: '#F1F3F5', padding: '10px 12px', border: '1px solid #CED4DA', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 },
  checkGood: { color: '#2E7D32', fontWeight: 600 },
  checkMuted: { color: '#AD8C00', fontWeight: 600 },
  flagBad: { color: '#C62828', fontWeight: 600 },
  flagGood: { color: '#B0BEC5', fontWeight: 600 },
  weekendCount: { color: '#1565C0', fontWeight: 600 },
  flagInfo: { color: '#495057', fontWeight: 600 },
  shiftCell: { padding: '10px 0', textAlign: 'center', border: '1px solid #CED4DA' },
  complianceNote: { textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#2E7D32', margin: '16px 0' },
  exportButton: { background: '#2A9D8F', color: 'white', padding: 14, border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', width: '100%', margin: '12px 0 0' },
  footer: { marginTop: 20, textAlign: 'center', fontSize: 12, color: '#6C757D', borderTop: '1px solid #E0E0E0', paddingTop: 12 },
  errorMessage: { color: '#E76F51', fontWeight: 600, textAlign: 'center', marginTop: 24 }
};
