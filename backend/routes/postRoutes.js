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

// Post routes
router.route("/").get(getAllPosts).post(createPost);

router.route("/:id").get(getPostById).delete(deletePost);

// Reply route
router.post("/:id/reply", addReply);

// Upvote route
router.post("/:id/upvote", upvotePost);

// Mark as answered route
router.patch("/:id/answered", markAsAnswered);

module.exports = router;
