import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Decode JWT payload without library
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromToken = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      api.removeToken();
      setUser(null);
      setLoading(false);
      return;
    }

    // Check expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      api.removeToken();
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await api.getProfile();
      setUser({
        id: profile.id,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        city: profile.city,
        role: profile.role,
      });
    } catch {
      // Token invalid or API down — use decoded token data as fallback
      setUser({
        id: decoded.sub || decoded.nameid,
        fullName: decoded.name || decoded.unique_name || '',
        role: decoded.role || '',
        phoneNumber: '',
        email: '',
        city: '',
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

   const login = async (email, password) => {
     const result = await api.login(email, password);
     api.setToken(result.token);
     localStorage.setItem('user_name', result.fullName);
     localStorage.setItem('user_id', result.userId);
     await loadUserFromToken();
     return result;
   };

  const register = async (data) => {
    const result = await api.register(data);
    api.setToken(result.token);
    localStorage.setItem('user_name', result.fullName);
    localStorage.setItem('user_id', result.userId);
    await loadUserFromToken();
    return result;
  };

  const logout = () => {
    api.removeToken();
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isSeller = user?.role === 'Seller' || user?.role === 'Admin';
  const isBuyer = user?.role === 'Buyer' || user?.role === 'Admin';
  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated, isSeller, isBuyer, isAdmin, loadUserFromToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
