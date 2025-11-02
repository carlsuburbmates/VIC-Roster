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
                <thead><tr><th>Day</th><th>AM</th><th>PM</th><th>ND</th></tr></thead>
                <tbody>
                  {result.roster.map((d, i) => (
                    <tr key={i}>
                      <td><strong>Day {d.day}</strong></td>
                      <td style={amStyle}>{d.AM.join(', ') || '-'}</td>
                      <td style={pmStyle}>{d.PM.join(', ') || '-'}</td>
                      <td style={ndStyle}>{d.ND.join(', ') || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={success}>100% EBA Compliant</p>
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

const styles = { /* same as before */ };
const amStyle = { background: '#A8DADC', padding: 8 };
const pmStyle = { background: '#F4A261', padding: 8 };
const ndStyle = { background: '#1D3557', color: 'white', padding: 8 };
const success = { color: '#2A9D8F', fontWeight: 'bold', textAlign: 'center', marginTop: 16 };
const error = { color: '#E76F51', fontWeight: 'bold', textAlign: 'center', marginTop: 16 };