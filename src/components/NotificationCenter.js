import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  useNotifications, 
  useUnreadNotificationCount, 
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification 
} from '../hooks/useNotifications';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { state } = useAppContext();

  // Queries
  const { 
    data: notificationsData, 
    isLoading, 
    isError,
    refetch 
  } = useNotifications(page, 20);
  
  const { 
    data: unreadCountData 
  } = useUnreadNotificationCount();

  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadCountData?.count || state.unreadNotificationCount || 0;
  const hasMore = notificationsData?.hasMore || false;

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      try {
        await markAsReadMutation.mutateAsync(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'yeet_liked':
      case 'yeet_retweeted':
      case 'yeet_commented':
        if (notification.yeetId) {
          window.location.href = `/yeet/${notification.yeetId}`;
        }
        break;
      case 'user_followed':
        if (notification.fromUserId) {
          window.location.href = `/profile/${notification.fromUserId}`;
        }
        break;
      case 'mention':
        if (notification.yeetId) {
          window.location.href = `/yeet/${notification.yeetId}`;
        }
        break;
      default:
        // Handle other notification types
        break;
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const loadMoreNotifications = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  const formatNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'yeet_liked':
        return `${notification.fromUser?.username || 'Someone'} liked your yeet`;
      case 'yeet_retweeted':
        return `${notification.fromUser?.username || 'Someone'} retweeted your yeet`;
      case 'yeet_commented':
        return `${notification.fromUser?.username || 'Someone'} commented on your yeet`;
      case 'user_followed':
        return `${notification.fromUser?.username || 'Someone'} started following you`;
      case 'mention':
        return `${notification.fromUser?.username || 'Someone'} mentioned you in a yeet`;
      default:
        return notification.message || 'New notification';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'yeet_liked':
        return '❤️';
      case 'yeet_retweeted':
        return '🔄';
      case 'yeet_commented':
        return '💬';
      case 'user_followed':
        return '👤';
      case 'mention':
        return '📢';
      default:
        return '🔔';
    }
  };

  return (
    <NotificationContainer>
      <NotificationBell onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && (
          <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
        )}
      </NotificationBell>

      {isOpen && (
        <NotificationDropdown>
          <NotificationHeader>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <MarkAllButton 
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isLoading}
              >
                Mark all as read
              </MarkAllButton>
            )}
          </NotificationHeader>

          <NotificationList>
            {isLoading && page === 1 ? (
              <LoadingContainer>
                <div>Loading notifications...</div>
              </LoadingContainer>
            ) : isError ? (
              <ErrorContainer>
                <div>Failed to load notifications</div>
                <RetryButton onClick={() => refetch()}>Retry</RetryButton>
              </ErrorContainer>
            ) : notifications.length === 0 ? (
              <EmptyContainer>
                <div>No notifications yet</div>
              </EmptyContainer>
            ) : (
              <>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    isUnread={!notification.read}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <NotificationIcon>
                      {getNotificationIcon(notification.type)}
                    </NotificationIcon>
                    
                    <NotificationContent>
                      <NotificationMessage>
                        {formatNotificationMessage(notification)}
                      </NotificationMessage>
                      
                      <NotificationTime>
                        {new Date(notification.createdAt).toLocaleString()}
                      </NotificationTime>
                      
                      {notification.yeetContent && (
                        <NotificationPreview>
                          "{notification.yeetContent.substring(0, 100)}..."
                        </NotificationPreview>
                      )}
                    </NotificationContent>

                    <NotificationActions>
                      <DeleteButton
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        disabled={deleteNotificationMutation.isLoading}
                      >
                        ✕
                      </DeleteButton>
                    </NotificationActions>
                  </NotificationItem>
                ))}

                {hasMore && (
                  <LoadMoreButton 
                    onClick={loadMoreNotifications}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </LoadMoreButton>
                )}
              </>
            )}
          </NotificationList>
        </NotificationDropdown>
      )}
    </NotificationContainer>
  );
};

// Styled Components
const NotificationContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const NotificationBell = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.theme.bgHover};
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: ${props => props.theme.accentColor};
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.theme.background};
  border: 1px solid ${props => props.theme.tertiaryColor};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 350px;
  max-height: 500px;
  z-index: 1000;
  overflow: hidden;
`;

const NotificationHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.tertiaryColor};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: bold;
    color: ${props => props.theme.primaryColor};
  }
`;

const MarkAllButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.accentColor};
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background-color: ${props => props.theme.bgHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.tertiaryColor};
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.isUnread ? props.theme.tertiaryColor2 : 'transparent'};

  &:hover {
    background-color: ${props => props.theme.bgHover};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationIcon = styled.div`
  margin-right: 12px;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationMessage = styled.div`
  font-weight: ${props => props.isUnread ? 'bold' : 'normal'};
  margin-bottom: 4px;
  word-wrap: break-word;
`;

const NotificationTime = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.secondaryColor};
  margin-bottom: 4px;
`;

const NotificationPreview = styled.div`
  font-size: 0.85rem;
  color: ${props => props.theme.secondaryColor};
  font-style: italic;
  word-wrap: break-word;
`;

const NotificationActions = styled.div`
  display: flex;
  align-items: flex-start;
  margin-left: 8px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.secondaryColor};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 0.9rem;

  &:hover {
    background-color: ${props => props.theme.accentColor};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.theme.secondaryColor};
`;

const ErrorContainer = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.theme.accentColor};
`;

const EmptyContainer = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${props => props.theme.secondaryColor};
`;

const RetryButton = styled.button`
  margin-top: 8px;
  padding: 8px 16px;
  background-color: ${props => props.theme.accentColor};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  color: ${props => props.theme.accentColor};
  cursor: pointer;
  border-top: 1px solid ${props => props.theme.tertiaryColor};

  &:hover {
    background-color: ${props => props.theme.bgHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default NotificationCenter;
