import React, { createContext, useState, useContext, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';

const TweetContext = createContext(null);

export const TweetProvider = ({ children }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState(new Map());

  const clearCache = () => setCache(new Map());

  const fetchTweets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/yeets');
      setTweets(data);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load tweets');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTweet = useCallback(async (id) => {
    if (cache.has(id)) {
      return cache.get(id);
    }

    try {
      const { data } = await apiClient.get(`/yeets/${id}`);
      setCache(new Map(cache.set(id, data)));
      return data;
    } catch (err) {
      toast.error('Failed to load tweet');
      throw err;
    }
  }, [cache]);

  const createTweet = async (tweetData) => {
    try {
      setLoading(true);
      const { data } = await apiClient.post('/yeets', tweetData);
      setTweets(prev => [data, ...prev]);
      clearCache();
      toast.success('Tweet posted!');
      return data;
    } catch (err) {
      toast.error('Failed to post tweet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTweet = async (id) => {
    try {
      await apiClient.delete(`/yeets/${id}`);
      setTweets(prev => prev.filter(tweet => tweet.id !== id));
      const newCache = new Map(cache);
      newCache.delete(id);
      setCache(newCache);
      toast.success('Tweet deleted');
    } catch (err) {
      toast.error('Failed to delete tweet');
      throw err;
    }
  };

  const likeTweet = async (id) => {
    try {
      const { data } = await apiClient.post(`/yeets/${id}/like`);
      setTweets(prev =>
        prev.map(tweet =>
          tweet.id === id ? { ...tweet, likes: data.likes } : tweet
        )
      );
      if (cache.has(id)) {
        const cachedTweet = cache.get(id);
        setCache(new Map(cache.set(id, { ...cachedTweet, likes: data.likes })));
      }
      return data;
    } catch (err) {
      toast.error('Failed to like tweet');
      throw err;
    }
  };

  return (
    <TweetContext.Provider
      value={{
        tweets,
        loading,
        error,
        fetchTweets,
        getTweet,
        createTweet,
        deleteTweet,
        likeTweet,
        clearCache
      }}
    >
      {children}
    </TweetContext.Provider>
  );
};

// Rename useTweet to useTweets to match the import in components
export const useTweets = () => {
  const context = useContext(TweetContext);
  if (!context) {
    throw new Error('useTweets must be used within a TweetProvider');
  }
  return context;
};