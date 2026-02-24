import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CampusMap from '../components/CampusMap';
import { campusLocations } from '../utils/campusLocations';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socket';

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [status, setStatus] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch online users every 30 seconds
  useEffect(() => {
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      const response = await api.get('/users/online');
      setOnlineUsers(response.data.users || []);
    } catch (error) {
      console.log('Could not fetch online users');
    }
  };
  

// Socket listeners - ADD THIS RIGHT HERE
useEffect(() => {
  if (!user) return; // Don't set up listeners if no user

  const handleCheckIn = (data) => {
    console.log('👤 User checked in:', data.user.name);
    setMessage(`📍 ${data.user.name} checked in at ${data.user.currentLocation.name}`);
    setTimeout(() => setMessage(''), 3000);
    fetchOnlineUsers();
  };

  const handleCheckOut = () => {
    fetchOnlineUsers();
  };

  const handleStatusUpdate = () => {
    fetchOnlineUsers();
  };

  const handlePrivacyUpdate = () => {
    fetchOnlineUsers();
  };

  const handleFriendRequest = (data) => {
    if (data.to === user.id) {
      setMessage(`👥 ${data.from.name} sent you a friend request!`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleFriendAccepted = (data) => {
    if (data.to === user.id) {
      setMessage(`✅ ${data.from.name} accepted your friend request!`);
      setTimeout(() => setMessage(''), 4000);
      fetchOnlineUsers();
    }
  };

  // Set up listeners
  socketService.on('user-checkin', handleCheckIn);
  socketService.on('user-checkout', handleCheckOut);
  socketService.on('status-update', handleStatusUpdate);
  socketService.on('privacy-update', handlePrivacyUpdate);
  socketService.on('friend-request', handleFriendRequest);
  socketService.on('friend-accepted', handleFriendAccepted);

  // Cleanup
  return () => {
    socketService.off('user-checkin');
    socketService.off('user-checkout');
    socketService.off('status-update');
    socketService.off('privacy-update');
    socketService.off('friend-request');
    socketService.off('friend-accepted');
  };
}, [user]); // Only re-run when user changes
  /*
// Real-time socket updates
useEffect(() => {
  // Listen for user check-ins
  socketService.on('user-checkin', (data) => {
    console.log('👤 User checked in:', data.user.name);
    setMessage(`📍 ${data.user.name} checked in at ${data.user.currentLocation.name}`);
    setTimeout(() => setMessage(''), 3000);
    fetchOnlineUsers();
  });
  

  // Listen for user check-outs
  socketService.on('user-checkout', (data) => {
    console.log('👤 User checked out:', data.userId);
    fetchOnlineUsers();
  });

  // Listen for status updates
  socketService.on('status-update', (data) => {
    console.log('💬 Status updated:', data);
    fetchOnlineUsers();
  });

  // Listen for friend requests
  socketService.on('friend-request', (data) => {
    if (data.to === user?.id) {
      setMessage(`👥 ${data.from.name} sent you a friend request!`);
      setTimeout(() => setMessage(''), 4000);
    }
  });
  // Real-time socket updates
useEffect(() => {
  // Listen for user check-ins
  socketService.on('user-checkin', (data) => {
    console.log('👤 User checked in:', data.user.name);
    setMessage(`📍 ${data.user.name} checked in at ${data.user.currentLocation.name}`);
    setTimeout(() => setMessage(''), 3000);
    fetchOnlineUsers(); // This refreshes the count
  });

  // Listen for user check-outs
  socketService.on('user-checkout', (data) => {
    console.log('👤 User checked out:', data.userId);
    fetchOnlineUsers(); // This refreshes the count
  });

  // Listen for status updates
  socketService.on('status-update', (data) => {
    console.log('💬 Status updated:', data);
    fetchOnlineUsers(); // This refreshes the count
  });
  
  // ADD THIS NEW LISTENER for privacy changes
  socketService.on('privacy-update', (data) => {
    console.log('🔒 Privacy updated:', data);
    fetchOnlineUsers(); // Refresh when someone changes privacy
  });

  // Listen for friend requests
  socketService.on('friend-request', (data) => {
    if (data.to === user?.id) {
      setMessage(`👥 ${data.from.name} sent you a friend request!`);
      setTimeout(() => setMessage(''), 4000);
    }
  });

  // Listen for friend acceptances
  socketService.on('friend-accepted', (data) => {
    if (data.to === user?.id) {
      setMessage(`✅ ${data.from.name} accepted your friend request!`);
      setTimeout(() => setMessage(''), 4000);
      fetchOnlineUsers(); // Refresh to see new friend's location
    }
  });

  // Cleanup on unmount
  return () => {
    socketService.off('user-checkin');
    socketService.off('user-checkout');
    socketService.off('status-update');
    socketService.off('privacy-update');
    socketService.off('friend-request');
    socketService.off('friend-accepted');
  };
}, [user]);

  // Listen for friend acceptances
  socketService.on('friend-accepted', (data) => {
    if (data.to === user?.id) {
      setMessage(`✅ ${data.from.name} accepted your friend request!`);
      setTimeout(() => setMessage(''), 4000);
    }
  });

  // Cleanup on unmount
  return () => {
    socketService.off('user-checkin');
    socketService.off('user-checkout');
    socketService.off('status-update');
    socketService.off('friend-request');
    socketService.off('friend-accepted');
  };
}, [user]); */
  const handleLocationSelect = (location) => {
    setSelectedLocation(location.id.toString());
    setShowCheckIn(true);
  };

  const handleCheckIn = async () => {
    if (!selectedLocation) {
      setMessage('Please select a location!');
      return;
    }

    setLoading(true);
    try {
      const location = campusLocations.find(l => l.id.toString() === selectedLocation);
      await api.post('/checkin', {
        locationId: location.id,
        locationName: location.name,
        coordinates: location.coordinates,
        status: status,
      });

      setIsCheckedIn(true);
      setShowCheckIn(false);
      setMessage(`✅ Checked in at ${location.name}!`);
      fetchOnlineUsers();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to check in. Try again!');
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await api.put('/checkout');
      setIsCheckedIn(false);
      setStatus('');
      setSelectedLocation('');
      setMessage('👋 Checked out successfully!');
      fetchOnlineUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to check out. Try again!');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📍 Campus Locator</h1>
        <div style={styles.headerRight}>
          <span style={styles.welcome}>Welcome, {user?.name}!</span>
          <span style={styles.onlineCount}>
            🟢 {onlineUsers.length} online
          </span>
          <button onClick={() => navigate('/friends')} style={styles.friendsBtn}>
  👥 Friends
</button>
<button onClick={() => navigate('/profile')} style={styles.profileBtn}>
  👤 Profile
</button>
          {isCheckedIn ? (
            <button onClick={handleCheckOut} style={styles.checkOutBtn} disabled={loading}>
              {loading ? 'Loading...' : '🚪 Check Out'}
            </button>
          ) : (
            <button onClick={() => setShowCheckIn(true)} style={styles.checkInBtn} disabled={loading}>
              {loading ? 'Loading...' : '📍 Check In'}
            </button>
          )}
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div style={styles.toast}>{message}</div>
      )}

      {/* Check In Modal */}
      {showCheckIn && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>📍 Where are you?</h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={styles.select}
              >
                <option value="">-- Choose a location --</option>
                {campusLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.icon} {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Status (optional)</label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="What are you doing? (e.g., Studying for exams)"
                style={styles.input}
                maxLength={100}
              />
            </div>

            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowCheckIn(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
  onClick={handleCheckIn}
  style={styles.confirmBtn}
  disabled={loading || !selectedLocation}
>
  {loading ? 'Checking in...' : '✅ Check In'}
</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.content}>
        {/* Map */}
        <div style={styles.mapContainer}>
          <CampusMap
            onlineUsers={onlineUsers}
            currentUser={user}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>🟢 Online Now ({onlineUsers.length})</h3>

          {onlineUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No one is online yet.</p>
              <p>Check in to be the first!</p>
            </div>
          ) : (
            <div style={styles.userList}>
              {onlineUsers.map(u => (
                <div key={u.id} style={styles.userCard}>
                  <div style={styles.userAvatar}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.userInfo}>
                    <strong style={styles.userName}>
                      {u.id === user?.id ? `${u.name} (You)` : u.name}
                    </strong>
                    <span style={styles.userLocation}>
                      📍 {u.currentLocation?.name || 'Unknown'}
                    </span>
                    {u.status && (
                      <span style={styles.userStatus}>
                        💬 {u.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    overflow: 'hidden',
  },
  header: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
    zIndex: 1000,
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
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  welcome: {
    fontSize: '0.95rem',
    color: '#334155',
    fontWeight: '500',
  },
  onlineCount: {
    fontSize: '0.85rem',
    color: '#10b981',
    fontWeight: '700',
    background: '#d1fae5',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  friendsBtn: {
    padding: '0.6rem 1.2rem',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.3s ease',
  },
  profileBtn: {
    padding: '0.6rem 1.2rem',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.3s ease',
  },
  checkInBtn: {
    padding: '0.6rem 1.2rem',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.3s ease',
  },
  checkOutBtn: {
    padding: '0.6rem 1.2rem',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
    transition: 'all 0.3s ease',
  },
  logoutBtn: {
    padding: '0.6rem 1.2rem',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
    transition: 'all 0.3s ease',
  },
  toast: {
    position: 'fixed',
    top: '90px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '16px',
    zIndex: 9999,
    fontSize: '0.95rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    background: 'white',
    borderRadius: '24px',
    padding: '2.5rem',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'slideUp 0.3s ease',
  },
  modalTitle: {
    margin: '0 0 1.5rem 0',
    color: '#1e293b',
    fontSize: '1.8rem',
    fontWeight: '700',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.6rem',
    fontWeight: '600',
    color: '#334155',
    fontSize: '0.95rem',
  },
  select: {
    width: '100%',
    padding: '0.9rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    background: 'white',
    outline: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '0.9rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  cancelBtn: {
    flex: 1,
    padding: '0.9rem',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
  },
  confirmBtn: {
    flex: 1,
    padding: '0.9rem',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.3s ease',
  },
  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
    borderRadius: '0',
  },
  sidebar: {
    width: '320px',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.08)',
    overflowY: 'auto',
    padding: '1.5rem',
    zIndex: 2,
  },
  sidebarTitle: {
    margin: '0 0 1.5rem 0',
    color: '#1e293b',
    fontSize: '1.2rem',
    fontWeight: '700',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.8rem',
  },
  emptyState: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '3rem 1rem',
    fontSize: '0.95rem',
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.2rem',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    overflow: 'hidden',
    flex: 1,
  },
  userName: {
    fontSize: '0.95rem',
    color: '#1e293b',
    fontWeight: '600',
  },
  userLocation: {
    fontSize: '0.85rem',
    color: '#667eea',
    fontWeight: '500',
  },
  userStatus: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontStyle: 'italic',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};
export default Home;