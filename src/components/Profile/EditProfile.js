import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "../Header";
import Loader from "../Loader";
import EditProfileForm from "./EditProfileForm";
import { userAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";

const Wrapper = styled.div`
	padding-bottom: 5rem;

	.flex-wrapper {
		display: flex;
		justify-content: center;

		form {
			.cover-photo {
				margin-bottom: 1rem;
				cursor: pointer;
			}

			.avatar-input {
				margin-top: -100px;
				margin-left: 1rem;
				cursor: pointer;
			}

			div.bio-wrapper {
				background: ${props => props.theme.tertiaryColor2};
				margin-bottom: 1.4rem;
				border-bottom: 1px solid ${props => props.theme.accentColor};
				padding: 0.5rem;

				label {
					color: ${props => props.theme.secondaryColor};
					margin-bottom: 0.4rem;
				}

				textarea {
					font-size: 1rem;
					width: 100%;
					background: ${props => props.theme.tertiaryColor2};
					border: none;
					font-family: ${props => props.theme.font};
					color: ${props => props.theme.primaryColor};
				}
			}
		}
	}
	@media screen and (max-width: 760px) {
		.flex-wrapper {
			display: block;
		}
	}
`;

const EditProfile = () => {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { user } = useAuth();

	useEffect(() => {
		const fetchProfile = async () => {
		  try {
			// Add debugging
			console.log("EditProfile: Current user object:", user);
			
			if (user && user.id) {
			  console.log("EditProfile: Using user id:", user.id);
			  const response = await userAPI.getUserProfile(user.id);
			  console.log("EditProfile: Raw profile response:", response);
			  
			  // Extract user data from the nested response structure (same as Profile.js)
			  let profileData;
			  if (response && response.data && response.data.user) {
				// Backend structure: { status: "success", data: { user: {...} } }
				profileData = response.data.user;
			  } else if (response && response.user) {
				// Alternative structure: { user: {...} }
				profileData = response.user;
			  } else if (response && response.data) {
				// Direct data: { data: {...} }
				profileData = response.data;
			  } else if (response && typeof response === 'object' && response.id) {
				// Direct user object
				profileData = response;
			  } else {
				console.error("EditProfile: Invalid profile data structure:", response);
				setError("Invalid profile data received");
				return;
			  }

			  console.log("EditProfile: Extracted profile data:", profileData);
			  
			  // Validate that we received valid profile data
			  if (!profileData || typeof profileData !== 'object') {
				console.error("EditProfile: Invalid profile data received:", profileData);
				setError("Invalid profile data received");
				return;
			  }

			  // Map backend fields to frontend expected fields for the edit form
			  const mappedProfile = {
				...profileData,
				firstname: profileData.username || profileData.fullname || profileData.displayName || '',
				handle: profileData.username || profileData.handle || profileData.id || '',
				avatar: profileData.image || profileData.avatar || '',
				bio: profileData.bio || '',
				coverPhoto: profileData.coverPhoto || '',
				location: profileData.location || '',
				website: profileData.website || '',
				dob: profileData.dob || '',
				email: profileData.email || ''
			  };

			  console.log("EditProfile: Mapped profile for editing:", mappedProfile);
			  setProfile(mappedProfile);
			} else {
			  console.log("EditProfile: User or user.id is missing:", user);
			  setError("User information not available");
			}
		  } catch (err) {
			console.error("EditProfile: Error fetching profile:", err);
			setError(err.response?.data?.error || "Failed to load profile");
		  } finally {
			setLoading(false);
		  }
		};
	  
		fetchProfile();
	  }, [user]);

	if (loading) return <Loader />;
	if (error) return <div>{error}</div>;
	if (!profile) return <div>Profile not found</div>;

	return (
		<Wrapper>
			<Header>Edit Profile</Header>
			<div className="flex-wrapper">
				<EditProfileForm profile={profile} />
			</div>
		</Wrapper>
	);
};

export default EditProfile;
