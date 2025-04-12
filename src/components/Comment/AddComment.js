import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import TextareaAutosize from "react-textarea-autosize";
import useInput from "../../hooks/useInput";
import Button from "../../styles/Button";
import { displayError } from "../../utils";
import Avatar from "../../styles/Avatar";
import { addComment } from "../../queries/comment"; // replaced ADD_COMMENT with addComment
import { getUser } from "../../queries/client";

const Wrapper = styled.div`
	display: flex;
	padding: 1rem 1rem;
	border-bottom: 1px solid ${(props) => props.theme.tertiaryColor};

	textarea {
		width: 100%;
		background: inherit;
		border: none;
		font-size: 1.23rem;
		font-family: ${(props) => props.theme.font};
		color: ${(props) => props.theme.primaryColor};
		margin-bottom: 1.4rem;
	}

	.add-comment {
		display: flex;
		flex-direction: column;
	}

	.add-comment-action {
		display: flex;
		align-items: center;
	}

	@media screen and (max-width: 530px) {
		textarea {
			font-size: 0.9rem;
		}
	}
`;

const AddComment = ({ id }) => {
	const comment = useInput("");
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(null);

	useEffect(() => {
		getUser()
			.then((data) => setUser(data))
			.catch(err => console.error(err));
	}, []);

	const handleAddComment = async (e) => {
		e.preventDefault();
		if (!comment.value) return toast("Reply something");

		setLoading(true);
		try {
			await addComment(id, comment.value); // call the correct function from queries folder
			toast.success("Your reply has been added");
		} catch (err) {
			displayError(err);
		} finally {
			comment.setValue("");
			setLoading(false);
		}
	};

	return (
		<Wrapper>
			{user && <Avatar src={user.avatar} alt="avatar" />}
			<form onSubmit={handleAddComment}>
				<div className="add-comment">
					<TextareaAutosize
						cols="48"
						placeholder="Tweet your reply"
						type="text"
						value={comment.value}
						onChange={comment.onChange}
					/>
					<div className="add-comment-action">
						<Button sm disabled={loading} type="submit">
							Reply
						</Button>
					</div>
				</div>
			</form>
		</Wrapper>
	);
};

export default AddComment;
