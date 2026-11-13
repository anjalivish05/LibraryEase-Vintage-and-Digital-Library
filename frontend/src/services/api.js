/**
 * LibraryEase API Service Layer
 * Connects frontend to the FastAPI + SQLite backend.
 * Gracefully handles offline fallback to preserve a seamless user experience.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'libraryease_auth_token';
const USER_KEY = 'libraryease_user_profile';

export const api = {
  // Token management
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  },

  getStoredUser() {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setStoredUser(user) {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  },

  // Base HTTP Request Helper
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg = data?.detail || `API request failed with status ${res.status}`;
        const error = new Error(errorMsg);
        error.status = res.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Re-throw with status if known
      throw err;
    }
  },

  // System & Health
  async checkHealth() {
    return this.request('/health');
  },

  async getLibraryInfo() {
    return this.request('/info');
  },

  async getAnnouncements() {
    return this.request('/announcements');
  },

  // Authentication
  auth: {
    async login(email, password) {
      const res = await api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res?.access_token) {
        api.setToken(res.access_token);
        api.setStoredUser(res.user);
      }
      return res;
    },

    async adminLogin(email, password) {
      const res = await api.request('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res?.access_token) {
        api.setToken(res.access_token);
        api.setStoredUser(res.user);
      }
      return res;
    },

    async register(userData) {
      const res = await api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (res?.access_token) {
        api.setToken(res.access_token);
        api.setStoredUser(res.user);
      }
      return res;
    },

    async getMe() {
      const res = await api.request('/auth/me');
      if (res) {
        api.setStoredUser(res);
      }
      return res;
    },

    logout() {
      api.setToken(null);
      api.setStoredUser(null);
    }
  },

  // Books Catalog & AI
  books: {
    async getAll(params = {}) {
      const queryParts = [];
      if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.category && params.category !== 'All Categories') {
        queryParts.push(`category=${encodeURIComponent(params.category)}`);
      }
      if (params.include_inactive) {
        queryParts.push('include_inactive=true');
      }
      if (params.availableOnly) queryParts.push(`available_only=true`);
      if (params.limit) queryParts.push(`limit=${params.limit}`);

      const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
      return api.request(`/books${queryString}`);
    },

    async getCategories() {
      return api.request('/books/categories');
    },

    async getById(bookId) {
      return api.request(`/books/${bookId}`);
    },

    async searchAI(searchData) {
      return api.request('/books/ai-search', {
        method: 'POST',
        body: JSON.stringify(searchData)
      });
    },

    async create(bookData) {
      return api.request('/books', {
        method: 'POST',
        body: JSON.stringify(bookData)
      });
    },

    async update(bookId, bookData) {
      return api.request(`/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify(bookData)
      });
    },

    async delete(bookId) {
      return api.request(`/books/${bookId}`, {
        method: 'DELETE'
      });
    },

    async toggleStatus(bookId, isActive) {
      return api.request(`/books/${bookId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive })
      });
    }
  },

  // Mumbai Libraries
  libraries: {
    async getAll(params = {}) {
      const queryParts = [];
      if (params.locality) queryParts.push(`locality=${encodeURIComponent(params.locality)}`);
      if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
      return api.request(`/libraries${queryString}`);
    },

    async getById(id) {
      return api.request(`/libraries/${id}`);
    }
  },

  // AI Assistant Services
  ai: {
    async chat(chatData) {
      return api.request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify(chatData)
      });
    },

    async getStatus() {
      return api.request('/ai/status');
    }
  },

  // Borrowings
  borrowings: {
    async getMy() {
      return api.request('/borrowings/my');
    },

    async issueBook(payload) {
      return api.request('/borrowings/issue', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    async returnBook(recordId, returnInfo = {}) {
      return api.request(`/borrowings/${recordId}/return`, {
        method: 'POST',
        body: JSON.stringify(returnInfo)
      });
    },

    async renew(recordId) {
      return api.request(`/borrowings/${recordId}/renew`, {
        method: 'POST'
      });
    },

    async triggerScan() {
      return api.request('/reminders/scan', {
        method: 'POST'
      });
    }
  },

  // In-App Notifications
  notifications: {
    async getAll() {
      return api.request('/notifications');
    },

    async markRead(notifId) {
      return api.request(`/notifications/${notifId}/read`, {
        method: 'PUT'
      });
    },

    async markAllRead() {
      return api.request('/notifications/mark-all-read', {
        method: 'PUT'
      });
    }
  },

  // Feedback & Requests
  feedback: {
    async submit(feedbackData) {
      return api.request('/feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackData)
      });
    },

    async getMy() {
      return api.request('/feedback/my');
    }
  },

  bookRequests: {
    async submit(requestData) {
      return api.request('/book-requests', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
    },

    async getMy() {
      return api.request('/book-requests/my');
    },

    async getAll() {
      return api.request('/book-requests/all');
    },

    async updateStatus(reqId, statusData) {
      return api.request(`/book-requests/${reqId}/status`, {
        method: 'PUT',
        body: JSON.stringify(statusData)
      });
    }
  },

  // Librarian & Administrative Services

  // Dedicated Administrator Portal Services
  admin: {
    async getDashboardStats() {
      return api.request('/admin/dashboard-stats');
    },

    async getLibraries(params = {}) {
      const parts = [];
      if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.locality) parts.push(`locality=${encodeURIComponent(params.locality)}`);
      if (params.status) parts.push(`status_filter=${encodeURIComponent(params.status)}`);
      const q = parts.length ? `?${parts.join('&')}` : '';
      return api.request(`/admin/libraries${q}`);
    },

    async createLibrary(libraryData) {
      return api.request('/libraries', {
        method: 'POST',
        body: JSON.stringify(libraryData)
      });
    },

    async updateLibrary(libraryId, libraryData) {
      return api.request(`/libraries/${libraryId}`, {
        method: 'PUT',
        body: JSON.stringify(libraryData)
      });
    },

    async deleteLibrary(libraryId) {
      return api.request(`/libraries/${libraryId}`, {
        method: 'DELETE'
      });
    },

    async toggleLibraryStatus(libraryId, isActive) {
      return api.request(`/libraries/${libraryId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive })
      });
    },

    async getUsers(params = {}) {
      const parts = [];
      if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.role) parts.push(`role=${encodeURIComponent(params.role)}`);
      if (params.status) parts.push(`status_filter=${encodeURIComponent(params.status)}`);
      const q = parts.length ? `?${parts.join('&')}` : '';
      return api.request(`/admin/users${q}`);
    },

    async getUserDetails(userId) {
      return api.request(`/admin/users/${userId}/details`);
    },

    async toggleUserStatus(userId, isActive) {
      return api.request(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive })
      });
    }
  },

  librarian: {
    async getStats() {
      return api.request('/librarian/stats');
    },

    async getMembers() {
      return api.request('/librarian/members');
    },

    async getMemberBorrowings(memberId) {
      return api.request(`/librarian/members/${memberId}/borrowings`);
    },

    async getAllBorrowings(statusFilter = '') {
      const q = statusFilter && statusFilter !== 'all' ? `?status_filter=${statusFilter}` : '';
      return api.request(`/borrowings/all${q}`);
    }
  }
};

export default api;
