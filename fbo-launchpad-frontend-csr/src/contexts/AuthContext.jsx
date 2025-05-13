import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getStoredToken, getMyPermissions } from '../services/authService';
import { decodeJWT } from '../utils/jwt';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  const fetchUserPermissions = async () => {
    const token = getStoredToken();
    if (!token) {
      setPermissions([]);
      return;
    }
    try {
      const fetchedPermissions = await getMyPermissions();
      setPermissions(fetchedPermissions);
    } catch (error) {
      console.error('AuthContext: Failed to fetch permissions', error);
      setPermissions([]);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredToken();
      if (token) {
        const decoded = decodeJWT(token);
        if (decoded) {
          setIsAuthenticated(true);
          setUser(decoded);
          await fetchUserPermissions();
        } else {
          logoutUser();
          setIsAuthenticated(false);
          setUser(null);
          setPermissions([]);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setPermissions([]);
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      setIsAuthenticated(true);
      const decoded = decodeJWT(data.token);
      if (decoded) {
        setUser(decoded);
      } else {
        setUser(null);
      }
      await fetchUserPermissions();
      return data;
    } catch (error) {
      setPermissions([]);
      throw error;
    }
  };

  const logout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
  };

  const hasPermission = (permissionName) => {
    if (loading) return false;
    return permissions.includes(permissionName);
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
        logout,
        permissions,
        hasPermission
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