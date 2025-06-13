import React, { useState } from "react";
import { toast } from "react-toastify";
import { HeartIcon, HeartFillIcon } from "../Icons";
import { useTweets } from "../../context/TweetContext";

const LikeTweet = ({ id, isLiked, likesCount }) => {
  const [liked, setLiked] = useState(isLiked || false);
  const [likesCountState, setLikesCount] = useState(likesCount || 0);
  const [loading, setLoading] = useState(false);
  const { likeTweet } = useTweets();

  const handleToggleLike = async () => {
    if (!id) {
      console.error("Cannot like tweet: Missing tweet ID");
      return;
    }

    if (loading) {
      return; // Prevent multiple clicks
    }

    setLoading(true);
    try {
      await likeTweet(id);
      setLiked(!liked);
      if (liked) {
        setLikesCount(likesCountState - 1);
      } else {
        setLikesCount(likesCountState + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error("Could not process like action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <span>
      {liked ? (
        <HeartFillIcon color="#E0245E" onClick={handleToggleLike} style={loading ? { opacity: 0.7 } : null} />
      ) : (
        <HeartIcon onClick={handleToggleLike} style={loading ? { opacity: 0.7 } : null} />
      )}
      {likesCountState > 0 ? likesCountState : null}
    </span>
  );
};

export default LikeTweet;
