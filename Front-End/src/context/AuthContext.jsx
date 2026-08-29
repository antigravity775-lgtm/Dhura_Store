import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const profile = await api.getProfile();
      setUser({
        id: profile.id,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        city: profile.city,
        address: profile.address,
        locationUrl: profile.locationUrl,
        role: profile.role,
      });
    } catch (err) {
      // Only log the user out on explicit authentication failures (401/403).
      // Network errors, 500s, or Prisma errors must NOT clear a valid session.
      const status = err?.status ?? err?.response?.status;
      if (status === 401 || status === 403) {
        setUser(null);
      }
      // For any other error, keep existing user state intact.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (phoneNumber, password) => {
    const result = await api.login(phoneNumber, password);
    setUser({
      id: result.userId,
      fullName: result.fullName,
      email: result.email,
      role: result.role,
      city: result.city,
      address: result.address,
      locationUrl: result.locationUrl,
    });
    localStorage.setItem('user_name', result.fullName);
    localStorage.setItem('user_id', result.userId);
    return result;
  };

  const register = async (data) => {
    const result = await api.register(data);
    setUser({
      id: result.userId,
      fullName: result.fullName,
      email: result.email,
      role: result.role,
      city: result.city,
      address: result.address,
      locationUrl: result.locationUrl,
    });
    localStorage.setItem('user_name', result.fullName);
    localStorage.setItem('user_id', result.userId);
    return result;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout failed on server', e);
    }
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isBuyer = user?.role === 'Buyer' || user?.role === 'Admin';
  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated, isBuyer, isAdmin, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
