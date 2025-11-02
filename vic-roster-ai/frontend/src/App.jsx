import { useState } from 'react';
import './App.css';

function App() {
  const [form, setForm] = useState({
    name: '', email: '', fte: '1.0', shiftPref: 'AM', maxNDs: '3',
    softLock: '', hardLock: '', cycle: '27 Nov – 10 Dec'
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.name) err.name = "Name required";
    if (!form.email || !form.email.includes('@')) err.email = "Valid email required";
    if (!['0.6', '0.8', '1.0'].includes(form.fte)) err.fte = "Invalid FTE";
    if (!['AM', 'PM', 'ND'].includes(form.shiftPref)) err.shiftPref = "Select shift";
    const nd = parseInt(form.maxNDs);
    if (isNaN(nd) || nd < 0 || nd > 3) err.maxNDs = "0–3 only";
    return err;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }
    const res = await fetch('http://localhost:8000/submit-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={styles.success}>
        <h2>Submitted!</h2>
        <p>Your preferences are saved for <strong>{form.cycle}</strong>.</p>
        <p>Deadline: <strong>12 Nov 2025</strong> (Melbourne)</p>
      </div>
    );
  }
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Victorian Rostering Toolkit</h1>
      <h2 style={styles.sub}>Staff Preference Profile (Appendix 3)</h2>
      <p style={styles.deadline}>Submit by <strong>12 Nov 2025</strong></p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="name" placeholder="Full Name" value={form.name}
          onChange={e => setForm({...form, name: e.target.value})} style={styles.input} />
        {errors.name && <span style={styles.error}>{errors.name}</span>}

        <input name="email" placeholder="Email (unique ID)" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} style={styles.input} />
        {errors.email && <span style={styles.error}>{errors.email}</span>}

        <select name="fte" value={form.fte} onChange={e => setForm({...form, fte: e.target.value})} style={styles.input}>
          <option value="1.0">1.0 FTE</option>
          <option value="0.8">0.8 FTE</option>
          <option value="0.6">0.6 FTE</option>
        </select>

        <select name="shiftPref" value={form.shiftPref} onChange={e => setForm({...form, shiftPref: e.target.value})} style={styles.input}>
          <option value="AM">Prefer AM</option>
          <option value="PM">Prefer PM</option>
          <option value="ND">Prefer ND</option>
        </select>

        <input name="maxNDs" placeholder="Max Night Duties (0–3)" value={form.maxNDs}
          onChange={e => setForm({...form, maxNDs: e.target.value})} style={styles.input} />
        {errors.maxNDs && <span style={styles.error}>{errors.maxNDs}</span>}

        <input name="softLock" placeholder="Soft Lock (e.g. 15 Nov)" value={form.softLock}
          onChange={e => setForm({...form, softLock: e.target.value})} style={styles.input} />

        <input name="hardLock" placeholder="Hard Lock (e.g. 20 Nov)" value={form.hardLock}
          onChange={e => setForm({...form, hardLock: e.target.value})} style={styles.input} />

        <input value={form.cycle} readOnly style={styles.input} />

        <button type="submit" style={styles.button}>Submit Profile</button>
      </form>

      <div style={{textAlign: 'center', marginTop: 24}}>
        <a href="/instructions" style={{color: '#004B87', textDecoration: 'underline'}}>
          View Full Toolkit Instructions (OFFICIAL)
        </a>
      </div>

      <footer style={styles.footer}>
        <p>OFFICIAL – Version 2, June 2025</p>
      </footer>
    </div>
  );

}

const styles = {
  container: { fontFamily: 'Inter, sans-serif', maxWidth: 520, margin: '40px auto', padding: 24, background: '#F8F9FA', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  header: { color: '#004B87', fontSize: 28, marginBottom: 8, textAlign: 'center' },
  sub: { color: '#495057', fontSize: 16, marginBottom: 8, textAlign: 'center' },
  deadline: { color: '#E76F51', fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  input: { padding: 12, border: '1px solid #E9ECEF', borderRadius: 8, fontSize: 14 },
  button: { background: '#004B87', color: 'white', padding: 14, border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', marginTop: 16 },
  error: { color: '#E76F51', fontSize: 12 },
  success: { textAlign: 'center', padding: 40, background: '#F8F9FA', borderRadius: 12, margin: '40px auto', maxWidth: 520 },
  footer: { textAlign: 'center', marginTop: 40, color: '#6C757D', fontSize: 12 }
};

export default App;
