import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';

const TweetContext = createContext(null);

// Maps API response fields to the expected frontend structure
const mapTweetData = (tweet) => {
  if (!tweet) return null;
  
  return {
    ...tweet,
    // Map fields with different names
    text: tweet.content,
    likesCount: tweet.impresions || 0,
    createdAt: tweet.publishedAt,
    
    // Add computed fields
    isLiked: false, // Default value, adjust if API provides this info
    isRetweet: false, // Default value, adjust if API provides this info
    
    // Map user fields
    user: tweet.author ? {
      id: tweet.author.id,
      handle: tweet.author.username || 'unknown',
      fullname: tweet.author.username || 'Unknown User',
      avatar: '', // Default if API doesn't provide avatar
    } : null,
    
    // Ensure files is always an array
    files: tweet.image ? [{ url: tweet.image }] : [],
    
    // Tags field (default empty array if not present)
    tags: []
  };
};

export const TweetProvider = ({ children }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState(new Map());
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [maxPages] = useState(5);

  const clearCache = () => setCache(new Map());

  const fetchTweets = useCallback(async (resetPage = false) => {
    try {
      if (resetPage) {
        setPage(1);
        setTweets([]);
      }
      
      if (!resetPage && page > maxPages) {
        console.log(`Reached maximum number of pages (${maxPages}), stopping tweet fetching.`);
        setHasMore(false);
        return [];
      }
      
      setLoading(true);
      setError(null);
      console.log(`Fetching tweets page ${resetPage ? 1 : page}...`);
        const { data } = await apiClient.get('/yeets', {
        params: { page: resetPage ? 1 : page, limit: pageSize }
      });
      
      // Handle new API response structure
      let tweetsData;
      if (data && typeof data === 'object' && data.posts) {
        // New API structure: { posts: [...], pagination: {...}, metadata: {...} }
        tweetsData = data.posts;
        console.log("API response structure detected:", Object.keys(data));
      } else if (Array.isArray(data)) {
        // Legacy API structure: direct array
        tweetsData = data;
      } else {
        console.error("Tweet data is not in expected format:", data);
        setTweets([]);
        setError("Received invalid tweet data format");
        return [];
      }
      
      if (!Array.isArray(tweetsData)) {
        console.error("Tweet posts data is not an array:", tweetsData);
        setTweets([]);
        setError("Received invalid tweet posts data format");
        return [];
      }
      
      console.log(`Fetched ${tweetsData.length} tweets`);
      
      const mappedTweets = tweetsData.map(mapTweetData).filter(Boolean);
        if (tweetsData.length < pageSize || (!resetPage && page >= maxPages)) {
        setHasMore(false);
      }
      
      if (!resetPage) {
        setPage(prev => prev + 1);
        setTweets(prev => [...prev, ...mappedTweets]);
      } else {
        setTweets(mappedTweets);
      }
      
      return mappedTweets;
    } catch (err) {
      console.error("Error fetching tweets:", err);
      const errorMsg = err.response?.data?.error || 'Failed to load tweets';
      setError(errorMsg);
      toast.error(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, maxPages]);

  const getTweet = useCallback(async (id) => {
    if (!id) {
      console.error("getTweet called without an ID");
      return null;
    }

    if (cache.has(id)) {
      console.log(`Using cached tweet ${id}`);
      return cache.get(id);
    }

    try {
      console.log(`Fetching tweet ${id}...`);
      const { data } = await apiClient.get(`/yeets/${id}`);
      
      if (!data || !data.id) {
        console.error("Received invalid tweet data:", data);
        return null;
      }
      
      const mappedTweet = mapTweetData(data);
      
      setCache(new Map(cache.set(id, mappedTweet)));
      return mappedTweet;
    } catch (err) {
      console.error(`Error fetching tweet ${id}:`, err);
      const errorMsg = err.response?.data?.error || 'Failed to load tweet';
      toast.error(errorMsg);
      return null;
    }
  }, [cache]);  const createTweet = async (tweetData) => {
    if (!tweetData || !tweetData.text) {
      toast.error('Tweet content is required');
      return null;
    }

    try {
      setLoading(true);
      console.log("Creating new tweet:", tweetData);
      
      const { data } = await apiClient.post('/yeets', {
        content: tweetData.text
      });
      
      if (!data || !data.id) {
        console.error("Received invalid response after creating tweet:", data);
        throw new Error("Invalid server response");
      }
      
      console.log("Tweet created successfully:", data);
      const mappedTweet = mapTweetData(data);
      setTweets(prev => [mappedTweet, ...prev]);
      clearCache();
      toast.success('Tweet posted!');
      return mappedTweet;
    } catch (err) {
      console.error("Error creating tweet:", err);
      const errorMsg = err.response?.data?.error || 'Failed to post tweet';
      toast.error(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTweet = async (id) => {
    if (!id) {
      console.error("deleteTweet called without an ID");
      return false;
    }

    try {
      console.log(`Deleting tweet ${id}...`);
      await apiClient.delete(`/yeets/${id}`);
      
      setTweets(prev => prev.filter(tweet => tweet.id !== id));
      const newCache = new Map(cache);
      newCache.delete(id);
      setCache(newCache);
      
      toast.success('Tweet deleted');
      return true;
    } catch (err) {
      console.error(`Error deleting tweet ${id}:`, err);
      const errorMsg = err.response?.data?.error || 'Failed to delete tweet';
      toast.error(errorMsg);
      return false;
    }
  };

  const likeTweet = async (id) => {
    if (!id) {
      console.error("likeTweet called without an ID");
      return null;
    }

    try {
      console.log(`Liking/unliking tweet ${id}...`);
      const { data } = await apiClient.post(`/yeets/${id}/like`);
      
      setTweets(prev =>
        prev.map(tweet =>
          tweet.id === id ? { 
            ...tweet, 
            isLiked: !tweet.isLiked,
            likesCount: tweet.isLiked ? tweet.likesCount - 1 : tweet.likesCount + 1 
          } : tweet
        )
      );
      
      if (cache.has(id)) {
        const cachedTweet = cache.get(id);
        setCache(new Map(cache.set(id, { 
          ...cachedTweet, 
          isLiked: !cachedTweet.isLiked,
          likesCount: cachedTweet.isLiked ? cachedTweet.likesCount - 1 : cachedTweet.likesCount + 1
        })));
      }
      
      return data;
    } catch (err) {
      console.error(`Error liking/unliking tweet ${id}:`, err);
      const errorMsg = err.response?.data?.error || 'Failed to like tweet';
      toast.error(errorMsg);
      return null;
    }
  };

  return (
    <TweetContext.Provider
      value={{
        tweets,
        loading,
        error,
        hasMore,
        fetchTweets,
        getTweet,
        createTweet,
        deleteTweet,
        likeTweet,
        clearCache,
        loadMoreTweets: () => !loading && hasMore && fetchTweets(),
        refreshTweets: () => fetchTweets(true)
      }}
    >
      {children}
    </TweetContext.Provider>
  );
};

export const useTweets = () => {
  const context = useContext(TweetContext);
  if (!context) {
    throw new Error('useTweets must be used within a TweetProvider');
  }
  return context;
};