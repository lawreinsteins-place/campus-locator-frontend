import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
  try {
    const response = await api.get('/auth/me');
    setUser(response.data.user);
    
    // Connect socket if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }
  } catch (error) {
    console.error('Failed to fetch user:', error);
    localStorage.removeItem('token');
  } finally {
    setLoading(false);
  }
};

 const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    
    // Connect socket after login
    socketService.connect(response.data.token);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Login failed' 
    };
  }
};

  const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    
    // Connect socket after registration
    socketService.connect(response.data.token);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Registration failed' 
    };
  }
};

  const logout = () => {
  localStorage.removeItem('token');
  socketService.disconnect();
  setUser(null);
};

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};