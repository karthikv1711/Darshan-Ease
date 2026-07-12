import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios base URL
  axios.defaults.baseURL = 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile(token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      if (response.data.success) {
        const userData = response.data.data;
        localStorage.setItem('token', userData.token);
        setToken(userData.token);
        setUser({
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          role: userData.role
        });
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Server connection error. Please make sure MongoDB and backend are running.'
      };
    }
  };

  const register = async (name, email, password, phone, address, role) => {
    try {
      const response = await axios.post('/auth/register', { name, email, password, phone, address, role });
      if (response.data.success) {
        const userData = response.data.data;
        localStorage.setItem('token', userData.token);
        setToken(userData.token);
        setUser({
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          role: userData.role
        });
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Server connection error. Please make sure MongoDB and backend are running.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      if (response.data.success) {
        const userData = response.data.data;
        setUser({
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          role: userData.role
        });
        if (userData.token) {
          localStorage.setItem('token', userData.token);
          setToken(userData.token);
        }
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile.'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
