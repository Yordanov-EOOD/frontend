// src/components/FeedList.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import Loader from "./Loader";
import Tweet from "./Tweet/Tweet";
import CustomResponse from "./CustomResponse";
import { useTweets } from "../context/TweetContext";
import { useAuth } from "../context/AuthContext";

const Wrapper = styled.div`
  margin-bottom: 7rem;
`;

// Simple loading indicator at the bottom of the feed
const LoadingMore = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${props => props.theme.secondaryColor};
`;

const FeedList = () => {
  const { tweets, loading, fetchTweets, hasMore, loadMoreTweets } = useTweets();
  const { logout } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);
  const observerRef = useRef(null);
  const lastTweetElementRef = useRef(null);

  // Initial load of tweets
  useEffect(() => {
    fetchTweets();
    setInitialLoad(false);
  }, [fetchTweets]);

  // Set up the intersection observer for infinite scrolling
  const lastTweetRef = useCallback(node => {
    if (loading) return;
    
    // Disconnect previous observer if it exists
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreTweets();
      }
    });
    
    if (node) {
      lastTweetElementRef.current = node;
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, loadMoreTweets]);

  if (initialLoad && loading) return <Loader />;

  // If an error occurs fetching tweets and it might be auth related,
  // we could handle that here
  if (!tweets || tweets.length === 0) {
    return <CustomResponse text="Follow some people to get some feed updates" />;
  }

  return (
    <Wrapper>
      {tweets.map((tweet, index) => {
        // Add ref to last element for infinite scrolling
        if (index === tweets.length - 1) {
          return <Tweet key={tweet.id} tweet={tweet} ref={lastTweetRef} />;
        } else {
          return <Tweet key={tweet.id} tweet={tweet} />;
        }
      })}
      
      {loading && !initialLoad && <LoadingMore>Loading more tweets...</LoadingMore>}
      
      {!hasMore && tweets.length > 0 && (
        <LoadingMore>No more tweets to load</LoadingMore>
      )}
    </Wrapper>
  );
};

export default FeedList;