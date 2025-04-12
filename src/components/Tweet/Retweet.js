import React, { useState } from "react";
import { toast } from "react-toastify";
import { RetweetIcon, RtFillIcon } from "../Icons";
import { toggleRetweet } from "../../queries/tweet"; // REST function
import { displayError } from "../../utils";

const Retweet = ({ id, isRetweet, retweetsCount }) => {
  const [retweet, setRetweet] = useState(isRetweet);
  const [retweetsCountState, setRetweetsCount] = useState(retweetsCount);
  const [loading, setLoading] = useState(false);

  const handleRetweet = async () => {
    setLoading(true);
    try {
      await toggleRetweet(id);
      setRetweet(!retweet);
      if (retweet) {
        setRetweetsCount(retweetsCountState - 1);
        toast.success("Retweet removed");
      } else {
        setRetweetsCount(retweetsCountState + 1);
        toast.success("Retweet done");
      }
    } catch (err) {
      displayError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span>
      {retweet ? (
        <RtFillIcon loading={loading} color="#17BF63" onClick={handleRetweet} />
      ) : (
        <RetweetIcon loading={loading} onClick={handleRetweet} />
      )}
      {retweetsCountState || null}
    </span>
  );
};

export default Retweet;
