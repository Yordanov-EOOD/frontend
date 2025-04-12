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
  const { handle } = useParams();
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user profile
        const profileData = await userAPI.getUserProfile(handle);
        setProfile(profileData);
        
        // Fetch user's tweets
        const userTweets = await tweetAPI.getUserTweets(profileData.id);
        setTweets(userTweets);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [handle]);

  if (loading) return <Loader />;

  if (error || !profile) {
    return <CustomResponse text="User not found or an error occurred" />;
  }

  return (
    <Wrapper>
      <Header>
        <div className="profile-top">
          <span>{profile.fullname}</span>
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