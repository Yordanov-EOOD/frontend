import React, { useState } from "react";
import { toast } from "react-toastify";
import { HeartIcon, HeartFillIcon } from "../Icons";
import { toggleLike } from "../../queries/tweet"; // REST function

const LikeTweet = ({ id, isLiked, likesCount }) => {
  const [liked, setLiked] = useState(isLiked);
  const [likesCountState, setLikesCount] = useState(likesCount);
  const [loading, setLoading] = useState(false);

  const handleToggleLike = async () => {
    setLoading(true);
    try {
      await toggleLike(id);
      setLiked(!liked);
      if (liked) {
        setLikesCount(likesCountState - 1);
      } else {
        setLikesCount(likesCountState + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span>
      {liked ? (
        <HeartFillIcon color="#E0245E" onClick={handleToggleLike} />
      ) : (
        <HeartIcon onClick={handleToggleLike} />
      )}
      {likesCountState || null}
    </span>
  );
};

export default LikeTweet;
