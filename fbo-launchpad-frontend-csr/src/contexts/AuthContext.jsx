import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getStoredToken } from '../services/authService';
import { decodeJWT } from '../utils/jwt';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setIsAuthenticated(true);
        // Store all user data from JWT without filtering specific fields
        setUser(decoded);
      } else {
        // Invalid token, force logout
        logoutUser();
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      setIsAuthenticated(true);
      const decoded = decodeJWT(data.token);
      if (decoded) {
        // Store all user data from JWT without filtering
        setUser(decoded);
      } else {
        setUser(null);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return null; // Or a loading spinner component
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 