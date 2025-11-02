import { Link } from 'react-router-dom';

const sectionAnchor = id => ({ id, style: { scrollMarginTop: 96 } });

export default function Instructions() {
  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.navLink}>Staff Profile</Link>
        <Link to="/num" style={styles.navLink}>NUM Dashboard</Link>
        <Link to="/instructions" style={styles.navLinkActive}>Instructions</Link>
      </nav>

      <div style={styles.cover}>
        <p style={styles.date}>June 2025</p>
        <h1 style={styles.title}>Victorian Rostering Toolkit</h1>
        <h2 style={styles.subtitle}>A Resource for Nurses, Midwives, Unit and Roster Managers</h2>
        <p style={styles.version}>
          Version 2: in alignment with the Nurses and Midwives (Victorian Public Sector) Single Interest Employer Agreement 2024 – 2028.
        </p>
        <p style={styles.official}>OFFICIAL</p>
      </div>

      <h3 style={styles.section} {...sectionAnchor('contents')}>Contents</h3>
      <table style={styles.toc}>
        <tbody>
          <tr><td><a href="#introduction" style={styles.link}>Introduction</a></td><td style={styles.pageNum}>p.1</td></tr>
          <tr><td><a href="#purpose" style={styles.link}>Purpose</a></td><td style={styles.pageNum}>p.2</td></tr>
          <tr><td><a href="#roles" style={styles.link}>Roles & Responsibilities</a></td><td style={styles.pageNum}>p.3</td></tr>
          <tr><td><a href="#four-fs" style={styles.link}>Employee-centred Rostering Principles (Four Fs)</a></td><td style={styles.pageNum}>p.4–9</td></tr>
          <tr><td><a href="#governance" style={styles.link}>Roster Governance & Fairness</a></td><td style={styles.pageNum}>p.7–10</td></tr>
          <tr><td><a href="#fatigue" style={styles.link}>Fatigue Management</a></td><td style={styles.pageNum}>p.9–10</td></tr>
          <tr><td><a href="#calendar" style={styles.link}>High Demand Leave Calendar</a></td><td style={styles.pageNum}>p.10–11</td></tr>
          <tr><td><a href="#appendices" style={styles.link}>Appendices</a></td><td style={styles.pageNum}>p.21–24</td></tr>
          <tr><td><a href="#references" style={styles.link}>References & Downloads</a></td><td style={styles.pageNum}>p.20</td></tr>
        </tbody>
      </table>

      <h3 style={styles.section} {...sectionAnchor('introduction')}>Introduction</h3>
      <p style={styles.text}>
        Rostering is a leading concern for nurses and midwives across Victoria. Poor rostering impacts safe staffing ratios, fatigue, retention and wellbeing.
        Historical practices have not kept pace with contemporary workforce needs, creating avoidable vacancies, absenteeism and casualisation.
      </p>
      <p style={styles.text}>
        Rosters are a core management function. They must align the right capability to forecast demand, comply with the Safe Patient Care Act, enterprise agreements and occupational health and safety legislation, while supporting the lived experience of nurses and midwives.
      </p>
      <p style={styles.text}>
        This toolkit translates the Safer Care Victoria (SCV) employee-centred rostering principles into an operational playbook for Nurse Unit Managers (NUMs), roster portfolio holders and workforce leads.
        The Four Fs—Foundations, Flexibility, Fairness and Fatigue—provide the structure for every policy, process and digital workflow within VIC Roster AI.
      </p>

      <h3 style={styles.section} {...sectionAnchor('purpose')}>Purpose</h3>
      <p style={styles.text}>
        Developed through the Developing Nurse and Midwife Centred Rostering Principles project (2022–23), the toolkit gives organisations a repeatable method to co-design local rostering guidelines, audit compliance and continuously improve.
        The Version 2 update (early 2025) brings the content into alignment with the <strong>Nurses and Midwives (Victorian Public Sector) Single Interest Employer Agreement 2024 – 2028</strong>.
      </p>
      <p style={styles.text}>
        <strong>No single roster pattern suits every ward, person or life stage.</strong> Ongoing consultation, metrics and review are expected, not optional.
      </p>

      <h3 style={styles.section} {...sectionAnchor('roles')}>Roles & Responsibilities</h3>
      <div style={styles.columns}>
        <div style={styles.column}>
          <h4 style={styles.subheading}>Divisional Manager</h4>
          <ul style={styles.bullets}>
            <li>Maintains staffing profiles within budget and ensures guideline adoption across wards.</li>
            <li>Escalates structural workforce risks, approves mitigation and supports NUM capability uplift.</li>
          </ul>

          <h4 style={styles.subheading}>Nurse Unit Manager (NUM)</h4>
          <ul style={styles.bullets}>
            <li>Publishes 28-day rosters at least 28 days in advance in line with the Nursing Roster Alignment timeline.</li>
            <li>Ensures Health-e Workforce Solutions (HWS) staffing profiles, Safe Patient Care Act ratios and relevant EBAs are met.</li>
            <li>Owns leave management, supplementary rosters and final approval of swap/leave decisions.</li>
          </ul>
        </div>
        <div style={styles.column}>
          <h4 style={styles.subheading}>Roster Portfolio Holder</h4>
          <ul style={styles.bullets}>
            <li>Builds the roster day-to-day, applying the Four Fs, approved flexible work arrangements and local skill mix settings.</li>
            <li>Publishes supplementary rosters, records deficits/surpluses in HWS and documents decision making.</li>
          </ul>

          <h4 style={styles.subheading}>Nurses & Midwives</h4>
          <ul style={styles.bullets}>
            <li>Provide accurate availability, requests and preferences, and monitor ADO and leave balances.</li>
            <li>Participate in supplementary rosters, shift swaps and redeployments consistent with policy.</li>
            <li>Exercise the Right to Disconnect outside agreed working time unless clinical escalation criteria are met.</li>
          </ul>
        </div>
      </div>

      <h3 style={styles.section} {...sectionAnchor('four-fs')}>Employee-centred Rostering Principles (Four Fs)</h3>
      <section style={styles.block}>
        <h4 style={styles.subheading}>Foundations</h4>
        <ul style={styles.bullets}>
          <li>Achieve the approved skill mix across every shift, accounting for experience, specialty training and gender mix requirements.</li>
          <li>Roster to contracted EFT. Late changes, overtime and supplementary staff are escalation steps, not routine practice.</li>
          <li>Publish ward rosters on a 10-week alignment cycle to support supplementary pool release and seasonal leave planning.</li>
          <li>Induct all bank, pool and agency staff to local procedures before deployment.</li>
        </ul>
      </section>

      <section style={styles.block}>
        <h4 style={styles.subheading}>Flexibility</h4>
        <ul style={styles.bullets}>
          <li>Process Flexible Working Arrangements (FWAs) in line with Austin Health policy, recording agreed parameters in VIC Roster AI.</li>
          <li>Support single shift adjustments (start/finish tweaks, mid-shift absences) when safe, transparent and EBA-compliant.</li>
          <li>Maintain a documented request system—two requests and two preferences per fortnight for this pilot—visible to all staff.</li>
          <li>Enable shift swaps with clear eligibility, approvals and escalation. Pilot shift swaps do not attract the Change of Shift allowance.</li>
        </ul>
      </section>

      <section style={styles.block}>
        <h4 style={styles.subheading}>Fairness</h4>
        <ul style={styles.bullets}>
          <li>Publish request windows, lock-out dates and roster release dates together. Rosters kept &gt;=7 years incl. daily staffing sheets.</li>
          <li>Rotate nights, weekends and other high-demand shifts equitably. VIC Roster AI surfaces weekend counts and rest breaches per nurse.</li>
          <li>Document decisions when requests cannot be met and communicate alternative options early.</li>
          <li>During high-demand leave periods (below), apply transparent selection criteria referencing historic leave approvals.</li>
        </ul>
      </section>

      <section style={styles.block}>
        <h4 style={styles.subheading}>Fatigue</h4>
        <ul style={styles.bullets}>
          <li>Prefer forward-rotating patterns (D → E → N). Avoid consecutive late/earlies and multiple short changeovers.</li>
          <li>Cap consecutive shifts: six × 8h, five × 10h or four × 12h (excluding voluntary overtime). VIC Roster AI flags breaches in dashboard.</li>
          <li>Roster ≥2 consecutive days off for EFT ≥0.8 unless otherwise requested. Provide two full nights off after a night block.</li>
          <li>Trigger risk assessment when overtime, on-call load or extended hours exceed WorkSafe thresholds. Record mitigations.</li>
        </ul>
      </section>

      <h3 style={styles.section} {...sectionAnchor('governance')}>Roster Governance & Fairness Controls</h3>
      <div style={styles.block}>
        <h4 style={styles.subheading}>Publication & Documentation</h4>
        <ul style={styles.bullets}>
          <li>28-day publication deadline. Any shift worked with less than 28 days notice attracts a Change of Roster allowance.</li>
          <li>Upload roster artefacts (final roster, change log, fatigue assessments) to the ward share drive for seven-year retention.</li>
        </ul>

        <h4 style={styles.subheading}>Supplementary Rosters</h4>
        <ul style={styles.bullets}>
          <li>Make supplementary availability visible at the time of publication. Allocate additional shifts using an equitable queue.</li>
          <li>Enter deficits/surpluses into HWS at publication and update promptly when changes occur.</li>
        </ul>

        <h4 style={styles.subheading}>Shift Swap Process (Appendix 2)</h4>
        <ol style={styles.numbered}>
          <li>Staff member identifies a suitable colleague (same skill mix) and agrees swap terms.</li>
          <li>Submit swap request via VIC Roster AI with both parties acknowledged.</li>
          <li>Roster portfolio holder reviews safety impacts (skill mix, fatigue, leave limits) and approves/declines.</li>
          <li>NUM signs off final swap. Denied swaps receive a recorded rationale.</li>
        </ol>
      </div>

      <h3 style={styles.section} {...sectionAnchor('fatigue')}>Fatigue Management & Sleep Hygiene</h3>
      <div style={styles.block}>
        <h4 style={styles.subheading}>Roster Design Safeguards</h4>
        <ul style={styles.bullets}>
          <li>Flag roster patterns with &lt;10 hours between shifts, more than three consecutive nights, or &gt;56 hours worked in seven days.</li>
          <li>Use VIC Roster AI fatigue dashboard to record mitigations (e.g., targeted days off, alternative staffing options).</li>
        </ul>
        <h4 style={styles.subheading}>Sleep Hygiene Tips (Appendix 1)</h4>
        <ul style={styles.bullets}>
          <li>Create a pre-sleep routine, minimise caffeine four hours before rest and darken rooms during daytime sleep.</li>
          <li>Maintain hydration and balanced nutrition across night duty blocks.</li>
          <li>Encourage staff to plan transport for late finishes to reduce fatigue-related driving risk.</li>
        </ul>
      </div>

      <h3 style={styles.section} {...sectionAnchor('calendar')}>High Demand Leave Calendar (Austin Health)</h3>
      <table style={styles.calendar}>
        <thead>
          <tr>
            <th style={styles.calendarHead}>Period</th>
            <th style={styles.calendarHead}>High Demand Starts</th>
            <th style={styles.calendarHead}>High Demand Ends</th>
            <th style={styles.calendarHead}>Lead Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={styles.calendarCell}>Christmas / Boxing Day / New Year</td>
            <td style={styles.calendarCell}>Monday of the week prior to Christmas</td>
            <td style={styles.calendarCell}>First Sunday after New Year’s Day</td>
            <td style={styles.calendarCell}>Request ≥16 weeks prior</td>
          </tr>
          <tr>
            <td style={styles.calendarCell}>Summer School Holidays</td>
            <td style={styles.calendarCell}>Monday of first week before Christmas</td>
            <td style={styles.calendarCell}>Second Monday in February</td>
            <td style={styles.calendarCell}>Request ≥16 weeks prior</td>
          </tr>
          <tr>
            <td style={styles.calendarCell}>Easter</td>
            <td style={styles.calendarCell}>Monday of week prior to Good Friday</td>
            <td style={styles.calendarCell}>Sunday after Easter Monday</td>
            <td style={styles.calendarCell}>Request ≥16 weeks prior</td>
          </tr>
          <tr>
            <td style={styles.calendarCell}>Term 1 School Holidays</td>
            <td style={styles.calendarCell}>First Monday of gazetted period</td>
            <td style={styles.calendarCell}>Final Sunday of gazetted period</td>
            <td style={styles.calendarCell}>Request ≥16 weeks prior</td>
          </tr>
          <tr>
            <td style={styles.calendarCell}>Term 2 School Holidays</td>
            <td style={styles.calendarCell}>First Monday of gazetted period</td>
            <td style={styles.calendarCell}>Final Sunday of gazetted period</td>
            <td style={styles.calendarCell}>Request ≥16 weeks prior</td>
          </tr>
          <tr>
            <td style={styles.calendarCell}>Term 3 School Holidays</td>
            <td style={styles.calendarCell}>First Monday of gazetted period</td>
            <td style={styles.calendarCell}>Final Sunday of gazetted period</td>
            <td style={styles.calendarCell}>Request ≥16 weeks prior</td>
          </tr>
        </tbody>
      </table>
      <p style={styles.text}>
        Document high-demand leave allocation decisions in VIC Roster AI for audit. Consider previous approvals to distribute opportunities fairly.
      </p>

      <h3 style={styles.section} {...sectionAnchor('appendices')}>Appendices</h3>
      <div style={styles.block}>
        <h4 style={styles.subheading}>Appendix 1 – Sleep Hygiene Tips</h4>
        <p style={styles.textSmall}>Tips for managing alertness, rest environments and nutritional support during shift work.</p>

        <h4 style={styles.subheading}>Appendix 2 – Shift Swap Workflow</h4>
        <p style={styles.textSmall}>Step-by-step process for authorising swaps, including escalation path if no suitable colleague is available.</p>

        <h4 style={styles.subheading}>Appendix 3 – Staff Preference Profile</h4>
        <p style={styles.textSmall}>
          Captured via the VIC Roster AI staff form (this app). Data used for fairness analytics and to minimise manual collection.
        </p>

        <h4 style={styles.subheading}>Appendix 4 – Compliance Audit</h4>
        <p style={styles.textSmall}>
          Produced from the NUM dashboard. Includes fortnight roster, audit trail, fatigue summary and export for seven-year retention.
        </p>
      </div>

      <h3 style={styles.section} {...sectionAnchor('references')}>References & Downloads</h3>
      <ul style={styles.bullets}>
        <li><a href="https://www.safercare.vic.gov.au/practice-improvement/developing-employee-centred-rostering-principles" style={styles.link}>Safer Care Victoria – Developing employee-centred rostering principles</a></li>
        <li><a href="https://www.health.vic.gov.au/" style={styles.link}>Victorian Department of Health – Workforce resources</a></li>
        <li><a href="https://www.legislation.vic.gov.au/in-force/acts/safe-patient-care-nurse-to-patient-and-midwife-to-patient-ratios-act-2015/006" style={styles.link}>Safe Patient Care (Nurse to Patient and Midwife to Patient Ratios) Act 2015</a></li>
        <li><a href="https://www.legislation.gov.au/C2009A00028/latest/text" style={styles.link}>Fair Work Act 2009</a></li>
        <li><a href="https://www.vhba.vic.gov.au/" style={styles.link}>Victorian Hospitals' Industrial Association – Enterprise Agreements</a></li>
        <li><a href="https://www.safercare.vic.gov.au/" style={styles.link}>Safer Care Victoria – Victorian Rostering Toolkit (PDF)</a></li>
        <li><a href="https://www.acorn.org.au/" style={styles.link}>Australian College of Perioperative Nurses (ACORN) Standards</a></li>
      </ul>

      <h3 style={styles.section}>Live Toolkit Shortcuts</h3>
      <ul style={styles.list}>
        <li><Link to="/" style={styles.link}>Staff Preference Profile (Appendix 3)</Link></li>
        <li><Link to="/num" style={styles.link}>NUM Dashboard & Published Roster (Appendix 4)</Link></li>
      </ul>

      <div style={styles.footer}>
        <p>Authorised and published by the Victorian Government, 1 Treasury Place, Melbourne.</p>
        <p>© State of Victoria, Australia, December 2023</p>
        <p>Available at www.safercare.vic.gov.au</p>
        <p style={styles.official}>OFFICIAL</p>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'Inter, sans-serif', maxWidth: 960, margin: '40px auto', padding: 32, background: 'white', lineHeight: 1.6 },
  nav: { display: 'flex', gap: 16, marginBottom: 24, padding: '16px 0', borderBottom: '2px solid #E9ECEF' },
  navLink: { color: '#004B87', textDecoration: 'none', fontWeight: 500, padding: '8px 16px', borderRadius: 4, transition: 'background 0.2s' },
  navLinkActive: { color: 'white', background: '#004B87', textDecoration: 'none', fontWeight: 500, padding: '8px 16px', borderRadius: 4 },
  cover: { textAlign: 'center', marginBottom: 48 },
  date: { color: '#6C757D', fontSize: 14, marginBottom: 24 },
  title: { color: '#004B87', fontSize: 36, margin: '16px 0' },
  subtitle: { color: '#212529', fontSize: 20, margin: '16px 0' },
  version: { color: '#495057', fontSize: 14, margin: '24px 0' },
  official: { fontWeight: 'bold', color: '#6C757D', margin: '32px 0' },
  section: { color: '#004B87', marginTop: 40, fontSize: 20, borderBottom: '2px solid #004B87', paddingBottom: 8 },
  subheading: { color: '#004B87', marginTop: 24, marginBottom: 8, fontSize: 16 },
  text: { marginBottom: 16, color: '#212529' },
  textSmall: { marginBottom: 12, color: '#434A54' },
  toc: { width: '100%', marginBottom: 32, borderCollapse: 'collapse' },
  pageNum: { textAlign: 'right', color: '#6C757D' },
  list: { paddingLeft: 24, marginBottom: 24 },
  link: { color: '#004B87', textDecoration: 'underline' },
  columns: { display: 'flex', gap: 32, flexWrap: 'wrap' },
  column: { flex: '1 1 280px' },
  block: { marginTop: 16 },
  bullets: { paddingLeft: 24, marginBottom: 16 },
  numbered: { paddingLeft: 24, marginBottom: 16 },
  calendar: { width: '100%', borderCollapse: 'collapse', marginTop: 16, marginBottom: 16 },
  calendarHead: { background: '#004B87', color: 'white', padding: 12, border: '1px solid #DEE2E6', textAlign: 'left', fontWeight: 600 },
  calendarCell: { padding: 12, border: '1px solid #DEE2E6', verticalAlign: 'top', background: '#FAFBFC' },
  footer: { marginTop: 80, textAlign: 'center', color: '#6C757D', fontSize: 12, borderTop: '1px solid #E9ECEF', paddingTop: 16 }
};
