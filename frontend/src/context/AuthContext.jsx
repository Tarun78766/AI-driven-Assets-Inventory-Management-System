// ═══════════════════════════════════════════
// FRONTEND - Auth Context
// File: src/context/AuthContext.jsx
// This manages authentication state globally
// ═══════════════════════════════════════════

import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/Axiosconfig';
import { APIRoutes } from "../API/APIRoutes";
import { CheckCircle, AlertCircle } from 'lucide-react';

// Create the context
const AuthContext = createContext(null);



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        
        
        // Verify token is still valid
        verifyToken();
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Verify token with backend
  const verifyToken = async () => {
  try {
    const response = await axios.get(`${APIRoutes.VERIFY}`);

    if (response.data.success) {
      setUser(response.data.user);
    } else {
      logout(false);
    }
  } catch (error) {
    console.error('Token verification failed:', error);

    // 🔥 Only logout if 401
    if (error.response?.status === 401) {
      logout(false);
    }

    setLoading(false);
  } finally {
    setLoading(false);
  }
};

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${APIRoutes.LOGIN}`, {
        email,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data;
        
        // Store in state
        setUser(user);
        setToken(token);
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return { success: true, user };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Logout function
  const logout = async (showMessage = true) => {
    try {
      // Call backend logout endpoint if token exists
      if (token) {
        await axios.post(
          `${APIRoutes.LOGOUT}`,
          {},
          
        );
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with frontend logout even if backend fails
    } finally {
      // Clear state
      setUser(null);
      setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear axios default header
      delete axios.defaults.headers.common['Authorization'];
      
      // Redirect to login
      navigate('/login');
      
      // Show toast notification
      if (showMessage) {
        showToast('Logged out successfully', 'success');
      }
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const cleanData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      department: userData.department,
    };
      const response = await axios.post(`${APIRoutes.REGISTER}`, cleanData);

      if (response.data.success) {
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // Auto logout on token expiry
  useEffect(() => {
    if (!token) return;

    // JWT tokens have 1 day expiry (24 hours = 86400000 ms)
    // Set timeout to auto-logout 1 minute before expiry
    const expiryTime = 86400000 - 60000; // 23 hours 59 minutes

    const timer = setTimeout(() => {
      logout(false);
      showToast('Session expired. Please login again.', 'error');
    }, expiryTime);

    return () => clearTimeout(timer);
  }, [token]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    showToast,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {toast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: toast.type === "success" ? "#10b981" : "#f43f5e",
          color: "#ffffff",
          padding: "16px 24px",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          zIndex: 2147483647, // Max reliable z-index
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontWeight: 600,
          fontSize: "15px",
          fontFamily: "'Inter', sans-serif"
        }}>
          {toast.type === "success" ? <CheckCircle size={22} color="#ffffff" /> : <AlertCircle size={22} color="#ffffff" />}
          <span>{toast.message}</span>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;