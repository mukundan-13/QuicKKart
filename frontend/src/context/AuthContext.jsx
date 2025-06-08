import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosConfig'; // Import your configured axios instance
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const decodeToken = (jwtToken) => {
    if (jwtToken) {
      try {
        const decoded = jwtDecode(jwtToken);
        setUser({ email: decoded.sub, id: decoded.userId });
        setRoles(decoded.roles || []); 
        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('userRoles', JSON.stringify(decoded.roles || []));
      } catch (e) {
        console.error("Failed to decode token:", e);
        logout(); 
      }
    } else {
      logout(); 
    }
    setLoading(false);
  };

  useEffect(() => {
    decodeToken(token); 
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/authenticate', { email, password });
      const { token: jwtToken } = response.data;
      setToken(jwtToken);
      decodeToken(jwtToken); 
      return true; 
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
      throw error; 
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      const { token: jwtToken } = response.data; 
      setToken(jwtToken);
      decodeToken(jwtToken); 
      return true; 
    } catch (error) {
      console.error("Registration failed:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRoles([]);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRoles');
    setLoading(false);
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = roles.includes('ADMIN'); 

  return (
    <AuthContext.Provider value={{ user, token, roles, isAuthenticated, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);