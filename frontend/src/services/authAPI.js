import api from "./api";

// Set auth token in headers
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Initialize token from localStorage
const token = localStorage.getItem("token");
if (token) {
  setAuthToken(token);
}

export const authAPI = {
  // Register new user
  register: async (data) => {
    const response = await api.post("/auth/register", data);
    const { token } = response.data.data;
    setAuthToken(token);
    return response.data.data;
  },

  // Login user
  login: async (data) => {
    const response = await api.post("/auth/login", data);
    const { token } = response.data.data;
    setAuthToken(token);
    return response.data.data;
  },

  // Get current user
  getMe: async () => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
    const response = await api.get("/auth/me");
    return response.data.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put("/auth/profile", data);
    return response.data.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await api.put("/auth/password", data);
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async () => {
    const response = await api.get("/auth/leaderboard");
    return response.data.data;
  },

  // Logout (client-side only)
  logout: () => {
    setAuthToken(null);
    localStorage.removeItem("token");
  },
};

export const adminAPI = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data.data;
  },

  // Get analytics
  getAnalytics: async (timeRange = "7d") => {
    const response = await api.get("/admin/analytics", {
      params: { timeRange },
    });
    return response.data.data;
  },

  // Get moderation suggestions
  getModerationSuggestions: async () => {
    const response = await api.get("/admin/moderation");
    return response.data.data;
  },

  // Get all users
  getAllUsers: async (params = {}) => {
    const response = await api.get("/admin/users", { params });
    return response.data.data;
  },

  // Update user
  updateUser: async (userId, data) => {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data.data;
  },

  // Mark post as resolved
  markPostResolved: async (postId) => {
    const response = await api.put(`/admin/posts/${postId}/resolve`);
    return response.data.data;
  },

  // Delete post
  deletePost: async (postId) => {
    const response = await api.delete(`/admin/posts/${postId}`);
    return response.data;
  },
};

export { setAuthToken };
