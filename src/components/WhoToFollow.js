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

export const User = ({ user }) => {
	// Map backend fields to frontend expected fields with better validation
	const mappedUser = {
		...user,
		handle: user.username || user.handle || user.id || 'unknown', // Fallback to username or id if handle is missing
		fullname: user.username || user.fullname || user.displayName || 'Unknown User', // Fallback chain
		avatar: user.image || user.avatar || '', // Map image field to avatar
		userId: user.authUserId || user.id || user.username, // Use authUserId for profile links with fallbacks
	};
	
	// Debug logging to understand the data structure
	if (!mappedUser.userId) {
		console.warn('WhoToFollow: User missing ID fields', {
			originalUser: user,
			mappedUser,
			availableFields: Object.keys(user)
		});
	}
	
	// Don't render if we don't have a valid userId
	if (!mappedUser.userId) {
		console.error('WhoToFollow: Cannot render user without valid ID', user);
		return null;
	}
	
	return (
		<UserWrapper>
			<div className="avatar-handle">
				<Link to={`/user/${mappedUser.userId}`}>
					<Avatar src={mappedUser.avatar} alt="avatar" />
				</Link>

				<div className="handle-fullname">
					<Link to={`/user/${mappedUser.userId}`}>
						<span>{mappedUser.fullname}</span>
					</Link>
					<span className="secondary">@{mappedUser.handle}</span>
				</div>
			</div>

			{mappedUser && !mappedUser.isSelf ? (
				<Follow sm id={mappedUser.id || mappedUser.userId} isFollowing={mappedUser.isFollowing} />
			) : (
				<Link to={`/user/${mappedUser.userId}`}>
					<Button sm outline className="action-btn">
						View Profile
					</Button>
				</Link>
			)}
		</UserWrapper>
	);
};

const WhoToFollow = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const data = await userAPI.getUsers();
				console.log('WhoToFollow: Raw API response:', data);
				
				// Handle different API response structures
				let usersData;
				if (data && typeof data === 'object') {
					if (Array.isArray(data)) {
						// Direct array response
						usersData = data;
					} else if (data.data && data.data.users && Array.isArray(data.data.users)) {
						// Response with nested structure: { data: { users: [...] }, status: 'success' }
						usersData = data.data.users;
					} else if (data.users && Array.isArray(data.users)) {
						// Response with users property: { users: [...], pagination: {...} }
						usersData = data.users;
					} else if (data.data && Array.isArray(data.data)) {
						// Response with data property: { data: [...] }
						usersData = data.data;
					} else {
						console.error("WhoToFollow: Users data is not in expected format:", data);
						console.error("WhoToFollow: Available properties:", Object.keys(data));
						setError("Invalid user data format received");
						usersData = [];
					}
				} else {
					console.error("WhoToFollow: Invalid API response:", data);
					setError("Invalid API response format");
					usersData = [];
				}
				
				console.log('WhoToFollow: Parsed users data:', usersData);
				
				// Filter out users without valid IDs before setting state
				const validUsers = usersData.filter(user => {
					const hasValidId = user.authUserId || user.id || user.username;
					if (!hasValidId) {
						console.warn('WhoToFollow: Filtering out user without valid ID:', user);
					}
					return hasValidId;
				});
				
				console.log('WhoToFollow: Valid users after filtering:', validUsers);
				setUsers(validUsers);
			} catch (err) {
				console.error("WhoToFollow: Error fetching user suggestions:", err);
				setError(err.response?.data?.error || "Failed to load user suggestions");
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	if (loading) return <Loader />;
	if (error) return <div>{error}</div>;
	
	// Ensure users is always an array before mapping
	const usersArray = Array.isArray(users) ? users : [];
	
	return (
		<Wrapper>
			<Header>Who to follow</Header>
			{usersArray.map(user => (
				<User key={user.id} user={user} />
			))}
		</Wrapper>
	);
};

export default WhoToFollow;
