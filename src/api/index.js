// src/api/index.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Important for sending/receiving cookies
});

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    console.error('API error:', error.message);
    
    // If CORS error or network error
    if (!error.response) {
      console.error('Network or CORS error, possibly related to CORS configuration');
    }
    
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await axios.get(`${API_URL}/refresh`, { withCredentials: true });
        
        // If refresh successful, update token and retry original request
        if (response.data.accessToken) {
          localStorage.setItem('token', response.data.accessToken);
          api.defaults.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authAPI = {
  login: async (email, password) => {
    console.log('Attempting login with:', { email });
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error.message);
      if (!error.response) {
        console.error('Possible CORS or network issue');
      }
      throw error;
    }
  },
  
  register: async (userData) => {
    console.log('Attempting registration with:', { ...userData, password: '***' });
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.message);
      if (!error.response) {
        console.error('Possible CORS or network issue');
      }
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error.message);
      // Still remove local storage items on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  }
};

// Tweet/Yeet services
export const tweetAPI = {
  getFeed: async () => {
    const response = await api.get('/yeets');
    return response.data;
  },
  
  getTweet: async (id) => {
    const response = await api.get(`/yeets/${id}`);
    return response.data;
  },
  
  createTweet: async (tweetData) => {
    const response = await api.post('/yeets', {
      content: tweetData.text,
      image: tweetData.files && tweetData.files.length > 0 ? tweetData.files[0] : null,
      tags: tweetData.tags ? tweetData.tags.join(',') : ''
    });
    return response.data;
  },
  
  deleteTweet: async (id) => {
    const response = await api.delete(`/yeets/${id}`);
    return response.data;
  },
  
  likeTweet: async (id) => {
    const response = await api.post(`/yeets/${id}/like`);
    return response.data;
  },
  
  retweet: async (id) => {
    const response = await api.post(`/yeets/${id}/retweet`);
    return response.data;
  },
  
  addComment: async (id, text) => {
    const response = await api.post(`/yeets/${id}/comments`, { text });
    return response.data;
  },
  
  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
  
  searchByTag: async (term) => {
    const response = await api.get(`/yeets/tag/${term}`);
    return response.data;
  },
  
  searchByTweet: async (term) => {
    const response = await api.get(`/yeets/search?query=${term}`);
    return response.data;
  }
};

// User services
export const userAPI = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getUserProfile: async (authId) => {
    const response = await api.get(`/users/${authId}`);
    return response.data;
  },
  
  updateProfile: async (authId, profileData) => {
    const response = await api.put(`/users/${authId}`, profileData);
    return response.data;
  },
  
  followUser: async (id) => {
    const response = await api.post(`/users/${id}/follow`);
    return response.data;
  },
  
  unfollowUser: async (id) => {
    const response = await api.post(`/users/${id}/unfollow`);
    return response.data;
  },
  
  searchUsers: async (term) => {
    const response = await api.get(`/users/search?query=${term}`);
    return response.data;
  }
};

export default api;