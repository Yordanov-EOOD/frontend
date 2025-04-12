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
			console.log("Current user object:", user);
			
			if (user && user.authId) {
			  console.log("Using authId:", user.authId);
			  const profileData = await userAPI.getUserProfile(user.authId);
			  setProfile(profileData);
			} else {
			  console.log("User or authId is missing:", user);
			  setError("User information not available");
			}
		  } catch (err) {
			console.error("Error fetching profile:", err);
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
