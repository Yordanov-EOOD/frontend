// src/components/Tweet/MasterTweet.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Header from "../Header";
import Loader from "../Loader";
import Tweet from "./Tweet";
import Comment from "../Comment/Comment";
import AddComment from "../Comment/AddComment";
import { tweetAPI } from "../../api";
import { sortFn } from "../../utils";
import CustomResponse from "../CustomResponse";

const Wrapper = styled.div`
  margin-bottom: 7rem;
`;

const MasterTweet = () => {
  const { tweetId } = useParams();
  const [tweet, setTweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTweet = async () => {
      try {
        const data = await tweetAPI.getTweet(tweetId);
        setTweet(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch tweet");
      } finally {
        setLoading(false);
      }
    };

    fetchTweet();
  }, [tweetId]);

  // Sort comments by creation time if available
  const comments = tweet?.comments || [];
  if (comments.length) {
    comments.sort(sortFn);
  }

  return (
    <Wrapper>
      <Header>
        <span>Tweet</span>
      </Header>
      {loading ? (
        <Loader />
      ) : (
        <>
          {tweet ? (
            <Tweet tweet={tweet} />
          ) : (
            <CustomResponse text="Oops, the tweet you are looking for doesn't seem to exist." />
          )}
          {tweet ? (
            <AddComment id={tweet.id} />
          ) : null}
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </>
      )}
    </Wrapper>
  );
};

export default MasterTweet;