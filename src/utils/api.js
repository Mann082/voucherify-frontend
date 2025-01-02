import axios from 'axios';
import { getToken, removeToken } from './auth-utils';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'https://voucherify-backend.onrender.com'
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors but prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token and notify user but don't redirect
      removeToken();
      toast.error('Session expired. Please refresh the page');
    }

    return Promise.reject(error);
  }
);

export default api;