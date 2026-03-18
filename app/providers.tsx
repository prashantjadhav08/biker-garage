'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, setAuthToken, clearAuthToken } from '@/lib/auth';
import Navigation from '@/components/Navigation';
import Toast from '@/components/Toast';

interface AuthContextType {
  isAuth: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  const login = (username: string, password: string): boolean => {
    const { verifyAdmin } = require('@/lib/auth');
    if (verifyAdmin(username, password)) {
      setAuthToken();
      setIsAuth(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    clearAuthToken();
    setIsAuth(false);
  };

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout }}>
      {isAuth && <Navigation onLogout={logout} />}
      {children}
      {showToast && <Toast message={toastMessage} type={toastType} />}
    </AuthContext.Provider>
  );
}
