/**
 * API Service Layer
 * Handles all communication with the backend API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw {
      status: response.status,
      message: data.detail || data.message || 'An error occurred',
      data
    };
  }
  
  return data;
};

// Helper function to get authorization header
const getAuthHeader = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

export const api = {
  // ============================================
  // AUTHENTICATION ENDPOINTS
  // ============================================
  auth: {
    /**
     * Register a new user
     */
    register: async (email, password, fullName) => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName
        })
      });
      return handleResponse(response);
    },

    /**
     * Login with email and password
     */
    login: async (email, password) => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      });
      return handleResponse(response);
    },

    /**
     * Get current user profile
     */
    getProfile: async (token) => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: getAuthHeader(token)
      });
      return handleResponse(response);
    },

    /**
     * Update user profile
     */
    updateProfile: async (token, data) => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'PATCH',
        headers: getAuthHeader(token),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    }
  },

  // ============================================
  // ITEMS ENDPOINTS
  // ============================================
  items: {
    /**
     * Report a lost item
     */
    reportLost: async (token, formData) => {
      const response = await fetch(`${API_URL}/api/items/lost`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData // FormData object
      });
      return handleResponse(response);
    },

    /**
     * Report a found item
     */
    reportFound: async (token, formData) => {
      const response = await fetch(`${API_URL}/api/items/found`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData // FormData object
      });
      return handleResponse(response);
    },

    /**
     * List all items with optional filters
     */
    list: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.page) params.append('page', filters.page);
      if (filters.size) params.append('size', filters.size || 50);

      const response = await fetch(
        `${API_URL}/api/items/?${params.toString()}`
      );
      return handleResponse(response);
    },

    /**
     * Search items by text query
     */
    search: async (query, filters = {}) => {
      const params = new URLSearchParams({ q: query });
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.page) params.append('page', filters.page);
      if (filters.size) params.append('size', filters.size || 50);

      const response = await fetch(
        `${API_URL}/api/items/search?${params.toString()}`
      );
      return handleResponse(response);
    },

    /**
     * Get item details by ID
     */
    getById: async (itemId) => {
      const response = await fetch(`${API_URL}/api/items/${itemId}`);
      return handleResponse(response);
    },

    /**
     * Get AI match result for an item
     */
    getMatchResult: async (itemId) => {
      const response = await fetch(`${API_URL}/api/items/${itemId}/match-result`);
      return handleResponse(response);
    },

    /**
     * Delete an item
     */
    delete: async (token, itemId) => {
      const response = await fetch(`${API_URL}/api/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeader(token)
      });
      return handleResponse(response);
    }
  },

  // ============================================
  // CLAIMS ENDPOINTS
  // ============================================
  claims: {
    /**
     * Submit a claim on an item
     */
    submit: async (token, itemId) => {
      const response = await fetch(`${API_URL}/api/claims/`, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify({ item_id: itemId })
      });
      return handleResponse(response);
    },

    /**
     * List all claims (admin only)
     */
    list: async (token) => {
      const response = await fetch(`${API_URL}/api/claims/`, {
        headers: getAuthHeader(token)
      });
      return handleResponse(response);
    },

    /**
     * Get claim details by ID
     */
    getById: async (token, claimId) => {
      const response = await fetch(`${API_URL}/api/claims/${claimId}`, {
        headers: getAuthHeader(token)
      });
      return handleResponse(response);
    },

    /**
     * Approve a claim (admin only)
     */
    approve: async (token, claimId) => {
      const response = await fetch(`${API_URL}/api/claims/${claimId}/approve`, {
        method: 'PATCH',
        headers: getAuthHeader(token)
      });
      return handleResponse(response);
    },

    /**
     * Reject a claim (admin only)
     */
    reject: async (token, claimId) => {
      const response = await fetch(`${API_URL}/api/claims/${claimId}/reject`, {
        method: 'PATCH',
        headers: getAuthHeader(token)
      });
      return handleResponse(response);
    },

    /**
     * Mark item as returned (admin only)
     */
    return: async (token, claimId) => {
      const response = await fetch(`${API_URL}/api/claims/${claimId}/return`, {
        method: 'PATCH',
        headers: getAuthHeader(token)
      });
      return handleResponse(response);
    }
  },

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================
  admin: {
    /**
     * Get system statistics
     */
    getStats: async (token) => {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: getAuthHeader(token)
      });
      return handleResponse(response);
    },

    /**
     * Get items by status
     */
    getItemsByStatus: async (token, status, page = 1) => {
      const response = await fetch(
        `${API_URL}/api/admin/items/status/${status}?page=${page}`,
        { headers: getAuthHeader(token) }
      );
      return handleResponse(response);
    },

    /**
     * Get pending claims
     */
    getPendingClaims: async (token, page = 1) => {
      const response = await fetch(
        `${API_URL}/api/admin/claims/pending?page=${page}`,
        { headers: getAuthHeader(token) }
      );
      return handleResponse(response);
    },

    /**
     * Get top matches by score
     */
    getTopMatches: async (token, limit = 10) => {
      const response = await fetch(
        `${API_URL}/api/admin/matches/top?limit=${limit}`,
        { headers: getAuthHeader(token) }
      );
      return handleResponse(response);
    }
  }
};
