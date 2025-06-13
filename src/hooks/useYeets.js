import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import yeetService from '../services/yeetService';
import { toast } from 'react-toastify';

// Query Keys
export const YEET_QUERY_KEYS = {
  all: ['yeets'],
  lists: () => [...YEET_QUERY_KEYS.all, 'list'],
  list: (filters) => [...YEET_QUERY_KEYS.lists(), { filters }],
  details: () => [...YEET_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...YEET_QUERY_KEYS.details(), id],
  feed: (page) => [...YEET_QUERY_KEYS.all, 'feed', page],
  user: (userId) => [...YEET_QUERY_KEYS.all, 'user', userId],
  search: (query) => [...YEET_QUERY_KEYS.all, 'search', query],
  trending: (timeframe) => [...YEET_QUERY_KEYS.all, 'trending', timeframe]
};

// Get Yeets Query
export const useYeets = (page = 1, limit = 10, filters = {}) => {
  return useQuery({
    queryKey: YEET_QUERY_KEYS.list({ page, limit, ...filters }),
    queryFn: () => yeetService.getYeets(page, limit, filters),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get Feed Query
export const useFeedYeets = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: YEET_QUERY_KEYS.feed(page),
    queryFn: () => yeetService.getFeedYeets(page, limit),
    keepPreviousData: true,
    staleTime: 1 * 60 * 1000, // 1 minute for feed
  });
};

// Get Single Yeet Query
export const useYeet = (yeetId) => {
  return useQuery({
    queryKey: YEET_QUERY_KEYS.detail(yeetId),
    queryFn: () => yeetService.getYeetById(yeetId),
    enabled: !!yeetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get User Yeets Query
export const useUserYeets = (userId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...YEET_QUERY_KEYS.user(userId), page],
    queryFn: () => yeetService.getUserYeets(userId, page, limit),
    enabled: !!userId,
    keepPreviousData: true,
  });
};

// Search Yeets Query
export const useSearchYeets = (query, page = 1, limit = 10, filters = {}) => {
  return useQuery({
    queryKey: [...YEET_QUERY_KEYS.search(query), page, filters],
    queryFn: () => yeetService.searchYeets(query, page, limit, filters),
    enabled: !!query && query.length > 2,
    keepPreviousData: true,
  });
};

// Trending Yeets Query
export const useTrendingYeets = (timeframe = '24h', limit = 10) => {
  return useQuery({
    queryKey: YEET_QUERY_KEYS.trending(timeframe),
    queryFn: () => yeetService.getTrendingYeets(timeframe, limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create Yeet Mutation
export const useCreateYeet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, image, options }) => 
      yeetService.createYeet(content, image, options),
    
    onSuccess: (newYeet) => {
      // Invalidate and refetch yeet queries
      queryClient.invalidateQueries({ queryKey: YEET_QUERY_KEYS.all });
      
      // Optimistically add to feed
      queryClient.setQueryData(YEET_QUERY_KEYS.feed(1), (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            yeets: [newYeet, ...oldData.yeets]
          };
        }
        return oldData;
      });

      toast.success('Yeet posted successfully!');
    },
    
    onError: (error) => {
      console.error('Failed to create yeet:', error);
      toast.error(error.response?.data?.message || 'Failed to post yeet');
    }
  });
};

// Update Yeet Mutation
export const useUpdateYeet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ yeetId, updates }) => yeetService.updateYeet(yeetId, updates),
    
    onSuccess: (updatedYeet) => {
      // Update the yeet in cache
      queryClient.setQueryData(YEET_QUERY_KEYS.detail(updatedYeet.id), updatedYeet);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: YEET_QUERY_KEYS.lists() });
      
      toast.success('Yeet updated successfully!');
    },
    
    onError: (error) => {
      console.error('Failed to update yeet:', error);
      toast.error(error.response?.data?.message || 'Failed to update yeet');
    }
  });
};

// Delete Yeet Mutation
export const useDeleteYeet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (yeetId) => yeetService.deleteYeet(yeetId),
    
    onSuccess: (_, yeetId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: YEET_QUERY_KEYS.detail(yeetId) });
      
      // Update lists by removing the deleted yeet
      queryClient.setQueriesData({ queryKey: YEET_QUERY_KEYS.lists() }, (oldData) => {
        if (oldData?.yeets) {
          return {
            ...oldData,
            yeets: oldData.yeets.filter(yeet => yeet.id !== yeetId)
          };
        }
        return oldData;
      });

      toast.success('Yeet deleted successfully!');
    },
    
    onError: (error) => {
      console.error('Failed to delete yeet:', error);
      toast.error(error.response?.data?.message || 'Failed to delete yeet');
    }
  });
};

// Like Yeet Mutation
export const useLikeYeet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (yeetId) => yeetService.likeYeet(yeetId),
    
    onMutate: async (yeetId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: YEET_QUERY_KEYS.detail(yeetId) });

      // Snapshot previous value
      const previousYeet = queryClient.getQueryData(YEET_QUERY_KEYS.detail(yeetId));

      // Optimistically update
      if (previousYeet) {
        queryClient.setQueryData(YEET_QUERY_KEYS.detail(yeetId), {
          ...previousYeet,
          likeCount: previousYeet.likeCount + 1,
          isLiked: true
        });
      }

      return { previousYeet, yeetId };
    },
    
    onError: (err, yeetId, context) => {
      // Rollback on error
      if (context?.previousYeet) {
        queryClient.setQueryData(YEET_QUERY_KEYS.detail(context.yeetId), context.previousYeet);
      }
      toast.error('Failed to like yeet');
    },
    
    onSettled: (data, error, yeetId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: YEET_QUERY_KEYS.detail(yeetId) });
    }
  });
};

// Unlike Yeet Mutation
export const useUnlikeYeet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (yeetId) => yeetService.unlikeYeet(yeetId),
    
    onMutate: async (yeetId) => {
      await queryClient.cancelQueries({ queryKey: YEET_QUERY_KEYS.detail(yeetId) });

      const previousYeet = queryClient.getQueryData(YEET_QUERY_KEYS.detail(yeetId));

      if (previousYeet) {
        queryClient.setQueryData(YEET_QUERY_KEYS.detail(yeetId), {
          ...previousYeet,
          likeCount: Math.max(0, previousYeet.likeCount - 1),
          isLiked: false
        });
      }

      return { previousYeet, yeetId };
    },
    
    onError: (err, yeetId, context) => {
      if (context?.previousYeet) {
        queryClient.setQueryData(YEET_QUERY_KEYS.detail(context.yeetId), context.previousYeet);
      }
      toast.error('Failed to unlike yeet');
    },
    
    onSettled: (data, error, yeetId) => {
      queryClient.invalidateQueries({ queryKey: YEET_QUERY_KEYS.detail(yeetId) });
    }
  });
};

// Retweet Yeet Mutation
export const useRetweetYeet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ yeetId, comment }) => yeetService.retweetYeet(yeetId, comment),
    
    onSuccess: (retweetData) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: YEET_QUERY_KEYS.all });
      toast.success('Retweeted successfully!');
    },
    
    onError: (error) => {
      console.error('Failed to retweet:', error);
      toast.error(error.response?.data?.message || 'Failed to retweet');
    }
  });
};

// Unretweet Yeet Mutation
export const useUnretweetYeet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (yeetId) => yeetService.unretweetYeet(yeetId),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: YEET_QUERY_KEYS.all });
      toast.success('Unretweet successful!');
    },
    
    onError: (error) => {
      console.error('Failed to unretweet:', error);
      toast.error(error.response?.data?.message || 'Failed to unretweet');
    }
  });
};
