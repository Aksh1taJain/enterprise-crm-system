import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Sales Representative';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Persistent Login validation
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('leadsphere_token');
      const savedUser = localStorage.getItem('leadsphere_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        
        try {
          // Verify token against backend
          const response = await api.get('/auth/me');
          setUser(response.data);
          localStorage.setItem('leadsphere_user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Failed to verify session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: userToken, ...userData } = response.data;
      
      setToken(userToken);
      setUser(userData);
      
      localStorage.setItem('leadsphere_token', userToken);
      localStorage.setItem('leadsphere_user', JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token: userToken, ...userData } = response.data;
      
      setToken(userToken);
      setUser(userData);
      
      localStorage.setItem('leadsphere_token', userToken);
      localStorage.setItem('leadsphere_user', JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('leadsphere_token');
    localStorage.removeItem('leadsphere_user');
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
