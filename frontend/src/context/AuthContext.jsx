import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('telemed_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('telemed_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      
      const userData = {
        id: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        languagePreference: data.languagePreference
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem('telemed_token', data.token);
      localStorage.setItem('telemed_user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      const data = response.data;

      const userData = {
        id: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        languagePreference: data.languagePreference
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem('telemed_token', data.token);
      localStorage.setItem('telemed_user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please verify input fields.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('telemed_token');
    localStorage.removeItem('telemed_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        isPatient: user?.role === 'ROLE_PATIENT',
        isDoctor: user?.role === 'ROLE_DOCTOR',
        isCHW: user?.role === 'ROLE_CHW',
        isAdmin: user?.role === 'ROLE_ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
