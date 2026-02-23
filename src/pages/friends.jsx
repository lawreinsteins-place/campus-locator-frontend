import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import socketService from '../services/socket';

function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  // Search users as you type
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);
// Listen for real-time friend events
useEffect(() => {
  socketService.on('friend-request', (data) => {
    showMessage(`👥 ${data.from.name} sent you a friend request!`);
    fetchRequests(); // Refresh requests list
  });

  socketService.on('friend-accepted', (data) => {
    showMessage(`✅ ${data.from.name} accepted your friend request!`);
    fetchFriends(); // Refresh friends list
    fetchRequests(); // Refresh requests list
  });

  return () => {
    socketService.off('friend-request');
    socketService.off('friend-accepted');
  };
}, []);
  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      setFriends(res.data.friends || []);
    } catch (error) {
      console.log('Error fetching friends');
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/friends/requests');
      setRequests(res.data);
    } catch (error) {
      console.log('Error fetching requests');
    }
  };

  const searchUsers = async () => {
    try {
      const res = await api.get(`/friends/search?query=${searchQuery}`);
      setSearchResults(res.data.users || []);
    } catch (error) {
      console.log('Error searching users');
    }
  };

  const sendRequest = async (userId) => {
    try {
      await api.post('/friends/request', { receiverId: userId });
      showMessage('✅ Friend request sent!');
      searchUsers();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to send request');
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await api.put(`/friends/accept/${requestId}`);
      showMessage('✅ Friend request accepted!');
      fetchFriends();
      fetchRequests();
    } catch (error) {
      showMessage('Failed to accept request');
    }
  };

  const declineRequest = async (requestId) => {
    try {
      await api.put(`/friends/decline/${requestId}`);
      showMessage('Request declined');
      fetchRequests();
    } catch (error) {
      showMessage('Failed to decline request');
    }
  };

  const removeFriend = async (friendId) => {
    if (!window.confirm('Remove this friend?')) return;
    try {
      await api.delete(`/friends/${friendId}`);
      showMessage('Friend removed');
      fetchFriends();
    } catch (error) {
      showMessage('Failed to remove friend');
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const pendingCount = requests.incoming?.length || 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Back to Map
        </button>
        <h1 style={styles.title}>👥 Friends</h1>
      </div>

      {/* Message */}
      {message && <div style={styles.toast}>{message}</div>}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('friends')}
          style={activeTab === 'friends' ? styles.activeTab : styles.tab}
        >
          👥 Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          style={activeTab === 'requests' ? styles.activeTab : styles.tab}
        >
          🔔 Requests {pendingCount > 0 && (
            <span style={styles.badge}>{pendingCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('search')}
          style={activeTab === 'search' ? styles.activeTab : styles.tab}
        >
          🔍 Find Friends
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div>
            {friends.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyIcon}>👥</p>
                <p>No friends yet!</p>
                <p style={styles.emptyHint}>
                  Go to "Find Friends" to add people
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  style={styles.primaryBtn}
                >
                  Find Friends
                </button>
              </div>
            ) : (
              <div style={styles.list}>
                {friends.map(friend => (
                  <div key={friend.id} style={styles.card}>
                    <div style={styles.avatar}>
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.info}>
                      <strong style={styles.name}>{friend.name}</strong>
                      <span style={styles.email}>{friend.email}</span>
                      {friend.isOnline ? (
                        <span style={styles.online}>
                          🟢 Online • 📍 {friend.currentLocation || 'Unknown'}
                        </span>
                      ) : (
                        <span style={styles.offline}>⚫ Offline</span>
                      )}
                      {friend.status && (
                        <span style={styles.status}>💬 {friend.status}</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFriend(friend.id)}
                      style={styles.removeBtn}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <h3 style={styles.sectionTitle}>
              Incoming Requests ({requests.incoming?.length || 0})
            </h3>

            {requests.incoming?.length === 0 ? (
              <p style={styles.emptyText}>No incoming requests</p>
            ) : (
              <div style={styles.list}>
                {requests.incoming?.map(req => (
                  <div key={req.id} style={styles.card}>
                    <div style={styles.avatar}>
                      {req.sender.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.info}>
                      <strong style={styles.name}>{req.sender.name}</strong>
                      <span style={styles.email}>
                        Wants to be your friend
                      </span>
                    </div>
                    <div style={styles.requestBtns}>
                      <button
                        onClick={() => acceptRequest(req.id)}
                        style={styles.acceptBtn}
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => declineRequest(req.id)}
                        style={styles.declineBtn}
                      >
                        ❌ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{...styles.sectionTitle, marginTop: '2rem'}}>
              Sent Requests ({requests.outgoing?.length || 0})
            </h3>

            {requests.outgoing?.length === 0 ? (
              <p style={styles.emptyText}>No outgoing requests</p>
            ) : (
              <div style={styles.list}>
                {requests.outgoing?.map(req => (
                  <div key={req.id} style={styles.card}>
                    <div style={styles.avatar}>
                      {req.receiver.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.info}>
                      <strong style={styles.name}>{req.receiver.name}</strong>
                      <span style={styles.email}>Request pending...</span>
                    </div>
                    <span style={styles.pendingBadge}>Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <div style={styles.searchBox}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search by name or email..."
                style={styles.searchInput}
                autoFocus
              />
            </div>

            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p style={styles.emptyText}>Type at least 2 characters to search</p>
            )}

            {searchResults.length === 0 && searchQuery.length >= 2 && (
              <p style={styles.emptyText}>No users found for "{searchQuery}"</p>
            )}

            <div style={styles.list}>
              {searchResults.map(user => (
                <div key={user.id} style={styles.card}>
                  <div style={styles.avatar}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.info}>
                    <strong style={styles.name}>{user.name}</strong>
                    <span style={styles.email}>{user.email}</span>
                    {user.isOnline && (
                      <span style={styles.online}>
                        🟢 Online • 📍 {user.currentLocation || 'Unknown'}
                      </span>
                    )}
                  </div>
                  <div>
                    {user.isFriend ? (
                      <span style={styles.friendBadge}>✅ Friends</span>
                    ) : user.requestSent ? (
                      <span style={styles.pendingBadge}>⏳ Pending</span>
                    ) : user.requestReceived ? (
                      <button
                        onClick={() => {
                          const req = requests.incoming?.find(
                            r => r.sender.id === user.id
                          );
                          if (req) acceptRequest(req.id);
                        }}
                        style={styles.acceptBtn}
                      >
                        Accept
                      </button>
                    ) : (
                      <button
                        onClick={() => sendRequest(user.id)}
                        style={styles.addBtn}
                      >
                        ➕ Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
  },
  tabs: {
    display: 'flex',
    background: 'white',
    borderBottom: '2px solid #f0f0f0',
    padding: '0 1.5rem',
  },
  tab: {
    padding: '1rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#888',
    fontWeight: '500',
    fontSize: '0.9rem',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
  },
  activeTab: {
    padding: '1rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#667eea',
    fontWeight: '600',
    fontSize: '0.9rem',
    borderBottom: '2px solid #667eea',
    marginBottom: '-2px',
  },
  badge: {
    background: '#f44336',
    color: 'white',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '11px',
    marginLeft: '4px',
  },
  content: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '1.5rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  avatar: {
    width: '48px',
    height: '48px',
    background: '#667eea',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  name: {
    fontSize: '0.95rem',
    color: '#333',
  },
  email: {
    fontSize: '0.8rem',
    color: '#888',
  },
  online: {
    fontSize: '0.78rem',
    color: '#4CAF50',
  },
  offline: {
    fontSize: '0.78rem',
    color: '#999',
  },
  status: {
    fontSize: '0.78rem',
    color: '#667eea',
    fontStyle: 'italic',
  },
  sectionTitle: {
    color: '#333',
    fontSize: '1rem',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #f0f0f0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#888',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyHint: {
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: '1rem',
    fontSize: '0.9rem',
  },
  requestBtns: {
    display: 'flex',
    gap: '0.5rem',
  },
  acceptBtn: {
    padding: '0.4rem 0.8rem',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  declineBtn: {
    padding: '0.4rem 0.8rem',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  addBtn: {
    padding: '0.4rem 0.8rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  removeBtn: {
    padding: '0.4rem 0.8rem',
    background: '#fff',
    color: '#f44336',
    border: '1px solid #f44336',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  primaryBtn: {
    padding: '0.75rem 1.5rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '1rem',
  },
  friendBadge: {
    padding: '0.4rem 0.8rem',
    background: '#e8f5e9',
    color: '#4CAF50',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  pendingBadge: {
    padding: '0.4rem 0.8rem',
    background: '#fff3e0',
    color: '#FF9800',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  searchBox: {
    marginBottom: '1.5rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  
};

export default Friends;