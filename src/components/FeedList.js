// src/components/FeedList.js
import React, { useEffect } from "react";
import styled from "styled-components";
import Loader from "./Loader";
import Tweet from "./Tweet/Tweet";
import CustomResponse from "./CustomResponse";
import { useTweets } from "../context/TweetContext";
import { useAuth } from "../context/AuthContext";

const Wrapper = styled.div`
  margin-bottom: 7rem;
`;

const FeedList = () => {
  const { tweets, loading, fetchTweets } = useTweets();
  const { logout } = useAuth();

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  if (loading) return <Loader />;

  // If an error occurs fetching tweets and it might be auth related,
  // we could handle that here
  if (!tweets || tweets.length === 0) {
    return <CustomResponse text="Follow some people to get some feed updates" />;
  }

  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} tweet={tweet} />
      ))}
    </Wrapper>
  );
};

export default FeedList;