/**
 * ErrorModal Component - Display error messages to users
 */

export function ErrorModal({ error, onClose }) {
  if (!error) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>⚠️ Error</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>
        <div style={styles.body}>
          <p style={styles.message}>{error}</p>
        </div>
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.button}>OK</button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ message, type = 'info', onClose }) {
  const bgColor = type === 'error' ? '#F8D7DA' : type === 'success' ? '#D4EDDA' : '#D1ECF1';
  const textColor = type === 'error' ? '#721C24' : type === 'success' ? '#155724' : '#0C5460';
  const borderColor = type === 'error' ? '#F5C6CB' : type === 'success' ? '#C3E6CB' : '#BEE5EB';

  return (
    <div
      style={{
        ...styles.toast,
        background: bgColor,
        color: textColor,
        borderColor,
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          ...styles.toastClose,
          color: textColor,
        }}
      >
        ✕
      </button>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    maxWidth: 400,
    width: '90%',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #E9ECEF',
    background: '#F8F9FA',
  },
  title: {
    margin: 0,
    fontSize: 18,
    color: '#212529',
    fontWeight: 'bold',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    color: '#6C757D',
    padding: 0,
    width: 32,
    height: 32,
  },
  body: {
    padding: '24px',
  },
  message: {
    margin: 0,
    color: '#212529',
    lineHeight: 1.5,
    fontSize: 14,
  },
  footer: {
    display: 'flex',
    gap: 8,
    padding: '16px 24px',
    borderTop: '1px solid #E9ECEF',
    justifyContent: 'flex-end',
    background: '#F8F9FA',
  },
  button: {
    background: '#004B87',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '10px 20px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  toast: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    padding: '16px 20px',
    borderRadius: 8,
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    zIndex: 1001,
    maxWidth: 400,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    fontSize: 14,
  },
  toastClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
};
