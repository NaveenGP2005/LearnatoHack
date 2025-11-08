const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUser,
  markPostResolved,
  deletePost,
  getModerationSuggestions,
  getAnalytics,
} = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");

// Protect all routes and restrict to admin/moderator
router.use(protect);
router.use(restrictTo("admin", "moderator"));

// Dashboard & Analytics
router.get("/stats", getDashboardStats);
router.get("/analytics", getAnalytics);
router.get("/moderation", getModerationSuggestions);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:id", restrictTo("admin"), updateUser);

// Post Moderation
router.put("/posts/:id/resolve", markPostResolved);
router.delete("/posts/:id", restrictTo("admin"), deletePost);

module.exports = router;
