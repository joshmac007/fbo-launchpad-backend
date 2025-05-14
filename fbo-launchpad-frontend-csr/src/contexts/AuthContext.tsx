import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, logoutUser, getStoredToken, getMyPermissions } from '../services/authService';
import { decodeJWT, CustomJwtPayload } from '../utils/jwt';

// Define types/interfaces

type Permission = string;

export interface AuthContextType { // Exporting for use in tests or other specific scenarios if needed
  isAuthenticated: boolean;
  user: CustomJwtPayload | null;
  login: (email: string, password: string) => Promise<any>; // Can be refined
  logout: () => void;
  permissions: Permission[];
  hasPermission: (permissionName: Permission) => boolean;
  loadingAuth: boolean; 
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<CustomJwtPayload | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const fetchUserPermissions = async () => {
    const token = getStoredToken();
    if (!token) {
      setPermissions([]);
      return;
    }
    try {
      const fetchedPermissions: Permission[] = await getMyPermissions();
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
        const decoded: CustomJwtPayload | null = decodeJWT(token);
        if (decoded) {
          setIsAuthenticated(true);
          setUser(decoded);
          await fetchUserPermissions();
        } else {
          // If token is invalid, effectively log out client-side state
          setIsAuthenticated(false);
          setUser(null);
          setPermissions([]);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setPermissions([]);
      }
      setLoadingAuth(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<any> => {
    try {
      const data = await loginUser(email, password); // data likely contains { token: string }
      setIsAuthenticated(true);
      const decoded: CustomJwtPayload | null = decodeJWT(data.token);
      setUser(decoded); // Set user, will be null if decodeJWT returns null
      await fetchUserPermissions(); // Fetch permissions after setting auth state
      return data;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setPermissions([]);
      throw error;
    }
  };

  const logout = (): void => {
    logoutUser(); // Call the service to invalidate token on backend / clear httpOnly cookies etc.
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
  };

  const hasPermission = (permissionName: Permission): boolean => {
    // The check `if (loadingAuth) return false;` could be re-evaluated.
    // If hasPermission is called while loadingAuth is true, it implies permissions aren't loaded yet.
    // Returning false is a safe default.
    if (loadingAuth) return false; 
    return permissions.includes(permissionName);
  };

  if (loadingAuth) {
    return null; 
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        permissions,
        hasPermission,
        loadingAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // This error is good, ensures AuthProvider is a parent.
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 