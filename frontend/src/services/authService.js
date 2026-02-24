import api from './api';

/**
 * Authentication service for parish administrators
 */
const authService = {
  /**
   * Login with email and password
   * @param {string} email - Parish admin email
   * @param {string} password - Parish admin password
   * @returns {Promise<{access_token: string, parish_id: number, parish_name: string}>}
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, parish_id, parish_name, is_master_admin } = response.data;

    // Store auth data in sessionStorage
    sessionStorage.setItem('auth_token', access_token);
    sessionStorage.setItem('parish_id', parish_id);
    sessionStorage.setItem('parish_name', parish_name);
    sessionStorage.setItem('is_master_admin', is_master_admin.toString());

    return response.data;
  },

  /**
   * Logout and clear all auth data
   */
  logout: () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('parish_id');
    sessionStorage.removeItem('parish_name');
    sessionStorage.removeItem('is_master_admin');
  },

  /**
   * Get stored JWT token
   * @returns {string|null}
   */
  getToken: () => {
    return sessionStorage.getItem('auth_token');
  },

  /**
   * Get stored parish ID
   * @returns {number|null}
   */
  getParishId: () => {
    const id = sessionStorage.getItem('parish_id');
    return id ? parseInt(id, 10) : null;
  },

  /**
   * Get stored parish name
   * @returns {string|null}
   */
  getParishName: () => {
    return sessionStorage.getItem('parish_name');
  },

  /**
   * Get master admin status
   * @returns {boolean}
   */
  getIsMasterAdmin: () => {
    const value = sessionStorage.getItem('is_master_admin');
    return value === 'true';
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!sessionStorage.getItem('auth_token');
  },

  register: async (registrationData) => {
    const response = await api.post('/auth/register', registrationData);
    return response.data;
  },
};

export default authService;
