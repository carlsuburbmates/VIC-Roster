import { useEffect, useState } from 'react';

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
      // Log for diagnostics to satisfy ESLint no-unused-vars and aid debugging
      console.error('Run App.4 Audit failed:', err);
      setResult({ status: "error", message: "Backend unreachable" });
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>NUM – Appendix 4 Audit</h1>
      <button onClick={runAudit} disabled={loading} style={styles.button}>
        {loading ? 'Generating...' : 'Run App.4 Audit'}
      </button>

      <h2>Staff ({profiles.length})</h2>
      <div style={styles.grid}>
        {profiles.map(p => (
          <div key={p.email} style={styles.card}>
            <strong>{p.name}</strong><br/>{p.fte} FTE | {p.shiftPref} | Max ND: {p.maxNDs}
          </div>
        ))}
      </div>

      {result && (
        <div>
          {result.status === "valid" ? (
            <>
              <h2>14-Day Roster</h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={headerCell}>Day</th>
                    <th style={headerCell}>AM</th>
                    <th style={headerCell}>PM</th>
                    <th style={headerCell}>ND</th>
                  </tr>
                </thead>
                <tbody>
                  {result.roster.map((d, i) => (
                    <tr key={i}>
                      <td style={dayCell}><strong>Day {d.day}</strong></td>
                      <td style={amStyle}>{d.AM.join(', ') || '-'}</td>
                      <td style={pmStyle}>{d.PM.join(', ') || '-'}</td>
                      <td style={ndStyle}>{d.ND.join(', ') || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={success}>100% EBA Compliant</p>
              <button
                onClick={() => { window.location.href = 'http://localhost:8000/export-pdf'; }}
                style={styles.exportBtn}
              >
                Export Appendix 4 PDF
              </button>
            </>
          ) : (
            <p style={error}>
              No solution: {result.message || "Adjust FTE, coverage, or locks"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Inter, sans-serif', maxWidth: 960, margin: '40px auto', padding: 32, background: '#F8F9FA', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  header: { color: '#004B87', fontSize: 28, marginBottom: 16, textAlign: 'center' },
  button: { background: '#004B87', color: 'white', padding: 14, border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', width: '100%', marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
  card: { background: 'white', borderRadius: 8, padding: 16, border: '1px solid #E9ECEF', textAlign: 'left', color: '#212529' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', marginTop: 16 },
  exportBtn: { background: '#2A9D8F', color: 'white', padding: 12, border: 'none', borderRadius: 8, margin: '16px 0', width: '100%', fontWeight: 'bold', cursor: 'pointer' }
};
const headerCell = { background: '#004B87', color: 'white', padding: 8, border: '1px solid #DEE2E6', textAlign: 'left' };
const dayCell = { border: '1px solid #DEE2E6', padding: 8, fontWeight: 'bold' };
const amStyle = { background: '#A8DADC', padding: 8, border: '1px solid #DEE2E6' };
const pmStyle = { background: '#F4A261', padding: 8, border: '1px solid #DEE2E6' };
const ndStyle = { background: '#1D3557', color: 'white', padding: 8, border: '1px solid #DEE2E6' };
const success = { color: '#2A9D8F', fontWeight: 'bold', textAlign: 'center', marginTop: 16 };
const error = { color: '#E76F51', fontWeight: 'bold', textAlign: 'center', marginTop: 16 };
