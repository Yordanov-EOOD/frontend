import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import moment from "moment";
import DeleteTweet from "./DeleteTweet";
import LikeTweet from "./LikeTweet";
import Retweet from "./Retweet";
import { CommentIcon } from "../Icons";
import Avatar from "../../styles/Avatar";
import TweetFile from "../../styles/TweetFile";

const Wrapper = styled.div`
  display: flex;
  border-bottom: 1px solid ${(props) => props.theme.tertiaryColor};
  padding: 1.5rem 1rem 1rem 1rem;

  .tweet-info-user {
    display: flex;
  }

  .tweet-info-user span.username {
    font-weight: 500;
  }

  .tweet-info-user span.secondary {
    padding-left: 0.5rem;
    color: ${(props) => props.theme.secondaryColor};
  }

  .tags {
    display: flex;
  }

  span.tag {
    color: ${(props) => props.theme.accentColor};
    margin-right: 0.4rem;
  }

  div.tweet-stats {
    display: flex;
    margin-top: 0.5rem;
    align-items: center;

    div {
      margin-right: 4rem;
      color: ${(props) => props.theme.secondaryColor};
    }

    svg {
      margin-right: 0.5rem;
    }

    span {
      display: flex;
      align-items: center;
    }

    span.comment {
      svg {
        position: relative;
        top: 4px;
      }
    }
  }

  @media screen and (max-width: 470px) {
    div.tweet-stats {
      div {
        margin-right: 2.5rem;
      }
    }
  }

  @media screen and (max-width: 430px) {
    flex-direction: column;

    .username {
      display: none;
    }

    .avatar {
      display: none;
    }

    .tweet-info-user span.secondary {
      padding-left: 0;
      padding-right: 0.7rem;
    }
  }
`;

// Convert to forwardRef to accept refs from parent components
const Tweet = forwardRef(({ tweet }, ref) => {
  // Error handling - if tweet data is missing or malformed, render fallback
  if (!tweet) {
    console.error("Tweet component received null or undefined tweet data");
    return (
      <Wrapper>
        <div className="tweet-info">
          <div className="tweet-info-user">
            <span className="secondary">Tweet data unavailable</span>
          </div>
        </div>
      </Wrapper>
    );
  }

  // Map backend response fields to the component's expected structure
  const {
    id = '',
    content = '',  // 'content' in API response maps to 'text' in component
    image = null,  // 'image' in API response maps to files
    author = {},   // author contains username which maps to handle
    publishedAt = new Date().toISOString(), // 'publishedAt' maps to 'createdAt'
    impressions = 0 // Fix typo: 'impresions' -> 'impressions'
  } = tweet;

  // Create a compatible structure for the component
  const text = content;
  const createdAt = publishedAt;
  const likesCount = impressions; // Use corrected property name
  const files = image ? [{ url: image }] : [];
  const tags = [];  // tags are not in the response, default to empty
  const commentsCount = 0;  // not in response, default to 0
  const retweetsCount = 0;  // not in response, default to 0
  
  // User data mapping
  const user = {
    handle: author?.username || 'unknown',
    fullname: author?.username || 'Unknown User',
    avatar: ''  // avatar not provided in response
  };
  
  // Get authentication info from localStorage
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  
  // Check if this tweet belongs to the current user
  const isTweetMine = currentUser?.id && author?.id && currentUser.id === author.id;
  const isLiked = false; // Default value, update this based on your API response
  const isRetweet = false; // Default value, update this based on your API response

  // Additional safety check for user object
  if (!author) {
    console.error("Tweet has null or undefined user data", { id });
    return (
      <Wrapper ref={ref}>
        <div className="tweet-info">
          <div className="tweet-info-user">
            <span className="secondary">User data unavailable for tweet {id}</span>
          </div>
          <p>{text}</p>
        </div>
      </Wrapper>
    );
  }

  const { handle, fullname } = user;
  
  // Process text safely
  const strList = text ? text.split(" ") : [];
  const processedText = strList.filter((str) => !str.startsWith("#")).join(" ");

  return (
    <Wrapper ref={ref}>
      <Link to={`/user/${author?.id || 'unknown'}`}>
        <Avatar className="avatar" src={user.avatar || ''} alt="avatar" />
      </Link>

      <div className="tweet-info">
        <div className="tweet-info-user">
          <Link to={`/user/${author?.id || 'unknown'}`}>
            <span className="username">{fullname}</span>
            <span className="secondary">{`@${handle}`}</span>
            <span className="secondary">{moment(createdAt).fromNow()}</span>
          </Link>
        </div>

        <Link to={`/user/${author?.id || 'unknown'}/status/${id}`}>
          <p>{processedText}</p>
        </Link>

        <div className="tags">
          {tags && tags.length > 0
            ? tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className="tag">
                  {tag}
                </span>
              ))
            : null}
        </div>

        <Link to={`/user/${author?.id || 'unknown'}/status/${id}`}>
          {files && files.length > 0 && files[0] ? (
            <TweetFile src={files[0].url} alt="tweet-file" />
          ) : null}
        </Link>

        <div className="tweet-stats">
          <div>
            <span className="comment">
              <Link to={`/user/${author?.id || 'unknown'}/status/${id}`}>
                <CommentIcon />
                {commentsCount ? commentsCount : null}
              </Link>
            </span>
          </div>

          <div>
            <Retweet
              id={id}
              isRetweet={isRetweet}
              retweetsCount={retweetsCount}
            />
          </div>

          <div>
            <LikeTweet id={id} isLiked={isLiked} likesCount={likesCount} />
          </div>

          <div>
            <span>{isTweetMine ? <DeleteTweet id={id} /> : null}</span>
          </div>
        </div>
      </div>
    </Wrapper>
  );
});

export default Tweet;
