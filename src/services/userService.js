import apiClient from '../utils/apiClient';

export const userService = {
  async getUserByUsername(username) {
    // Search for user by username to get their authUserId
    const response = await apiClient.get('/users', {
      params: { search: username, limit: 1 }
    });
    
    let users;
    if (response.data && response.data.data && response.data.data.users) {
      users = response.data.data.users;
    } else if (response.data && response.data.users) {
      users = response.data.users;
    } else if (Array.isArray(response.data)) {
      users = response.data;
    } else {
      throw new Error('Invalid search API response format');
    }
    
    // Find exact username match (case-insensitive)
    const user = users.find(u => u.username?.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      throw new Error(`User with username "${username}" not found`);
    }
    
    return user;
  },

  async getUserProfile(userIdOrUsername) {
    // Check if it looks like a UUID (authUserId) or username
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrUsername);
    
    let authUserId;
    if (isUUID) {
      // Direct authUserId lookup
      authUserId = userIdOrUsername;
    } else {
      // Username lookup - need to search first
      const user = await this.getUserByUsername(userIdOrUsername);
      authUserId = user.authUserId;
    }
    
    const response = await apiClient.get(`/users/${authUserId}`);
    
    // Handle different API response structures
    let userData;
    if (response.data && response.data.data && response.data.data.user) {
      // Backend structure: { data: { user: {...} } }
      userData = response.data.data.user;
    } else if (response.data && response.data.user) {
      // Backend structure: { user: {...} }
      userData = response.data.user;
    } else if (response.data) {
      // Direct user data
      userData = response.data;
    } else {
      throw new Error('Invalid API response format');
    }
    
    // Map backend fields to frontend expected fields
    return {
      ...userData,
      handle: userData.username || userData.handle || userData.id,
      fullname: userData.username || userData.fullname || userData.displayName || 'Unknown User',
      avatar: userData.image || userData.avatar || '',
    };
  },

  async getCurrentUser() {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  async updateProfile(updates) {
    const response = await apiClient.patch('/users/me', updates);
    return response.data;
  },

  async updateAvatar(imageFile) {
    const formData = new FormData();
    formData.append('avatar', imageFile);
    
    const response = await apiClient.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async updateBanner(imageFile) {
    const formData = new FormData();
    formData.append('banner', imageFile);
    
    const response = await apiClient.post('/users/me/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async followUser(userId) {
    const response = await apiClient.post(`/users/${userId}/follow`);
    return response.data;
  },

  async unfollowUser(userId) {
    const response = await apiClient.delete(`/users/${userId}/follow`);
    return response.data;
  },

  async getFollowers(userId, page = 1, limit = 20) {
    const response = await apiClient.get(`/users/${userId}/followers`, {
      params: { page, limit }
    });
    return response.data;
  },

  async getFollowing(userId, page = 1, limit = 20) {
    const response = await apiClient.get(`/users/${userId}/following`, {
      params: { page, limit }
    });
    return response.data;
  },
  async searchUsers(query, page = 1, limit = 10, filters = {}) {
    const params = { search: query, page, limit, ...filters };
    const response = await apiClient.get('/users', { params });
    
    // Handle different API response structures
    let result;
    if (response.data && response.data.data) {
      result = response.data.data;
    } else if (response.data) {
      result = response.data;
    } else {
      throw new Error('Invalid search API response format');
    }
    
    // Ensure users array exists and map fields
    const users = (result.users || []).map(user => ({
      ...user,
      handle: user.username || user.handle || user.id,
      fullname: user.username || user.fullname || user.displayName || 'Unknown User',
      avatar: user.image || user.avatar || '',
    }));
    
    return {
      ...result,
      users
    };
  },

  async getSuggestedUsers(limit = 5) {
    const response = await apiClient.get('/users/suggestions', {
      params: { limit }
    });
    return response.data;
  },

  async blockUser(userId) {
    const response = await apiClient.post(`/users/${userId}/block`);
    return response.data;
  },

  async unblockUser(userId) {
    const response = await apiClient.delete(`/users/${userId}/block`);
    return response.data;
  },

  async getBlockedUsers(page = 1, limit = 20) {
    const response = await apiClient.get('/users/blocked', {
      params: { page, limit }
    });
    return response.data;
  },

  async reportUser(userId, reason, description = '') {
    const response = await apiClient.post(`/users/${userId}/report`, {
      reason,
      description
    });
    return response.data;
  },

  async getUserStats(userId) {
    const response = await apiClient.get(`/users/${userId}/stats`);
    return response.data;
  },

  async deactivateAccount() {
    const response = await apiClient.post('/users/me/deactivate');
    return response.data;
  },

  async deleteAccount() {
    const response = await apiClient.delete('/users/me');
    return response.data;
  }
};

export default userService;
