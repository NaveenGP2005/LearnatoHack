const Post = require("../models/Post");
const User = require("../models/User");
const {
  extractTags,
  findSimilarPosts,
  getRelatedQuestions,
  rankSearchResults,
} = require("../utils/aiHelper");

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res) => {
  try {
    const { sortBy = "votes", order = "desc", search } = req.query;

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    let posts = await Post.find(query)
      .populate("author", "username avatar reputation")
      .populate("resolvedBy", "username")
      .select("-__v");

    // Use AI ranking for search results
    if (search) {
      // rankSearchResults already returns plain objects
      const rankedPosts = rankSearchResults(search, posts);
      
      // Add user vote status if authenticated
      if (req.user) {
        posts = rankedPosts.map((post) => {
          // Find the original mongoose document to check hasVoted
          const originalPost = posts.find(p => p._id.toString() === post._id.toString());
          return {
            ...post,
            hasVoted: originalPost ? originalPost.hasUserVoted(req.user._id) : false,
          };
        });
      } else {
        posts = rankedPosts;
      }
    } else {
      // Regular sorting
      const sortOptions = {};
      if (sortBy === "votes") {
        sortOptions.votes = order === "desc" ? -1 : 1;
        sortOptions.createdAt = -1;
      } else if (sortBy === "date") {
        sortOptions.createdAt = order === "desc" ? -1 : 1;
      }

      posts = posts.sort((a, b) => {
        for (const key in sortOptions) {
          const aVal = a[key];
          const bVal = b[key];
          if (aVal !== bVal) {
            return sortOptions[key] === 1 ? aVal - bVal : bVal - aVal;
          }
        }
        return 0;
      });

      // Add user vote status if authenticated
      if (req.user) {
        posts = posts.map((post) => ({
          ...post.toObject(),
          hasVoted: post.hasUserVoted(req.user._id),
        }));
      }
    }

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
    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar reputation")
      .populate("resolvedBy", "username")
      .populate("replies.author", "username avatar")
      .select("-__v");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Increment views
    await post.incrementViews();

    // Get related questions using AI
    const allPosts = await Post.find({ _id: { $ne: post._id } }).limit(50);
    const relatedQuestions = getRelatedQuestions(post, allPosts, 5);

    // Check if user voted
    let hasVoted = false;
    if (req.user) {
      hasVoted = post.hasUserVoted(req.user._id);
    }

    res.status(200).json({
      success: true,
      data: {
        ...post.toObject(),
        hasVoted,
        relatedQuestions,
      },
    });
  } catch (error) {
    console.error("Error fetching post:", error);

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
// @access  Private/Optional Auth
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, isAnonymous } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    // Check for similar posts (duplicate detection)
    const recentPosts = await Post.find().sort({ createdAt: -1 }).limit(100);
    const similarPosts = findSimilarPosts(title, content, recentPosts, 0.85);

    if (similarPosts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A very similar question already exists",
        similarPost: similarPosts[0].post,
        similarity: similarPosts[0].similarity,
      });
    }

    // Auto-generate tags using AI
    const aiTags = extractTags(`${title} ${content}`, 5);

    // Prepare post data
    const postData = {
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      aiTags,
      isAnonymous: isAnonymous || false,
    };

    // Set author based on authentication and anonymous choice
    if (req.user && !isAnonymous) {
      postData.author = req.user._id;
      postData.authorName = req.user.username;
      // Increment user's post count and reputation
      await req.user.incrementPostCount();
      await req.user.updateReputation(5); // +5 for posting
    } else {
      postData.authorName = "Anonymous";
    }

    const post = await Post.create(postData);

    // Populate author details
    await post.populate("author", "username avatar reputation");

    // Emit Socket.io event for real-time update
    const io = req.app.get("socketio");
    if (io) {
      io.to("forum").emit("newPost", post);
    }

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
      aiSuggestions: {
        tags: aiTags,
      },
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
// @access  Private/Optional Auth
exports.addReply = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;

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

    // Prepare reply data
    const replyData = {
      content: content.trim(),
      isAnonymous: isAnonymous || false,
    };

    // Set author based on authentication and anonymous choice
    if (req.user && !isAnonymous) {
      replyData.author = req.user._id;
      replyData.authorName = req.user.username;
      // Increment user's reply count and reputation
      await req.user.incrementReplyCount();
      await req.user.updateReputation(2); // +2 for replying
    } else {
      replyData.authorName = "Anonymous";
    }

    // Add reply using model method
    await post.addReply(replyData);

    // Populate the new reply's author
    await post.populate("replies.author", "username avatar");

    // Emit Socket.io event for real-time update
    const io = req.app.get("socketio");
    if (io) {
      io.to("forum").emit("newReply", { postId: req.params.id, post });
    }

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
// @access  Private (requires authentication to prevent duplicate votes)
exports.upvotePost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to vote",
      });
    }

    // Check if post exists and if user already voted
    const post = await Post.findById(req.params.id).select(
      "_id author votes votedBy"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user already voted
    const hasVoted = post.votedBy.some(
      (voterId) => voterId && voterId.toString() === req.user._id.toString()
    );

    if (hasVoted) {
      return res.status(400).json({
        success: false,
        message: "You have already voted on this post",
      });
    }

    // Update post with atomic operation (avoids validation issues)
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { votes: 1 },
        $push: { votedBy: req.user._id },
      },
      { new: true, select: "_id votes votedBy author" }
    );

    // Give reputation to post author
    if (updatedPost.author) {
      const author = await User.findById(updatedPost.author);
      if (author) {
        await author.updateReputation(1); // +1 for receiving upvote
      }
    }

    // Emit Socket.io event for real-time update
    const io = req.app.get("socketio");
    if (io) {
      io.to("forum").emit("postUpvoted", {
        postId: req.params.id,
        votes: updatedPost.votes,
      });
    }

    res.status(200).json({
      success: true,
      message: "Post upvoted successfully",
      data: {
        _id: updatedPost._id,
        votes: updatedPost.votes,
        hasVoted: true,
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

    // Emit Socket.io event for real-time update
    const io = req.app.get("socketio");
    if (io) {
      io.to("forum").emit("postAnswered", { postId: req.params.id, post });
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
