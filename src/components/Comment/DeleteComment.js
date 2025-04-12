import React, { useState } from "react";
import { toast } from "react-toastify";
import { deleteComment } from "../../queries/comment"; // REST function
import { TrashIcon } from "../Icons";

const DeleteComment = ({ id, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteComment = async () => {
    setLoading(true);
    try {
      await deleteComment(id);
      toast.success("Your comment has been deleted");
      if (onDelete) onDelete(id); // update local state as needed
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return <TrashIcon loading={loading} onClick={handleDeleteComment} />;
};

export default DeleteComment;
