import apiClient from '../utils/apiClient';
import { io } from 'socket.io-client';

export const notificationService = {
  async getNotifications(page = 1, limit = 20, filters = {}) {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  async getUnreadCount() {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(notificationId) {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.patch('/notifications/mark-all-read');
    return response.data;
  },

  async deleteNotification(notificationId) {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  async getNotificationSettings() {
    const response = await apiClient.get('/notifications/settings');
    return response.data;
  },

  async updateNotificationSettings(settings) {
    const response = await apiClient.patch('/notifications/settings', settings);
    return response.data;
  },

  // WebSocket connection for real-time notifications
  connectToNotifications(userId, callbacks = {}) {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'ws://localhost:8080';
    
    const socket = io(socketUrl, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('token')
      },
      query: {
        userId: userId
      }
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to notification service');
      callbacks.onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
      callbacks.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('Notification service connection error:', error);
      callbacks.onError?.(error);
    });

    // Handle notification events
    socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      callbacks.onNotification?.(notification);
    });

    socket.on('notification_read', (data) => {
      callbacks.onNotificationRead?.(data);
    });

    socket.on('notification_deleted', (data) => {
      callbacks.onNotificationDeleted?.(data);
    });

    // Handle real-time updates
    socket.on('yeet_liked', (data) => {
      callbacks.onYeetLiked?.(data);
    });

    socket.on('yeet_retweeted', (data) => {
      callbacks.onYeetRetweeted?.(data);
    });

    socket.on('user_followed', (data) => {
      callbacks.onUserFollowed?.(data);
    });

    socket.on('yeet_created', (data) => {
      callbacks.onYeetCreated?.(data);
    });

    return socket;
  },

  // Disconnect WebSocket
  disconnectFromNotifications(socket) {
    if (socket) {
      socket.disconnect();
    }
  }
};

export default notificationService;
