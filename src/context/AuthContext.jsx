import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lexilearn_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('lexilearn_token');
      localStorage.removeItem('lexilearn_refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data;
    localStorage.setItem('lexilearn_token', accessToken);
    localStorage.setItem('lexilearn_refresh_token', refreshToken);
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const response = await api.post('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data;
    localStorage.setItem('lexilearn_token', accessToken);
    localStorage.setItem('lexilearn_refresh_token', refreshToken);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('lexilearn_token');
    localStorage.removeItem('lexilearn_refresh_token');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
