import React, { useState } from "react";
import Button from "../../styles/Button";
import { displayError } from "../../utils";
import { userAPI } from "../../api";

const Follow = ({ isFollowing, id, sm = false, relative = false }) => {
  const [followState, setFollowState] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      if (followState) {
        setFollowState(false);
        await userAPI.unfollowUser(id);
      } else {
        setFollowState(true);
        await userAPI.followUser(id);
      }
    } catch (err) {
      displayError(err);
      // Revert state on error
      setFollowState(followState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button outline sm={sm} relative={relative} onClick={handleFollow} disabled={loading}>
      {followState ? "Following" : "Follow"}
    </Button>
  );
};

export default Follow;
