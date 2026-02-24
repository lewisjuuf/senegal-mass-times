import api from './api';

/**
 * Parish service for managing parishes and mass times
 */
const parishService = {
  // ============ Public Endpoints ============

  /**
   * Get list of parishes with optional filtering
   * @param {Object} params - Query parameters
   * @param {string} params.city - Filter by city
   * @param {number} params.diocese_id - Filter by diocese ID
   * @returns {Promise<Array>}
   */
  getParishes: async (params = {}) => {
    const response = await api.get('/parishes', { params });
    return response.data;
  },

  /**
   * Get single parish by ID
   * @param {number} id - Parish ID
   * @returns {Promise<Object>}
   */
  getParishById: async (id) => {
    const response = await api.get(`/parishes/${id}`);
    return response.data;
  },

  /**
   * Find nearby parishes based on coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in kilometers (default: 10)
   * @returns {Promise<Array>}
   */
  getNearbyParishes: async (lat, lng, radius = 10) => {
    const response = await api.get(`/parishes/nearby/${lat}/${lng}`, {
      params: { radius_km: radius },
    });
    return response.data;
  },

  // ============ Admin Endpoints (require authentication) ============

  /**
   * Get current authenticated parish details
   * @returns {Promise<Object>}
   */
  getMyParish: async () => {
    const response = await api.get('/admin/parish');
    return response.data;
  },

  /**
   * Update parish information
   * @param {number} parishId - Parish ID
   * @param {Object} data - Parish data to update
   * @returns {Promise<Object>}
   */
  updateParish: async (parishId, data) => {
    const response = await api.put(`/admin/parishes/${parishId}`, data);
    return response.data;
  },

  /**
   * Add a new mass time
   * @param {number} parishId - Parish ID
   * @param {Object} massTime - Mass time data
   * @param {string} massTime.day_of_week - Day of week (Sunday, Monday, etc.)
   * @param {string} massTime.time - Time in HH:MM format
   * @param {string} massTime.language - Language (default: French)
   * @param {string} massTime.mass_type - Mass type (optional)
   * @param {string} massTime.notes - Notes (optional)
   * @returns {Promise<Object>}
   */
  addMassTime: async (parishId, massTime) => {
    const response = await api.post(
      `/admin/parishes/${parishId}/mass-times`,
      massTime
    );
    return response.data;
  },

  /**
   * Update an existing mass time
   * @param {number} parishId - Parish ID
   * @param {number} massTimeId - Mass time ID
   * @param {Object} massTime - Updated mass time data
   * @returns {Promise<Object>}
   */
  updateMassTime: async (parishId, massTimeId, massTime) => {
    const response = await api.put(
      `/admin/parishes/${parishId}/mass-times/${massTimeId}`,
      massTime
    );
    return response.data;
  },

  /**
   * Delete a mass time
   * @param {number} parishId - Parish ID
   * @param {number} massTimeId - Mass time ID
   * @returns {Promise<Object>}
   */
  deleteMassTime: async (parishId, massTimeId) => {
    const response = await api.delete(
      `/admin/parishes/${parishId}/mass-times/${massTimeId}`
    );
    return response.data;
  },

  // ============ News Endpoints ============

  /**
   * Get news for a specific parish (public)
   * @param {number} parishId - Parish ID
   * @returns {Promise<Array>}
   */
  getParishNews: async (parishId) => {
    const response = await api.get(`/parishes/${parishId}/news`);
    return response.data;
  },

  /**
   * Get current authenticated parish news (admin)
   * @returns {Promise<Array>}
   */
  getMyParishNews: async () => {
    const response = await api.get('/admin/parish/news');
    return response.data;
  },

  /**
   * Add a new news item
   * @param {number} parishId - Parish ID
   * @param {Object} news - News data
   * @param {string} news.title - News title
   * @param {string} news.content - News content
   * @param {string} news.category - Category (General, Event, Announcement)
   * @returns {Promise<Object>}
   */
  addNews: async (parishId, news) => {
    const response = await api.post(`/admin/parishes/${parishId}/news`, news);
    return response.data;
  },

  /**
   * Update an existing news item
   * @param {number} parishId - Parish ID
   * @param {number} newsId - News ID
   * @param {Object} news - Updated news data
   * @returns {Promise<Object>}
   */
  updateNews: async (parishId, newsId, news) => {
    const response = await api.put(
      `/admin/parishes/${parishId}/news/${newsId}`,
      news
    );
    return response.data;
  },

  /**
   * Delete a news item
   * @param {number} parishId - Parish ID
   * @param {number} newsId - News ID
   * @returns {Promise<Object>}
   */
  deleteNews: async (parishId, newsId) => {
    const response = await api.delete(
      `/admin/parishes/${parishId}/news/${newsId}`
    );
    return response.data;
  },

  // ============ Master Admin Endpoints ============

  /**
   * Get all parishes (Master Admin only)
   * @returns {Promise<Array>}
   */
  getAllParishes: async () => {
    const response = await api.get('/admin/master/parishes');
    return response.data;
  },

  /**
   * Create a new parish with admin credentials (Master Admin only)
   * @param {Object} parishData - Parish data including admin credentials
   * @returns {Promise<Object>}
   */
  createParish: async (parishData) => {
    const response = await api.post('/admin/master/parishes', parishData);
    return response.data;
  },

  /**
   * Update parish information (Master Admin only)
   * @param {number} parishId - Parish ID
   * @param {Object} data - Parish data to update
   * @returns {Promise<Object>}
   */
  updateParishAdmin: async (parishId, data) => {
    const response = await api.put(`/admin/master/parishes/${parishId}`, data);
    return response.data;
  },

  /**
   * Delete a parish (Master Admin only)
   * @param {number} parishId - Parish ID
   * @returns {Promise<Object>}
   */
  deleteParish: async (parishId) => {
    const response = await api.delete(`/admin/master/parishes/${parishId}`);
    return response.data;
  },

  /**
   * Update parish admin credentials (Master Admin only)
   * @param {number} parishId - Parish ID
   * @param {Object} credentials - {admin_email, admin_password}
   * @returns {Promise<Object>}
   */
  updateCredentials: async (parishId, credentials) => {
    const response = await api.put(
      `/admin/master/parishes/${parishId}/credentials`,
      credentials
    );
    return response.data;
  },

  getPendingRegistrations: async () => {
    const response = await api.get('/admin/master/pending');
    return response.data;
  },

  approveParish: async (parishId) => {
    const response = await api.put(`/admin/master/parishes/${parishId}/approve`);
    return response.data;
  },

  rejectParish: async (parishId) => {
    const response = await api.put(`/admin/master/parishes/${parishId}/reject`);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/admin/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

export default parishService;
