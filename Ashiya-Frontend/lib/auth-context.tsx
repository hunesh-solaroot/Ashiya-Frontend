'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from './auth';
import { User, LoginCredentials, RegisterCredentials, OAuthCredentials } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  loginWithMicrosoft: (token: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string, verificationCode: string) => Promise<void>;
  signupWithGoogle: (token: string) => Promise<void>;
  signupWithMicrosoft: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await authService.register(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const loginWithGoogle = async (token: string) => {
    try {
      const response = await authService.loginWithGoogle(token);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Google login failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const loginWithMicrosoft = async (token: string) => {
    try {
      const response = await authService.loginWithMicrosoft(token);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Microsoft login failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const loginWithPhone = async (phoneNumber: string, verificationCode: string) => {
    try {
      const response = await authService.loginWithPhone(phoneNumber, verificationCode);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Phone login failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signupWithGoogle = async (token: string) => {
    try {
      const response = await authService.signupWithGoogle(token);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Google signup failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signupWithMicrosoft = async (token: string) => {
    try {
      const response = await authService.signupWithMicrosoft(token);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Microsoft signup failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithPhone,
    signupWithGoogle,
    signupWithMicrosoft,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

