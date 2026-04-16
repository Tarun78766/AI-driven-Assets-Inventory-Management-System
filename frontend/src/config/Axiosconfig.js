// ═══════════════════════════════════════════
// FRONTEND - Axios Interceptor Setup
// File: src/config/axiosConfig.js
// Handles 401 errors and auto-logout
// ═══════════════════════════════════════════

import axios from 'axios';

// API base URL
const BASE_URL = import.meta.env.VITE_API_URL|| 'http://localhost:5000/api/';

// Set base URL for all axios requests
axios.defaults.baseURL = BASE_URL;

// Request interceptor - adds token to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles 401 errors globally
axios.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // Check if error is 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      
      // Redirect to login
      window.location.href = '/login';
      
      // Show error message (if toast system exists)
      if (window.showToast) {
        window.showToast('Session expired. Please login again.', 'error');
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;