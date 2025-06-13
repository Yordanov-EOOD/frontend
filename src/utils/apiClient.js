import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000;
const MAX_RETRY_ATTEMPTS = parseInt(process.env.REACT_APP_RETRY_ATTEMPTS) || 3;

// Create enhanced API client with circuit breaker pattern
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Track failed refresh attempts to prevent loops
let failedRefreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;

// Circuit breaker state
let circuitBreakerState = {
  isOpen: false,
  failures: 0,
  lastFailTime: null,
  timeout: 60000 // 1 minute
};

// Generate correlation ID for request tracking
const generateCorrelationId = () => {
  return 'req_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Add request interceptors
apiClient.interceptors.request.use(
  (config) => {
    // Add correlation ID for request tracking
    config.headers['X-Correlation-ID'] = generateCorrelationId();
    
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    
    // Check circuit breaker
    if (circuitBreakerState.isOpen) {
      const now = Date.now();
      if (now - circuitBreakerState.lastFailTime > circuitBreakerState.timeout) {
        // Reset circuit breaker after timeout
        circuitBreakerState.isOpen = false;
        circuitBreakerState.failures = 0;
        console.log('Circuit breaker reset - attempting request');
      } else {
        return Promise.reject(new Error('Circuit breaker is open - service unavailable'));
      }
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      correlationId: config.headers['X-Correlation-ID'],
      hasAuth: !!config.headers['Authorization']
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with retry logic and circuit breaker
apiClient.interceptors.response.use(
  (response) => {
    // Reset circuit breaker on successful response
    if (circuitBreakerState.failures > 0) {
      circuitBreakerState.failures = 0;
      console.log('Circuit breaker reset - service recovered');
    }
    
    // Reset failed refresh attempts on success
    failedRefreshAttempts = 0;
    
    console.log(`API Response: ${response.status}`, {
      correlationId: response.config.headers['X-Correlation-ID'],
      url: response.config.url
    });
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors and update circuit breaker
    if (!error.response) {
      circuitBreakerState.failures++;
      if (circuitBreakerState.failures >= 5) {
        circuitBreakerState.isOpen = true;
        circuitBreakerState.lastFailTime = Date.now();
        toast.error('Service temporarily unavailable. Please try again later.');
      }
      console.error('Network error detected:', error.message);
    }
    
    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry && failedRefreshAttempts < MAX_REFRESH_ATTEMPTS) {
      originalRequest._retry = true;
      failedRefreshAttempts++;
      
      try {
        console.log("Attempting token refresh...");
        const response = await axios.get(`${API_URL}/auth/refresh`, { 
          withCredentials: true,
          timeout: API_TIMEOUT
        });
        
        if (response.data?.accessToken) {
          console.log("Token refresh successful");
          const token = response.data.accessToken;
          localStorage.setItem('token', token);
          apiClient.defaults.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          originalRequest.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    // Retry logic for transient errors (excluding 4xx client errors)
    if (!originalRequest._retryCount && error.response?.status >= 500) {
      originalRequest._retryCount = 0;
    }
    
    if (originalRequest._retryCount < MAX_RETRY_ATTEMPTS && error.response?.status >= 500) {
      originalRequest._retryCount++;
      const delay = Math.pow(2, originalRequest._retryCount) * 1000; // Exponential backoff
      
      console.log(`Retrying request (attempt ${originalRequest._retryCount}/${MAX_RETRY_ATTEMPTS}) after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(originalRequest);
    }
    
    // Log error details
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: originalRequest?.url,
      correlationId: originalRequest?.headers['X-Correlation-ID']
    });
      return Promise.reject(error);
  }
);

export default apiClient;
