import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token is valid
          await apiClient.get('/auth/verify');
          setUser(JSON.parse(storedUser));
        } catch (err) {
          // Clear invalid tokens/data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await apiClient.post('/auth/login', credentials);
      const { accessToken, user: userData } = response.data;
      
      if (accessToken && userData) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { accessToken, user: userData };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
      throw err;
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
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
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