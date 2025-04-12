import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true  // Important for handling cookies
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.get(`${API_URL}/refresh`, { 
          withCredentials: true 
        });
        
        if (response.data.accessToken) {
          localStorage.setItem('token', response.data.accessToken);
          apiClient.defaults.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear invalid tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    let errorMessage = 'An error occurred';
    if (error.response) {
      errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
    } else if (error.request) {
      errorMessage = 'Network error - please check your connection';
    }
    
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default apiClient;
