import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getStoredToken } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Development mode: Auto-login
    if (process.env.NODE_ENV === 'development') {
      setIsAuthenticated(true);
      setUser({ role: 'csr' });
      localStorage.setItem('accessToken', 'dev-token');
      setLoading(false);
      return;
    }

    const token = getStoredToken();
    if (token) {
      // For MVP, just check if token exists
      setIsAuthenticated(true);
      // TODO: Decode token to get user info or make API call to /me endpoint
      setUser({ role: 'csr' }); // Placeholder user info
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      setIsAuthenticated(true);
      // TODO: Set actual user data from token or API response
      setUser({ role: 'csr' });
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