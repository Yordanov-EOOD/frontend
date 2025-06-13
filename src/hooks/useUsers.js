import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../services/userService';
import { toast } from 'react-toastify';

// Query Keys
export const USER_QUERY_KEYS = {
  all: ['users'],
  lists: () => [...USER_QUERY_KEYS.all, 'list'],
  list: (filters) => [...USER_QUERY_KEYS.lists(), { filters }],
  details: () => [...USER_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...USER_QUERY_KEYS.details(), id],
  me: () => [...USER_QUERY_KEYS.all, 'me'],
  followers: (userId) => [...USER_QUERY_KEYS.detail(userId), 'followers'],
  following: (userId) => [...USER_QUERY_KEYS.detail(userId), 'following'],
  search: (query) => [...USER_QUERY_KEYS.all, 'search', query],
  suggestions: () => [...USER_QUERY_KEYS.all, 'suggestions'],
  stats: (userId) => [...USER_QUERY_KEYS.detail(userId), 'stats'],
  blocked: () => [...USER_QUERY_KEYS.all, 'blocked']
};

// Get Current User Query
export const useCurrentUser = () => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.me(),
    queryFn: () => userService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get User Profile Query
export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(userId),
    queryFn: () => userService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Get User Followers Query
export const useUserFollowers = (userId, page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEYS.followers(userId), page],
    queryFn: () => userService.getFollowers(userId, page, limit),
    enabled: !!userId,
    keepPreviousData: true,
  });
};

// Get User Following Query
export const useUserFollowing = (userId, page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEYS.following(userId), page],
    queryFn: () => userService.getFollowing(userId, page, limit),
    enabled: !!userId,
    keepPreviousData: true,
  });
};

// Search Users Query
export const useSearchUsers = (query, page = 1, limit = 10, filters = {}) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEYS.search(query), page, filters],
    queryFn: () => userService.searchUsers(query, page, limit, filters),
    enabled: !!query && query.length > 2,
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get Suggested Users Query
export const useSuggestedUsers = (limit = 5) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEYS.suggestions(), limit],
    queryFn: () => userService.getSuggestedUsers(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get User Stats Query
export const useUserStats = (userId) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.stats(userId),
    queryFn: () => userService.getUserStats(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Blocked Users Query
export const useBlockedUsers = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEYS.blocked(), page],
    queryFn: () => userService.getBlockedUsers(page, limit),
    keepPreviousData: true,
  });
};

// Update Profile Mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates) => userService.updateProfile(updates),
    
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: USER_QUERY_KEYS.me() });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(USER_QUERY_KEYS.me());

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData(USER_QUERY_KEYS.me(), {
          ...previousUser,
          ...updates
        });
      }

      return { previousUser };
    },
    
    onSuccess: (updatedUser) => {
      // Update user data in cache
      queryClient.setQueryData(USER_QUERY_KEYS.me(), updatedUser);
      queryClient.setQueryData(USER_QUERY_KEYS.detail(updatedUser.id), updatedUser);
      
      toast.success('Profile updated successfully!');
    },
    
    onError: (error, updates, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(USER_QUERY_KEYS.me(), context.previousUser);
      }
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.me() });
    }
  });
};

// Update Avatar Mutation
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageFile) => userService.updateAvatar(imageFile),
    
    onSuccess: (updatedUser) => {
      // Update user data in cache
      queryClient.setQueryData(USER_QUERY_KEYS.me(), updatedUser);
      queryClient.setQueryData(USER_QUERY_KEYS.detail(updatedUser.id), updatedUser);
      
      toast.success('Avatar updated successfully!');
    },
    
    onError: (error) => {
      console.error('Failed to update avatar:', error);
      toast.error(error.response?.data?.message || 'Failed to update avatar');
    }
  });
};

// Update Banner Mutation
export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageFile) => userService.updateBanner(imageFile),
    
    onSuccess: (updatedUser) => {
      // Update user data in cache
      queryClient.setQueryData(USER_QUERY_KEYS.me(), updatedUser);
      queryClient.setQueryData(USER_QUERY_KEYS.detail(updatedUser.id), updatedUser);
      
      toast.success('Banner updated successfully!');
    },
    
    onError: (error) => {
      console.error('Failed to update banner:', error);
      toast.error(error.response?.data?.message || 'Failed to update banner');
    }
  });
};

// Follow User Mutation
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => userService.followUser(userId),
    
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: USER_QUERY_KEYS.detail(userId) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(USER_QUERY_KEYS.detail(userId));

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), {
          ...previousUser,
          followerCount: previousUser.followerCount + 1,
          isFollowing: true
        });
      }

      return { previousUser, userId };
    },
    
    onSuccess: (data, userId) => {
      // Invalidate followers and following lists
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.followers(userId) });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.following(userId) });
      
      toast.success('User followed successfully!');
    },
    
    onError: (error, userId, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(USER_QUERY_KEYS.detail(context.userId), context.previousUser);
      }
      console.error('Failed to follow user:', error);
      toast.error(error.response?.data?.message || 'Failed to follow user');
    },
    
    onSettled: (data, error, userId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(userId) });
    }
  });
};

// Unfollow User Mutation
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => userService.unfollowUser(userId),
    
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: USER_QUERY_KEYS.detail(userId) });

      const previousUser = queryClient.getQueryData(USER_QUERY_KEYS.detail(userId));

      if (previousUser) {
        queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), {
          ...previousUser,
          followerCount: Math.max(0, previousUser.followerCount - 1),
          isFollowing: false
        });
      }

      return { previousUser, userId };
    },
    
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.followers(userId) });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.following(userId) });
      
      toast.success('User unfollowed successfully!');
    },
    
    onError: (error, userId, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(USER_QUERY_KEYS.detail(context.userId), context.previousUser);
      }
      console.error('Failed to unfollow user:', error);
      toast.error(error.response?.data?.message || 'Failed to unfollow user');
    },
    
    onSettled: (data, error, userId) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(userId) });
    }
  });
};

// Block User Mutation
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => userService.blockUser(userId),
    
    onSuccess: (data, userId) => {
      // Remove from followers/following
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.followers(userId) });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.following(userId) });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.blocked() });
      
      toast.success('User blocked successfully!');
    },
    
    onError: (error) => {
      console.error('Failed to block user:', error);
      toast.error(error.response?.data?.message || 'Failed to block user');
    }
  });
};

// Unblock User Mutation
export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => userService.unblockUser(userId),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.blocked() });
      toast.success('User unblocked successfully!');
    },
    
    onError: (error) => {
      console.error('Failed to unblock user:', error);
      toast.error(error.response?.data?.message || 'Failed to unblock user');
    }
  });
};

// Report User Mutation
export const useReportUser = () => {
  return useMutation({
    mutationFn: ({ userId, reason, description }) => 
      userService.reportUser(userId, reason, description),
    
    onSuccess: () => {
      toast.success('User reported successfully!');
    },
    
    onError: (error) => {
      console.error('Failed to report user:', error);
      toast.error(error.response?.data?.message || 'Failed to report user');
    }
  });
};
