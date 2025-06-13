import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Skip verification if we've already attempted it in this session
      if (verificationAttempted) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token is valid
          await apiClient.get('/auth/verify');
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error("Token verification failed:", err);
          // Clear invalid tokens/data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      // Mark that we've attempted verification
      setVerificationAttempted(true);
      setLoading(false);
    };

    initAuth();
  }, [verificationAttempted]);

  const login = async (credentials) => {
    try {
      setError(null);
      console.log("Sending login request with:", { email: credentials.email });
      
      const response = await apiClient.post('/auth/login', credentials);
      console.log("Login response:", response.data);
      
      const { accessToken, user: userData } = response.data;
      
      if (!accessToken) {
        console.error("Missing access token in response");
        throw new Error('Missing access token in server response');
      }
      
      if (!userData) {
        console.error("Missing user data in response");
        throw new Error('Missing user data in server response');
      }
      
      // Store authentication data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { accessToken, user: userData };
    } catch (err) {
      console.error("Login error:", err);
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw err; // Re-throw for component handling
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await apiClient.post('/register', userData);
      const { accessToken, user: newUser } = response.data;
      
      if (accessToken && newUser) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        return { accessToken, user: newUser };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setVerificationAttempted(false); // Reset verification state on logout
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;