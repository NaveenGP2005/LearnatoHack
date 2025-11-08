const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Reply content is required"],
    trim: true,
    minlength: [1, "Reply cannot be empty"],
    maxlength: [2000, "Reply cannot exceed 2000 characters"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  authorName: {
    type: String,
    default: "Anonymous",
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [10, "Content must be at least 10 characters"],
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    authorName: {
      type: String,
      default: "Anonymous",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    votes: {
      type: Number,
      default: 0,
      min: 0,
    },
    votedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [replySchema],
    isAnswered: {
      type: Boolean,
      default: false,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    aiTags: [
      {
        type: String,
        trim: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
postSchema.index({ votes: -1, createdAt: -1 });
postSchema.index({ title: "text", content: "text" });

// Virtual for reply count
postSchema.virtual("replyCount").get(function () {
  return this.replies.length;
});

// Method to add a reply
postSchema.methods.addReply = function (replyData) {
  this.replies.push(replyData);
  return this.save();
};

// Method to upvote (with user tracking)
postSchema.methods.upvote = function (userId) {
  // Check if user already voted
  if (userId && this.votedBy.includes(userId)) {
    throw new Error("User already voted on this post");
  }

  this.votes += 1;
  if (userId) {
    this.votedBy.push(userId);
  }
  return this.save();
};

// Method to remove upvote
postSchema.methods.removeUpvote = function (userId) {
  if (!userId || !this.votedBy.includes(userId)) {
    throw new Error("User hasn't voted on this post");
  }

  this.votes = Math.max(0, this.votes - 1);
  this.votedBy = this.votedBy.filter(
    (id) => id.toString() !== userId.toString()
  );
  return this.save();
};

// Method to check if user voted
postSchema.methods.hasUserVoted = function (userId) {
  if (!userId) return false;
  return this.votedBy.some((id) => id.toString() === userId.toString());
};

// Method to mark as resolved (admin only)
postSchema.methods.markResolved = function (adminId) {
  this.isResolved = true;
  this.resolvedBy = adminId;
  this.resolvedAt = new Date();
  return this.save();
};

// Method to increment views
postSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Ensure virtuals are included in JSON
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
