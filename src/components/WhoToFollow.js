import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import Header from "./Header";
import Avatar from "../styles/Avatar";
import Follow from "./Profile/Follow";
import Button from "../styles/Button";
import { userAPI } from "../api";

const Wrapper = styled.div`
	margin-left: 0.4rem;
	width: 350px;
	background: ${props => props.theme.tertiaryColor2};
	border-radius: 10px;

	div:last-child {
		border-bottom: none;
	}
`;

const UserWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 1rem 1rem;
	border-bottom: 1px solid ${props => props.theme.tertiaryColor};
	font-size: 0.9rem;

	button {
		align-self: flex-start;
	}

	.avatar-handle {
		display: flex;

		img {
			margin-right: 1rem;
		}
	}

	.handle-fullname {
		display: flex;
		flex-direction: column;

		span:first-child {
			font-weight: 500;
		}

		span.secondary {
			color: ${props => props.theme.secondaryColor};
		}
	}
`;

export const User = ({ user }) => (
	<UserWrapper>
		<div className="avatar-handle">
			<Link to={`/${user && user.handle}`}>
				<Avatar src={user && user.avatar} alt="avatar" />
			</Link>

			<div className="handle-fullname">
				<Link to={`/${user && user.handle}`}>
					<span>{user && user.fullname}</span>
				</Link>
				<span className="secondary">@{user && user.handle}</span>
			</div>
		</div>

		{user && !user.isSelf ? (
			<Follow sm id={user && user.id} isFollowing={user && user.isFollowing} />
		) : (
			<Link to="/settings/profile">
				<Button sm outline className="action-btn">
					Edit Profile
				</Button>
			</Link>
		)}
	</UserWrapper>
);

const WhoToFollow = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const data = await userAPI.getUsers();
				setUsers(data);
			} catch (err) {
				console.error("Error fetching user suggestions:", err);
				setError(err.response?.data?.error || "Failed to load user suggestions");
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	if (loading) return <Loader />;
	if (error) return <div>{error}</div>;
	
	return (
		<Wrapper>
			<Header>Who to follow</Header>
			{users.map(user => (
				<User key={user.id} user={user} />
			))}
		</Wrapper>
	);
};

export default WhoToFollow;
