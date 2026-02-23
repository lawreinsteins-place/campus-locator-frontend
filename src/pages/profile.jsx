import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [privacy, setPrivacy] = useState(user?.privacySetting || 'public');
  const [status, setStatus] = useState(user?.status || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const updatePrivacy = async (newPrivacy) => {
    setLoading(true);
    try {
      await api.put('/users/privacy', { privacySetting: newPrivacy });
      setPrivacy(newPrivacy);
      showMessage('✅ Privacy setting updated!');
    } catch (error) {
      showMessage('Failed to update privacy');
    }
    setLoading(false);
  };

  const updateStatus = async () => {
    setLoading(true);
    try {
      await api.put('/users/status', { status });
      showMessage('✅ Status updated!');
    } catch (error) {
      showMessage('Failed to update status');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const privacyOptions = [
    {
      value: 'public',
      label: '🌍 Public',
      description: 'Everyone can see your location',
      color: '#4CAF50',
    },
    {
      value: 'friends',
      label: '👥 Friends Only',
      description: 'Only your friends can see you',
      color: '#667eea',
    },
    {
      value: 'invisible',
      label: '👻 Invisible',
      description: 'No one can see your location',
      color: '#9e9e9e',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Back to Map
        </button>
        <h1 style={styles.title}>👤 Profile</h1>
      </div>

      {/* Toast */}
      {message && <div style={styles.toast}>{message}</div>}

      <div style={styles.content}>

        {/* Profile Card */}
        <div style={styles.card}>
          <div style={styles.avatarLarge}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={styles.userName}>{user?.name}</h2>
          <p style={styles.userEmail}>{user?.email}</p>
          <div style={styles.joinedBadge}>
            🎓 Campus Locator Member
          </div>
        </div>

        {/* Status Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>💬 My Status</h3>
          <p style={styles.cardSubtitle}>
            Let friends know what you're up to
          </p>
          <div style={styles.statusRow}>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="e.g. Studying for exams, At lunch, Free to hang!"
              style={styles.statusInput}
              maxLength={100}
            />
            <button
              onClick={updateStatus}
              disabled={loading}
              style={styles.saveBtn}
            >
              Save
            </button>
          </div>
          <p style={styles.charCount}>{status.length}/100</p>

          {/* Quick status options */}
          <div style={styles.quickStatuses}>
            {['📚 Studying', '🍽️ At lunch', '☕ Coffee break',
              '🏃 Heading out', '💤 Resting', '🆓 Free to hang!'].map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={styles.quickBtn}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🔒 Privacy Settings</h3>
          <p style={styles.cardSubtitle}>
            Control who can see your location on the map
          </p>

          <div style={styles.privacyOptions}>
            {privacyOptions.map(option => (
              <div
                key={option.value}
                onClick={() => updatePrivacy(option.value)}
                style={{
                  ...styles.privacyOption,
                  border: privacy === option.value
                    ? `2px solid ${option.color}`
                    : '2px solid #e0e0e0',
                  background: privacy === option.value
                    ? `${option.color}11`
                    : 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <div style={styles.privacyLeft}>
                  <span style={styles.privacyLabel}>{option.label}</span>
                  <span style={styles.privacyDesc}>{option.description}</span>
                </div>
                <div style={{
                  ...styles.privacyRadio,
                  background: privacy === option.value ? option.color : 'white',
                  border: `2px solid ${privacy === option.value ? option.color : '#ccc'}`,
                }}>
                  {privacy === option.value && (
                    <div style={styles.privacyRadioDot} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📊 My Stats</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>🟢</span>
              <span style={styles.statLabel}>Online Now</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>
                {privacy === 'public' ? '🌍' :
                 privacy === 'friends' ? '👥' : '👻'}
              </span>
              <span style={styles.statLabel}>{privacy} mode</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>📍</span>
              <span style={styles.statLabel}>Location sharing</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={styles.dangerCard}>
          <h3 style={styles.cardTitle}>⚠️ Account</h3>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
 container: {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
},
header: {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  padding: '1rem 2rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
},
backBtn: {
  padding: '0.6rem 1.2rem',
  background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  color: '#475569',
  fontSize: '0.9rem',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
},
  
  title: {
  margin: 0,
  fontSize: '1.6rem',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: '800',
  letterSpacing: '-0.5px',
},
  toast: {
    position: 'fixed',
    top: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#333',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    zIndex: 9999,
    fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  padding: '2rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
},
  dangerCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #ffebee',
  },
  avatarLarge: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 auto 1rem',
  },
  userName: {
    margin: '0 0 0.25rem',
    textAlign: 'center',
    color: '#333',
    fontSize: '1.4rem',
  },
  userEmail: {
    margin: '0 0 1rem',
    textAlign: 'center',
    color: '#888',
    fontSize: '0.9rem',
  },
  joinedBadge: {
    background: '#f0f4ff',
    color: '#667eea',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    textAlign: 'center',
    width: 'fit-content',
    margin: '0 auto',
  },
  cardTitle: {
    margin: '0 0 0.25rem',
    color: '#333',
    fontSize: '1.05rem',
  },
  cardSubtitle: {
    margin: '0 0 1rem',
    color: '#888',
    fontSize: '0.85rem',
  },
  statusRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  statusInput: {
    flex: 1,
    padding: '0.75rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
  },
  saveBtn: {
    padding: '0.75rem 1.25rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  charCount: {
    margin: '0.25rem 0 1rem',
    color: '#bbb',
    fontSize: '0.75rem',
    textAlign: 'right',
  },
  quickStatuses: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  quickBtn: {
    padding: '0.4rem 0.8rem',
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: '#555',
  },
  privacyOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  privacyOption: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '10px',
    transition: 'all 0.2s',
  },
  privacyLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  privacyLabel: {
    fontWeight: '600',
    color: '#333',
    fontSize: '0.95rem',
  },
  privacyDesc: {
    color: '#888',
    fontSize: '0.8rem',
  },
  privacyRadio: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  privacyRadioDot: {
    width: '8px',
    height: '8px',
    background: 'white',
    borderRadius: '50%',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: '#f8f9ff',
    borderRadius: '10px',
  },
  statNumber: {
    fontSize: '1.8rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
    textAlign: 'center',
  },
  logoutBtn: {
    width: '100%',
    padding: '0.75rem',
    background: '#ffebee',
    color: '#f44336',
    border: '1px solid #ffcdd2',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
};

export default Profile;