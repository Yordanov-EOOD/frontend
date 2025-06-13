import apiClient from '../utils/apiClient';

export const authService = {
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post('/register', userData);
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },

  async refreshToken() {
    const response = await apiClient.get('/auth/refresh');
    return response.data;
  },

  async verifyToken() {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },

  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await apiClient.post('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

export default authService;
