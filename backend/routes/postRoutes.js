const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  addReply,
  upvotePost,
  markAsAnswered,
  deletePost,
} = require("../controllers/postController");
const { protect, optionalAuth } = require("../middleware/auth");

// Post routes
router.route("/").get(optionalAuth, getAllPosts).post(optionalAuth, createPost);

router.route("/:id").get(optionalAuth, getPostById).delete(protect, deletePost);

// Reply route (optional auth - can post as anonymous or logged in)
router.post("/:id/reply", optionalAuth, addReply);

// Upvote route (requires auth to prevent duplicate votes)
router.post("/:id/upvote", protect, upvotePost);

// Mark as answered route (requires auth)
router.patch("/:id/answered", protect, markAsAnswered);

module.exports = router;
