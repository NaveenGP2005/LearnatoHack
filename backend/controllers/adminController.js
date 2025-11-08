const Post = require("../models/Post");
const User = require("../models/User");
const {
  extractTags,
  findSimilarPosts,
  detectToxicity,
} = require("../utils/aiHelper");

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalReplies,
      resolvedPosts,
      unresolvedPosts,
      activeUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.aggregate([
        { $project: { replyCount: { $size: "$replies" } } },
        { $group: { _id: null, total: { $sum: "$replyCount" } } },
      ]),
      Post.countDocuments({ isResolved: true }),
      Post.countDocuments({ isResolved: false }),
      User.countDocuments({ isActive: true }),
    ]);

    // Get posts per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const postsPerDay = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top contributors
    const topContributors = await User.find({ isActive: true })
      .sort({ reputation: -1 })
      .limit(5)
      .select("username avatar reputation postsCount repliesCount");

    // Get trending tags
    const trendingTags = await Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get recent activity
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("author", "username avatar")
      .select("title author createdAt votes replies isResolved");

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalPosts,
          totalReplies: totalReplies[0]?.total || 0,
          resolvedPosts,
          unresolvedPosts,
          activeUsers,
          resolutionRate:
            totalPosts > 0 ? Math.round((resolvedPosts / totalPosts) * 100) : 0,
        },
        postsPerDay,
        topContributors,
        trendingTags,
        recentActivity: recentPosts,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const users = await User.find(filter)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-password");

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// @desc    Update user role or status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;

    const updateFields = {};
    if (role) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// @desc    Mark post as resolved
// @route   PUT /api/admin/posts/:id/resolve
// @access  Private/Admin
exports.markPostResolved = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await post.markResolved(req.user._id);

    // Emit Socket.io event
    const io = req.app.get("socketio");
    if (io) {
      io.to("forum").emit("postResolved", { postId: post._id, post });
    }

    res.status(200).json({
      success: true,
      message: "Post marked as resolved",
      data: post,
    });
  } catch (error) {
    console.error("Mark post resolved error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking post as resolved",
      error: error.message,
    });
  }
};

// @desc    Delete post (moderation)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await post.deleteOne();

    // Emit Socket.io event
    const io = req.app.get("socketio");
    if (io) {
      io.to("forum").emit("postDeleted", { postId: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message,
    });
  }
};

// @desc    Get moderation suggestions (AI-powered)
// @route   GET /api/admin/moderation
// @access  Private/Admin
exports.getModerationSuggestions = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("author", "username");

    const suggestions = [];

    // Check for duplicate posts
    for (let i = 0; i < posts.length; i++) {
      const similarPosts = findSimilarPosts(
        posts[i].title,
        posts[i].content,
        posts.slice(i + 1),
        0.8
      );

      if (similarPosts.length > 0) {
        suggestions.push({
          type: "duplicate",
          post: posts[i],
          similarTo: similarPosts[0].post,
          similarity: similarPosts[0].similarity,
        });
      }

      // Check for toxic content
      const toxicity = detectToxicity(`${posts[i].title} ${posts[i].content}`);
      if (toxicity.isToxic) {
        suggestions.push({
          type: "toxic",
          post: posts[i],
          toxicityScore: toxicity.confidence,
          toxicWordCount: toxicity.toxicWordCount,
        });
      }

      // Check for very low quality (short content, no engagement)
      if (
        posts[i].content.length < 50 &&
        posts[i].votes === 0 &&
        posts[i].replies.length === 0 &&
        new Date() - new Date(posts[i].createdAt) > 7 * 24 * 60 * 60 * 1000
      ) {
        suggestions.push({
          type: "low_quality",
          post: posts[i],
          reason: "Short content with no engagement after 7 days",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 20),
        totalFound: suggestions.length,
      },
    });
  } catch (error) {
    console.error("Get moderation suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating moderation suggestions",
      error: error.message,
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Post activity
    const postActivity = await Post.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          posts: { $sum: 1 },
          totalVotes: { $sum: "$votes" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Most active hours
    const activeHours = await Post.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Response time (time to first reply)
    const responseTimes = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "replies.0": { $exists: true },
        },
      },
      {
        $project: {
          responseTime: {
            $subtract: [
              { $arrayElemAt: ["$replies.createdAt", 0] },
              "$createdAt",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: "$responseTime" },
          minResponseTime: { $min: "$responseTime" },
          maxResponseTime: { $max: "$responseTime" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        timeRange,
        userGrowth,
        postActivity,
        activeHours,
        responseTimes: responseTimes[0] || {
          avgResponseTime: 0,
          minResponseTime: 0,
          maxResponseTime: 0,
        },
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message,
    });
  }
};
