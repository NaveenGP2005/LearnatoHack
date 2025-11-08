const Post = require("../models/Post");

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res) => {
  try {
    const { sortBy = "votes", order = "desc", search } = req.query;

    // Build query
    let query = {};
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    const sortOptions = {};
    if (sortBy === "votes") {
      sortOptions.votes = order === "desc" ? -1 : 1;
      sortOptions.createdAt = -1; // Secondary sort
    } else if (sortBy === "date") {
      sortOptions.createdAt = order === "desc" ? -1 : 1;
    }

    const posts = await Post.find(query).sort(sortOptions).select("-__v");

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select("-__v");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);

    // Handle invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error: error.message,
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Public
exports.createPost = async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      author: author?.trim() || "Anonymous",
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error creating post:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message,
    });
  }
};

// @desc    Add reply to post
// @route   POST /api/posts/:id/reply
// @access  Public
exports.addReply = async (req, res) => {
  try {
    const { content, author } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Add reply using model method
    await post.addReply({
      content: content.trim(),
      author: author?.trim() || "Anonymous",
    });

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error adding reply:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    // Handle invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error adding reply",
      error: error.message,
    });
  }
};

// @desc    Upvote a post
// @route   POST /api/posts/:id/upvote
// @access  Public
exports.upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Upvote using model method
    await post.upvote();

    res.status(200).json({
      success: true,
      message: "Post upvoted successfully",
      data: {
        _id: post._id,
        votes: post.votes,
      },
    });
  } catch (error) {
    console.error("Error upvoting post:", error);

    // Handle invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error upvoting post",
      error: error.message,
    });
  }
};

// @desc    Mark post as answered (optional feature)
// @route   PATCH /api/posts/:id/answered
// @access  Public (in production, should be instructor only)
exports.markAsAnswered = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isAnswered: true },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post marked as answered",
      data: post,
    });
  } catch (error) {
    console.error("Error marking post as answered:", error);

    // Handle invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating post",
      error: error.message,
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Public (in production, should be author/admin only)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Error deleting post:", error);

    // Handle invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message,
    });
  }
};
