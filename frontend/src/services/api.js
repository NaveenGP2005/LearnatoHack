import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to all requests
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const postsAPI = {
  // Get all posts
  getAllPosts: (params = {}) => api.get("/posts", { params }),

  // Get single post
  getPost: (id) => api.get(`/posts/${id}`),

  // Create post
  createPost: (data) => api.post("/posts", data),

  // Add reply
  addReply: (postId, data) => api.post(`/posts/${postId}/reply`, data),

  // Upvote post
  upvotePost: (postId) => api.post(`/posts/${postId}/upvote`),

  // Mark as answered
  markAsAnswered: (postId) => api.patch(`/posts/${postId}/answered`),

  // Delete post
  deletePost: (postId) => api.delete(`/posts/${postId}`),

  // Get AI discussion summary
  getSummary: (postId) => api.get(`/posts/${postId}/summary`),

  // AI Assistant
  askAssistant: (question) => api.post("/posts/ai/assist", { question }),
};

export default api;
