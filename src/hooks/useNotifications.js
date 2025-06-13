import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';
import { useAppContext } from '../context/AppContext';

// Query Keys
export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'],
  lists: () => [...NOTIFICATION_QUERY_KEYS.all, 'list'],
  list: (filters) => [...NOTIFICATION_QUERY_KEYS.lists(), { filters }],
  unreadCount: () => [...NOTIFICATION_QUERY_KEYS.all, 'unreadCount'],
  settings: () => [...NOTIFICATION_QUERY_KEYS.all, 'settings']
};

// Get Notifications Query
export const useNotifications = (page = 1, limit = 20, filters = {}) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list({ page, limit, ...filters }),
    queryFn: () => notificationService.getNotifications(page, limit, filters),
    keepPreviousData: true,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Unread Count Query
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });
};

// Get Notification Settings Query
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.settings(),
    queryFn: () => notificationService.getNotificationSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mark Notification as Read Mutation
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { dispatch } = useAppContext();

  return useMutation({
    mutationFn: (notificationId) => notificationService.markAsRead(notificationId),
    
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.lists() });

      // Snapshot previous value
      const previousData = queryClient.getQueriesData({ queryKey: NOTIFICATION_QUERY_KEYS.lists() });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: NOTIFICATION_QUERY_KEYS.lists() }, (oldData) => {
        if (oldData?.notifications) {
          return {
            ...oldData,
            notifications: oldData.notifications.map(notification =>
              notification.id === notificationId 
                ? { ...notification, read: true }
                : notification
            )
          };
        }
        return oldData;
      });

      // Update local state
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });

      return { previousData, notificationId };
    },
    
    onSuccess: () => {
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount() });
    },
    
    onError: (error, notificationId, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.lists() });
    }
  });
};

// Mark All Notifications as Read Mutation
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { dispatch } = useAppContext();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.lists() });

      const previousData = queryClient.getQueriesData({ queryKey: NOTIFICATION_QUERY_KEYS.lists() });

      // Optimistically update all notifications as read
      queryClient.setQueriesData({ queryKey: NOTIFICATION_QUERY_KEYS.lists() }, (oldData) => {
        if (oldData?.notifications) {
          return {
            ...oldData,
            notifications: oldData.notifications.map(notification => ({ 
              ...notification, 
              read: true 
            }))
          };
        }
        return oldData;
      });

      // Update local state
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });

      return { previousData };
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount() });
      toast.success('All notifications marked as read');
    },
    
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.lists() });
    }
  });
};

// Delete Notification Mutation
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { dispatch } = useAppContext();

  return useMutation({
    mutationFn: (notificationId) => notificationService.deleteNotification(notificationId),
    
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.lists() });

      const previousData = queryClient.getQueriesData({ queryKey: NOTIFICATION_QUERY_KEYS.lists() });

      // Optimistically remove notification
      queryClient.setQueriesData({ queryKey: NOTIFICATION_QUERY_KEYS.lists() }, (oldData) => {
        if (oldData?.notifications) {
          return {
            ...oldData,
            notifications: oldData.notifications.filter(notification => 
              notification.id !== notificationId
            )
          };
        }
        return oldData;
      });

      // Update local state
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });

      return { previousData, notificationId };
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount() });
    },
    
    onError: (error, notificationId, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.lists() });
    }
  });
};

// Update Notification Settings Mutation
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => notificationService.updateNotificationSettings(settings),
    
    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.settings() });

      const previousSettings = queryClient.getQueryData(NOTIFICATION_QUERY_KEYS.settings());

      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.settings(), {
        ...previousSettings,
        ...settings
      });

      return { previousSettings };
    },
    
    onSuccess: () => {
      toast.success('Notification settings updated successfully!');
    },
    
    onError: (error, settings, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.settings(), context.previousSettings);
      }
      console.error('Failed to update notification settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update notification settings');
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.settings() });
    }
  });
};

// Custom hook for real-time notification management
export const useRealTimeNotifications = () => {
  const { state, dispatch } = useAppContext();
  const queryClient = useQueryClient();

  const connectToNotifications = () => {
    if (state.user && !state.socket) {
      const socket = notificationService.connectToNotifications(state.user.id, {
        onNotification: (notification) => {
          // Add to local state
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
          
          // Invalidate queries to ensure consistency
          queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.lists() });
          queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount() });
        },
        
        onNotificationRead: (data) => {
          dispatch({ type: 'MARK_NOTIFICATION_READ', payload: data.notificationId });
          queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount() });
        },
        
        onNotificationDeleted: (data) => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: data.notificationId });
          queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.lists() });
          queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount() });
        }
      });

      dispatch({ 
        type: 'SET_REALTIME_CONNECTION', 
        payload: { connected: true, socket } 
      });
    }
  };

  const disconnectFromNotifications = () => {
    if (state.socket) {
      notificationService.disconnectFromNotifications(state.socket);
      dispatch({ 
        type: 'SET_REALTIME_CONNECTION', 
        payload: { connected: false, socket: null } 
      });
    }
  };

  return {
    isConnected: state.isConnectedToRealTime,
    connectToNotifications,
    disconnectFromNotifications
  };
};
