import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'user' or 'admin'
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
      setUserType(res.data.type);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (tokenValue, userData, type) => {
    localStorage.setItem('token', tokenValue);
    setToken(tokenValue);
    setUser(userData);
    setUserType(type);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setUserType(null);
  };

  const isAdmin = () => userType === 'admin';
  const isUser = () => userType === 'user' || userType === 'organizer';

  return (
    <AuthContext.Provider value={{ user, userType, token, loading, login, logout, isAdmin, isUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
