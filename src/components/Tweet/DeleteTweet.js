import React, { useState } from "react";
import { toast } from "react-toastify";
import { deleteTweet } from "../../queries/tweet"; // REST function
import { TrashIcon } from "../Icons";

const DeleteTweet = ({ id, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteTweet = async () => {
    setLoading(true);
    try {
      await deleteTweet(id);
      toast.success("Your tweet has been deleted");
      if (onDelete) onDelete(id); // update your local state as needed
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return <TrashIcon loading={loading} onClick={handleDeleteTweet} />;
};

export default DeleteTweet;
