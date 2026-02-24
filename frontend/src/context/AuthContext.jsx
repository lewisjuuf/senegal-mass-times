import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import parishService from '../services/parishService';

const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * Manages authentication state for the entire application
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [parishInfo, setParishInfo] = useState(null);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Validate existing token on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = authService.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token is still valid by calling the API
        await parishService.getMyParish();
        setIsAuthenticated(true);
        setParishInfo({
          id: authService.getParishId(),
          name: authService.getParishName(),
        });
        setIsMasterAdmin(authService.getIsMasterAdmin());
      } catch {
        // Token is invalid or expired — clear everything
        authService.logout();
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  /**
   * Login user with email and password
   * @param {string} email - Parish admin email
   * @param {string} password - Parish admin password
   * @returns {Promise<Object>} Login response data
   */
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);

      setIsAuthenticated(true);
      setParishInfo({
        id: data.parish_id,
        name: data.parish_name,
      });
      setIsMasterAdmin(data.is_master_admin);

      return data;
    } catch (error) {
      // Clear any partial auth data
      logout();
      throw error;
    }
  };

  /**
   * Logout user and clear authentication state
   */
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setParishInfo(null);
    setIsMasterAdmin(false);
  };

  const value = {
    isAuthenticated,
    parishInfo,
    isMasterAdmin,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
