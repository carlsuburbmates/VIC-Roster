import { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function App() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'RN',
    fte: '1.0',
    shiftPref: 'AM',
    maxNDs: '3',
    softLock: '',
    hardLock: '',
    cycle: '27 Nov – 10 Dec',
    requestsQuota: 2,
    preferencesQuota: 2,
    flexibleWork: false,
    swapWilling: true,
    overtimeOptIn: false,
    availabilityNotes: '',
    rightToDisconnectAck: false,
    localInductionComplete: false,
    supplementaryAvailability: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.name) err.name = "Name required";
    if (!form.email || !form.email.includes('@')) err.email = "Valid email required";
    if (!form.role) err.role = "Role required";
    if (!['0.6', '0.8', '1.0'].includes(form.fte)) err.fte = "Invalid FTE";
    if (!['AM', 'PM', 'ND'].includes(form.shiftPref)) err.shiftPref = "Select shift";
    const nd = parseInt(form.maxNDs, 10);
    if (isNaN(nd) || nd < 0 || nd > 3) err.maxNDs = "0–3 only";
    const req = parseInt(form.requestsQuota, 10);
    const pref = parseInt(form.preferencesQuota, 10);
    if (isNaN(req) || req < 0 || req > 4) err.requestsQuota = "0–4 requests";
    if (isNaN(pref) || pref < 0 || pref > 4) err.preferencesQuota = "0–4 preferences";
    if (!form.rightToDisconnectAck) err.rightToDisconnectAck = "You must acknowledge the Right to Disconnect policy.";
    return err;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }
    const payload = {
      ...form,
      requestsQuota: parseInt(form.requestsQuota, 10),
      preferencesQuota: parseInt(form.preferencesQuota, 10),
      maxNDs: form.maxNDs.toString(),
    };
    const res = await fetch('http://localhost:8000/submit-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
      <nav style={styles.nav}>
        <Link to="/" style={styles.navLinkActive}>Staff Profile</Link>
        <Link to="/num" style={styles.navLink}>NUM Dashboard</Link>
        <Link to="/instructions" style={styles.navLink}>Instructions</Link>
      </nav>
      <h1 style={styles.header}>Victorian Rostering Toolkit</h1>
      <h2 style={styles.sub}>Staff Preference Profile (Appendix 3)</h2>
      <p style={styles.deadline}>Submit by <strong>12 Nov 2025</strong></p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Personal Details</h3>
          <input name="name" placeholder="Full Name" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} style={styles.input} />
          {errors.name && <span style={styles.error}>{errors.name}</span>}

          <input name="email" placeholder="Email (unique ID)" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} style={styles.input} />
          {errors.email && <span style={styles.error}>{errors.email}</span>}

          <select name="role" value={form.role}
            onChange={e => setForm({...form, role: e.target.value})} style={styles.input}>
            <option value="ANUM">ANUM</option>
            <option value="CNS">CNS</option>
            <option value="RN">RN</option>
            <option value="EN">EN</option>
            <option value="GNP">GNP</option>
          </select>
          {errors.role && <span style={styles.error}>{errors.role}</span>}
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Roster Preferences</h3>
          <select name="fte" value={form.fte}
            onChange={e => setForm({...form, fte: e.target.value})} style={styles.input}>
            <option value="1.0">1.0 FTE</option>
            <option value="0.8">0.8 FTE</option>
            <option value="0.6">0.6 FTE</option>
          </select>

          <select name="shiftPref" value={form.shiftPref}
            onChange={e => setForm({...form, shiftPref: e.target.value})} style={styles.input}>
            <option value="AM">Prefer AM</option>
            <option value="PM">Prefer PM</option>
            <option value="ND">Prefer ND</option>
          </select>

          <input name="maxNDs" placeholder="Max Night Duties (0–3)" value={form.maxNDs}
            onChange={e => setForm({...form, maxNDs: e.target.value})} style={styles.input} />
          {errors.maxNDs && <span style={styles.error}>{errors.maxNDs}</span>}

          <div style={styles.inlineGroup}>
            <label style={styles.inlineLabel}>
              Requests (pilot limit 0–4)
              <input type="number" min={0} max={4} value={form.requestsQuota}
                onChange={e => setForm({...form, requestsQuota: e.target.value})}
                style={styles.inputMini} />
            </label>
            <label style={styles.inlineLabel}>
              Preferences (pilot limit 0–4)
              <input type="number" min={0} max={4} value={form.preferencesQuota}
                onChange={e => setForm({...form, preferencesQuota: e.target.value})}
                style={styles.inputMini} />
            </label>
          </div>
          {errors.requestsQuota && <span style={styles.error}>{errors.requestsQuota}</span>}
          {errors.preferencesQuota && <span style={styles.error}>{errors.preferencesQuota}</span>}

          <textarea name="availabilityNotes" placeholder="Availability notes, school runs, study, etc."
            value={form.availabilityNotes}
            onChange={e => setForm({...form, availabilityNotes: e.target.value})}
            style={styles.textArea} />
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Locks & Cycle</h3>
          <input name="softLock" placeholder="Soft Lock (e.g. 15 Nov)" value={form.softLock}
            onChange={e => setForm({...form, softLock: e.target.value})} style={styles.input} />

          <input name="hardLock" placeholder="Hard Lock (e.g. 20 Nov)" value={form.hardLock}
            onChange={e => setForm({...form, hardLock: e.target.value})} style={styles.input} />

          <input value={form.cycle} readOnly style={{ ...styles.input, background: '#E9ECEF', fontWeight: 600 }} />
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Working Arrangements</h3>
          <label style={styles.checkbox}>
            <input type="checkbox" checked={form.flexibleWork}
              onChange={e => setForm({...form, flexibleWork: e.target.checked})} />
            Approved flexible working arrangement in place
          </label>

          <label style={styles.checkbox}>
            <input type="checkbox" checked={form.swapWilling}
              onChange={e => setForm({...form, swapWilling: e.target.checked})} />
            Willing to participate in shift swaps
          </label>

          <label style={styles.checkbox}>
            <input type="checkbox" checked={form.overtimeOptIn}
              onChange={e => setForm({...form, overtimeOptIn: e.target.checked})} />
            Opt-in to overtime call-outs when roster shortfalls occur
          </label>

          <label style={styles.checkbox}>
            <input type="checkbox" checked={form.localInductionComplete}
              onChange={e => setForm({...form, localInductionComplete: e.target.checked})} />
            Local area induction completed (Pool/Agency staff)
          </label>

          <textarea name="supplementaryAvailability" placeholder="Supplementary roster availability (dates, shifts)"
            value={form.supplementaryAvailability}
            onChange={e => setForm({...form, supplementaryAvailability: e.target.value})}
            style={styles.textArea} />
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Right to Disconnect</h3>
          <label style={styles.checkbox}>
            <input type="checkbox" checked={form.rightToDisconnectAck}
              onChange={e => setForm({...form, rightToDisconnectAck: e.target.checked})} />
            I acknowledge the Austin Health Right to Disconnect policy.
          </label>
          {errors.rightToDisconnectAck && <span style={styles.error}>{errors.rightToDisconnectAck}</span>}
        </section>

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
  nav: { display: 'flex', gap: 16, marginBottom: 24, padding: '16px 0', borderBottom: '2px solid #E9ECEF' },
  navLink: { color: '#004B87', textDecoration: 'none', fontWeight: 500, padding: '8px 16px', borderRadius: 4, transition: 'background 0.2s' },
  navLinkActive: { color: 'white', background: '#004B87', textDecoration: 'none', fontWeight: 500, padding: '8px 16px', borderRadius: 4 },
  header: { color: '#004B87', fontSize: 28, marginBottom: 8, textAlign: 'center' },
  sub: { color: '#495057', fontSize: 16, marginBottom: 8, textAlign: 'center' },
  deadline: { color: '#E76F51', fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  section: { background: 'white', padding: 16, borderRadius: 10, border: '1px solid #E9ECEF', display: 'flex', flexDirection: 'column', gap: 12 },
  sectionTitle: { fontSize: 16, color: '#004B87', margin: 0 },
  input: { padding: 12, border: '1px solid #E9ECEF', borderRadius: 8, fontSize: 14 },
  textArea: { minHeight: 80, padding: 12, border: '1px solid #E9ECEF', borderRadius: 8, fontSize: 14, resize: 'vertical' },
  checkbox: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, color: '#212529' },
  inlineGroup: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  inlineLabel: { display: 'flex', flexDirection: 'column', fontSize: 13, color: '#495057' },
  inputMini: { padding: 10, border: '1px solid #E9ECEF', borderRadius: 8, fontSize: 14, width: 120 },
  button: { background: '#004B87', color: 'white', padding: 14, border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', marginTop: 16 },
  error: { color: '#E76F51', fontSize: 12 },
  success: { textAlign: 'center', padding: 40, background: '#F8F9FA', borderRadius: 12, margin: '40px auto', maxWidth: 520 },
  footer: { textAlign: 'center', marginTop: 40, color: '#6C757D', fontSize: 12 }
};

export default App;
