// src/components/Profile/Profile.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Header from "../Header";
import ProfileInfo from "./ProfileInfo";
import Tweet from "../Tweet/Tweet";
import Loader from "../Loader";
import { userAPI, tweetAPI } from "../../api";
import CustomResponse from "../CustomResponse";
import { useAuth } from "../../context/AuthContext";

const Wrapper = styled.div`
  padding-bottom: 5rem;

  .profile-top {
    display: flex;
    flex-direction: column;
    margin-left: 1rem;

    span.tweetsCount {
      margin-top: 0.1rem;
      color: ${(props) => props.theme.secondaryColor};
      font-size: 0.9rem;
    }
  }
`;

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Reset previous state when navigating
        setProfile(null);
        setTweets([]);
        
        console.log("Fetching profile for userId:", userId);
        
        // Validate userId before making API call
        if (!userId || userId === 'undefined' || userId === 'null') {
          console.error("Profile: Invalid userId provided:", userId);
          setError("Invalid user ID provided");
          return;
        }
        
        // Directly use userId (authUserId) for profile lookup
        const response = await userAPI.getUserProfile(userId);
        console.log("Profile data received:", response);
        
        // Extract user data from the nested response structure
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
          console.error("Profile: Invalid profile data structure:", response);
          setError("Invalid profile data received");
          return;
        }
        
        console.log("Extracted profile data:", profileData);
        
        // Validate that we received valid profile data
        if (!profileData || typeof profileData !== 'object') {
          console.error("Profile: Invalid profile data received:", profileData);
          setError("Invalid profile data received");
          return;
        }
        
        // Check if this is the current user's own profile
        const isSelf = currentUser && (
          currentUser.id === profileData.id ||
          currentUser.id === profileData.authUserId ||
          currentUser.authUserId === profileData.id ||
          currentUser.authUserId === profileData.authUserId ||
          userId === currentUser.id ||
          userId === currentUser.authUserId
        );
        
        // Set the isSelf flag on the profile data
        const enhancedProfile = {
          ...profileData,
          isSelf: isSelf,
          // Map backend fields to frontend expected fields
          handle: profileData.username || profileData.handle || profileData.id || 'unknown',
          fullname: profileData.username || profileData.fullname || profileData.displayName || 'Unknown User',
          avatar: profileData.image || profileData.avatar || '',
        };
        
        console.log("Enhanced profile with isSelf:", enhancedProfile);
        setProfile(enhancedProfile);
        
        // Fetch user's tweets using the authUserId
        if (profileData && (profileData.authUserId || profileData.id)) {
          try {
            const authUserId = profileData.authUserId || profileData.id;
            const userTweets = await tweetAPI.getUserTweets(authUserId);
            setTweets(Array.isArray(userTweets) ? userTweets : []);
          } catch (tweetError) {
            console.warn("Error fetching user tweets:", tweetError);
            setTweets([]); // Set empty array if tweets fail to load
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.error || err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a valid userId
    if (userId && userId !== 'undefined' && userId !== 'null') {
      fetchProfileData();
    } else {
      console.error("Profile: No valid userId provided:", userId);
      setError("No user ID provided");
      setLoading(false);
    }
  }, [userId, currentUser?.id, currentUser?.authUserId]); // Added currentUser dependencies

  if (loading) return <Loader />;

  if (error || !profile) {
    return <CustomResponse text="User not found or an error occurred" />;
  }

  return (
    <Wrapper>
      <Header>
        <div className="profile-top">
          <span>{profile.fullname || profile.username || 'Unknown User'}</span>
          <span className="tweetsCount">
            {tweets.length ? `${tweets.length} Tweets` : "No Tweets"}
          </span>
        </div>
      </Header>
      <ProfileInfo profile={profile} />
      {tweets.length > 0 ? (
        tweets.map((tweet) => <Tweet key={tweet.id} tweet={tweet} />)
      ) : null}
    </Wrapper>
  );
};

export default Profile;