import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30 * 1000, // 30 seconds - more aggressive refetching
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnReconnect: true, // Refetch when reconnecting
      refetchOnMount: true, // Always refetch on mount
    },
    mutations: {
      retry: 1,
    },
  },
});

// App Context for global state
const AppContext = createContext();

const initialState = {
  user: null,
  notifications: [],
  unreadNotificationCount: 0,
  isConnectedToRealTime: false,
  socket: null,
  theme: localStorage.getItem('theme') || 'light',
  loading: false,
  error: null,
  onlineStatus: navigator.onLine,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications],
        unreadNotificationCount: state.unreadNotificationCount + 1
      };
    
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id ? action.payload : notification
        )
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification =>
          notification.id !== action.payload
        )
      };
    
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadNotificationCount: action.payload };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, read: true } : notification
        ),
        unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1)
      };
    
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadNotificationCount: 0
      };
    
    case 'SET_REALTIME_CONNECTION':
      return { 
        ...state, 
        isConnectedToRealTime: action.payload.connected,
        socket: action.payload.socket 
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return { ...state, theme: newTheme };
    
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };
    
    case 'SET_ONLINE_STATUS':
      return { ...state, onlineStatus: action.payload };
    
    case 'CLEAR_STATE':
      return {
        ...initialState,
        theme: state.theme,
        onlineStatus: state.onlineStatus
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
      toast.warning('You are offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Setup real-time notifications when user is authenticated
  useEffect(() => {
    if (state.user && !state.socket && process.env.REACT_APP_ENABLE_REAL_TIME === 'true') {
      const socket = notificationService.connectToNotifications(state.user.id, {
        onConnect: () => {
          console.log('Real-time notifications connected');
          dispatch({ 
            type: 'SET_REALTIME_CONNECTION', 
            payload: { connected: true, socket } 
          });
        },
        
        onDisconnect: () => {
          console.log('Real-time notifications disconnected');
          dispatch({ 
            type: 'SET_REALTIME_CONNECTION', 
            payload: { connected: false, socket: null } 
          });
        },
        
        onError: (error) => {
          console.error('Real-time connection error:', error);
          toast.error('Real-time connection failed');
        },
        
        onNotification: (notification) => {
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
          
          // Show toast notification
          const notificationMessage = notification.message || 'New notification';
          toast.info(notificationMessage, {
            autoClose: 5000,
            onClick: () => {
              // Handle notification click - maybe navigate to relevant page
              if (notification.type === 'yeet_liked' && notification.yeetId) {
                // Navigate to yeet
                window.location.href = `/yeet/${notification.yeetId}`;
              }
            }
          });
        },
        
        onNotificationRead: (data) => {
          dispatch({ type: 'MARK_NOTIFICATION_READ', payload: data.notificationId });
        },
        
        onNotificationDeleted: (data) => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: data.notificationId });
        },
        
        onYeetLiked: (data) => {
          // Invalidate yeet queries to refresh likes
          queryClient.invalidateQueries(['yeets']);
          queryClient.invalidateQueries(['yeet', data.yeetId]);
        },
        
        onYeetRetweeted: (data) => {
          // Invalidate yeet queries to refresh retweets
          queryClient.invalidateQueries(['yeets']);
          queryClient.invalidateQueries(['yeet', data.yeetId]);
        },
        
        onUserFollowed: (data) => {
          // Invalidate user queries
          queryClient.invalidateQueries(['user', data.followerId]);
          queryClient.invalidateQueries(['user', data.followeeId]);
        },
        
        onYeetCreated: (data) => {
          // Invalidate feed queries to show new yeets
          queryClient.invalidateQueries(['yeets']);
          queryClient.invalidateQueries(['feed']);
        }
      });
    }

    // Cleanup on unmount or user change
    return () => {
      if (state.socket) {
        notificationService.disconnectFromNotifications(state.socket);
      }
    };
  }, [state.user, state.socket]);

  const value = {
    state,
    dispatch,
    queryClient
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={value}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </AppContext.Provider>
    </QueryClientProvider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export { queryClient };
export default AppContext;
