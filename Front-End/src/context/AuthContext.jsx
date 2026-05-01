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
        role: profile.role,
      });
    } catch {
      // API call failed (e.g., 401 Unauthorized), so user is not logged in.
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    const result = await api.login(email, password);
    // Set user immediately from login result — don't depend on getProfile()
    // because the HttpOnly cookie may not be forwarded on the very next
    // cross-origin request in some browser/Vercel configurations.
    setUser({
      id: result.userId,
      fullName: result.fullName,
      email: result.email,
      role: result.role,
      city: result.city,
    });
    localStorage.setItem('user_name', result.fullName);
    localStorage.setItem('user_id', result.userId);
    // Sync full profile in background to refresh any extra fields
    checkAuthStatus().catch(() => {});
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
    });
    localStorage.setItem('user_name', result.fullName);
    localStorage.setItem('user_id', result.userId);
    checkAuthStatus().catch(() => {});
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
  const isSeller = user?.role === 'Seller' || user?.role === 'Admin';
  const isBuyer = user?.role === 'Buyer' || user?.role === 'Admin';
  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated, isSeller, isBuyer, isAdmin, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
