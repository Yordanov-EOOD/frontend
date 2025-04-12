// src/components/Tweet/NewTweet.js
import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import TextareaAutosize from "react-textarea-autosize";
import useInput from "../../hooks/useInput";
import Button from "../../styles/Button";
import TweetFile from "../../styles/TweetFile";
import { UploadFileIcon } from "../Icons";
import Avatar from "../../styles/Avatar";
import { uploadImage } from "../../utils";
import { useAuth } from "../../context/AuthContext";
import { useTweets } from "../../context/TweetContext";

const Wrapper = styled.div`
  display: flex;
  padding: 1rem 1rem;
  border-bottom: 7px solid ${(props) => props.theme.tertiaryColor};

  textarea {
    width: 100%;
    background: inherit;
    border: none;
    font-size: 1.23rem;
    font-family: ${(props) => props.theme.font};
    color: ${(props) => props.theme.primaryColor};
    margin-bottom: 1.4rem;
  }

  .new-tweet {
    display: flex;
    flex-direction: column;
  }

  .new-tweet-action {
    display: flex;
    align-items: center;
  }

  svg {
    width: 24px;
    height: 24px;
    fill: ${(props) => props.theme.accentColor};
    margin-right: 2rem;
    cursor: pointer;
  }

  button {
    position: relative;
  }
`;

const NewTweet = () => {
  const [tweetFiles, setTweetFiles] = useState([]);
  const tweet = useInput("");
  const { user } = useAuth();
  const { createTweet } = useTweets();
  const [loading, setLoading] = useState(false);

  const handleNewTweet = async (e) => {
    e.preventDefault();

    if (!tweet.value) return toast.error("Write something");

    const tags = tweet.value.split(" ").filter((str) => str.startsWith("#"));

    setLoading(true);
    try {
      await createTweet({
        text: tweet.value,
        tags,
        files: tweetFiles,
      });

      toast.success("Your tweet has been posted");
      tweet.setValue("");
      setTweetFiles([]);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create tweet");
    } finally {
      setLoading(false);
    }
  };

  const handleTweetFiles = async (e) => {
    try {
      const imageUrl = await uploadImage(e.target.files[0]);
      setTweetFiles([...tweetFiles, imageUrl]);
    } catch (err) {
      toast.error("Failed to upload image");
    }
  };

  return (
    <Wrapper>
      <Avatar src={user?.avatar || "https://via.placeholder.com/40"} alt="avatar" />
      <form onSubmit={handleNewTweet}>
        <div className="new-tweet">
          <TextareaAutosize
            cols="48"
            placeholder="What's happening?"
            type="text"
            value={tweet.value}
            onChange={tweet.onChange}
          />

          {tweetFiles[0] && (
            <TweetFile newtweet src={tweetFiles[0]} alt="preview" />
          )}

          <div className="new-tweet-action">
            <div className="svg-input">
              <label htmlFor="file-input">
                <UploadFileIcon />
              </label>
              <input id="file-input" accept="image/*" type="file" onChange={handleTweetFiles} />
            </div>
            <Button sm disabled={loading}>
              {loading ? "Posting..." : "Tweet"}
            </Button>
          </div>
        </div>
      </form>
    </Wrapper>
  );
};

export default NewTweet;