import apiClient from '../utils/apiClient';

export const yeetService = {
  async createYeet(content, image = null, options = {}) {
    const formData = new FormData();
    formData.append('content', content);
    
    if (image) {
      formData.append('image', image);
    }
    
    // Add any additional options
    Object.keys(options).forEach(key => {
      if (options[key] !== undefined) {
        formData.append(key, options[key]);
      }
    });
    
    const response = await apiClient.post('/yeets', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    });
    return response.data;
  },

  async getYeets(page = 1, limit = 10, filters = {}) {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/yeets', { params });
    return response.data;
  },

  async getYeetById(yeetId) {
    const response = await apiClient.get(`/yeets/${yeetId}`);
    return response.data;
  },

  async updateYeet(yeetId, updates) {
    const response = await apiClient.patch(`/yeets/${yeetId}`, updates);
    return response.data;
  },

  async deleteYeet(yeetId) {
    const response = await apiClient.delete(`/yeets/${yeetId}`);
    return response.data;
  },

  async likeYeet(yeetId) {
    const response = await apiClient.post(`/yeets/${yeetId}/like`);
    return response.data;
  },

  async unlikeYeet(yeetId) {
    const response = await apiClient.delete(`/yeets/${yeetId}/like`);
    return response.data;
  },

  async retweetYeet(yeetId, comment = '') {
    const response = await apiClient.post(`/yeets/${yeetId}/retweet`, { comment });
    return response.data;
  },

  async unretweetYeet(yeetId) {
    const response = await apiClient.delete(`/yeets/${yeetId}/retweet`);
    return response.data;
  },

  async getYeetLikes(yeetId, page = 1, limit = 20) {
    const response = await apiClient.get(`/yeets/${yeetId}/likes`, {
      params: { page, limit }
    });
    return response.data;
  },

  async getYeetRetweets(yeetId, page = 1, limit = 20) {
    const response = await apiClient.get(`/yeets/${yeetId}/retweets`, {
      params: { page, limit }
    });
    return response.data;
  },

  async getUserYeets(userId, page = 1, limit = 10) {
    const response = await apiClient.get(`/users/${userId}/yeets`, {
      params: { page, limit }
    });
    return response.data;
  },

  async getFeedYeets(page = 1, limit = 10) {
    const response = await apiClient.get('/yeets/feed', {
      params: { page, limit }
    });
    return response.data;
  },

  async searchYeets(query, page = 1, limit = 10, filters = {}) {
    const params = { query, page, limit, ...filters };
    const response = await apiClient.get('/yeets/search', { params });
    return response.data;
  },

  async getTrendingYeets(timeframe = '24h', limit = 10) {
    const response = await apiClient.get('/yeets/trending', {
      params: { timeframe, limit }
    });
    return response.data;
  }
};

export default yeetService;
