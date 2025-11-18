'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, authApi, getErrorMessage } from '@/lib/api';
import { getToken, setToken, removeToken, isTokenExpired } from '@/lib/auth';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token and restore user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();

      if (!token || isTokenExpired()) {
        removeToken();
        setLoading(false);
        return;
      }

      try {
        // Restore user from token
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to restore user session:', err);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credential: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const response = await authApi.googleLogin(credential);

      // Store token in localStorage
      setToken(response.access_token);

      // Set user state
      setUser(response.user);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
