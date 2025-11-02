export default function Instructions() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Victorian Rostering Toolkit</h1>
      <h2 style={styles.subtitle}>A Resource for Nurses, Midwives, Unit and Roster Managers</h2>
      <p style={styles.version}>Version 2: in alignment with the Nurses and Midwives (Victorian Public Sector) Single Interest Employer Agreement 2024 – 2028.</p>
      <p style={styles.official}>OFFICIAL</p>

      <h3 style={styles.section}>Introduction</h3>
      <p style={styles.text}>
        Rostering is a leading concern for nurses and midwives across Victoria, and it impacts the ability to maintain ratios, staff wellbeing and retention. Rostering practices and principles have been based on historical customs that have not met the needs of our contemporary workforce. This leads to decreased workforce availability, absenteeism, and casualisation.
      </p>
      <p style={styles.text}>
        Rosters are a key component in staff satisfaction and retention, and rostering staff is one of the most complex and important management functions. Rosters need to ensure sufficient and suitably skilled personnel are allocated to deliver high quality and safe patient care and appropriately meet anticipated service demands. They must also comply with relevant regulatory frameworks, including industrial agreements and legislation relating to fatigue management, fairness and equity.
      </p>
      <p style={styles.text}>
        By exploring and understanding the rostering preferences of nurses, midwives, unit and roster managers, we have developed a set of employee-centred rostering principles that are both acceptable and feasible, guided by experiences, perceptions and satisfaction with current rostering principles.
      </p>
      <p style={styles.text}>
        In early 2025 Version 2 of the toolkit was developed to ensure alignment with the <strong>Nurses and Midwives (Victorian Public Sector) Single Interest Employer Agreement 2024 – 2028 (EBA)</strong>.
      </p>

      <h3 style={styles.section}>Purpose</h3>
      <p style={styles.text}>
        This toolkit was produced as part of the Developing Nurse and Midwife Centred Rostering Principles project 2022-23. Its purpose is to provide organisations with a toolkit for developing their own local rostering guidelines. It provides a consistent approach to best practice rostering guidelines, uses valuable rostering resources and addresses the EBA.
      </p>
      <p style={styles.text}>
        <strong>Through this project, it was clear that not one size will fit or is preferred by all nurses and midwives.</strong> This means it is important for rostering practices, policies, and procedures to be continuously monitored, evaluated, and improved.
      </p>

      <h3 style={styles.section}>How to Use This App</h3>
      <ol style={styles.list}>
        <li><strong>Staff:</strong> Go to <code>/</code> → Fill profile → Submit by <strong>12 Nov 2025</strong></li>
        <li><strong>NUM:</strong> Go to <code>/num</code> → Click <strong>Run App.4 Audit</strong></li>
        <li><strong>Result:</strong> See 14-day roster + Y/N audit</li>
        <li><strong>Export:</strong> Click <strong>Export PDF</strong> → Get OFFICIAL Appendix 4</li>
      </ol>

      <footer style={styles.footer}>
        <p>Authorised and published by the Victorian Government, 1 Treasury Place, Melbourne.</p>
        <p>© State of Victoria, Australia, December 2023</p>
        <p>Available at www.safercare.vic.gov.au</p>
        <p style={styles.official}>OFFICIAL</p>
      </footer>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'Inter, sans-serif', maxWidth: 800, margin: '40px auto', padding: 32, background: 'white', lineHeight: 1.6 },
  title: { color: '#004B87', fontSize: 32, textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#004B87', fontSize: 20, textAlign: 'center', marginBottom: 16 },
  version: { textAlign: 'center', color: '#495057', fontSize: 14, marginBottom: 24 },
  official: { textAlign: 'center', color: '#6C757D', fontWeight: 'bold', margin: '32px 0' },
  section: { color: '#004B87', marginTop: 32, fontSize: 18 },
  text: { marginBottom: 16, color: '#212529' },
  list: { paddingLeft: 24, marginBottom: 24 },
  footer: { marginTop: 64, textAlign: 'center', color: '#6C757D', fontSize: 12, borderTop: '1px solid #E9ECEF', paddingTop: 16 }
};