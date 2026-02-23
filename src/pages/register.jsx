import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(name, email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Campus Locator</h1>
        <h2 style={styles.subtitle}>Create Account</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
              placeholder="John Doe"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="your.email@university.edu"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    padding: '3rem',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '440px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: '1.6rem',
    textAlign: 'center',
    marginBottom: '2.5rem',
    color: '#475569',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '0.9rem 1.2rem',
    fontSize: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  button: {
    padding: '1rem',
    fontSize: '1.05rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '1rem',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
  },
  error: {
    padding: '1rem',
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '500',
    border: '1px solid #fecaca',
  },
  footer: {
    textAlign: 'center',
    marginTop: '2rem',
    color: '#64748b',
    fontSize: '0.95rem',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '700',
  },
};

export default Register;