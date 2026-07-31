import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to request headers if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  // Register new user
  async register(full_name, email, phone, password, confirm_password) {
    try {
      const response = await api.post('/api/auth/register', {
        full_name,
        email,
        phone,
        password,
        confirm_password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await api.post('/api/auth/verify-otp', {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'OTP verification failed' };
    }
  },

  // Resend OTP
  async resendOTP(email) {
    try {
      const response = await api.post('/api/auth/resend-otp', {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to resend OTP' };
    }
  },

  // Login
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      // Store JWT token
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me');
      return response.data.user;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch user' };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get stored user
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Get token
  getToken() {
    return localStorage.getItem('authToken');
  },
};

export default authService;
