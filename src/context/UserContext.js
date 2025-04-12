// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { userAPI } from '../api';
import { useAuth } from './AuthContext';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Only fetch users when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getUsers();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      setLoading(false);
    }
  };

  const getUserProfile = async (handle) => {
    setLoading(true);
    try {
      const profile = await userAPI.getUserProfile(handle);
      setCurrentProfile(profile);
      setLoading(false);
      return profile;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user profile');
      setLoading(false);
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const updatedProfile = await userAPI.updateProfile(profileData);
      setCurrentProfile(updatedProfile);
      setLoading(false);
      return updatedProfile;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      setLoading(false);
      throw err;
    }
  };

  const followUser = async (id) => {
    try {
      await userAPI.followUser(id);
      // Update the users list with the updated following status
      setUsers(users.map(user => {
        if (user.id === id) {
          return { ...user, isFollowing: true };
        }
        return user;
      }));
      
      // Update current profile if it matches the followed user
      if (currentProfile && currentProfile.id === id) {
        setCurrentProfile({
          ...currentProfile,
          isFollowing: true,
          followersCount: currentProfile.followersCount + 1
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to follow user');
      throw err;
    }
  };

  const unfollowUser = async (id) => {
    try {
      await userAPI.unfollowUser(id);
      // Update the users list with the updated following status
      setUsers(users.map(user => {
        if (user.id === id) {
          return { ...user, isFollowing: false };
        }
        return user;
      }));
      
      // Update current profile if it matches the unfollowed user
      if (currentProfile && currentProfile.id === id) {
        setCurrentProfile({
          ...currentProfile,
          isFollowing: false,
          followersCount: currentProfile.followersCount - 1
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unfollow user');
      throw err;
    }
  };

  const searchUsers = async (term) => {
    setLoading(true);
    try {
      const results = await userAPI.searchUsers(term);
      setLoading(false);
      return results;
    } catch (err) {
      setError(err.response?.data?.error || 'User search failed');
      setLoading(false);
      throw err;
    }
  };

  const value = {
    users,
    currentProfile,
    loading,
    error,
    fetchUsers,
    getUserProfile,
    updateProfile,
    followUser,
    unfollowUser,
    searchUsers
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsers = () => {
    const context = React.useContext(UserContext);
    if (context === undefined) {
      throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
};