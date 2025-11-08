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
    type: String,
    required: [true, "Author name is required"],
    trim: true,
    default: "Anonymous",
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
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      default: "Anonymous",
    },
    votes: {
      type: Number,
      default: 0,
      min: 0,
    },
    replies: [replySchema],
    isAnswered: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
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

// Method to upvote
postSchema.methods.upvote = function () {
  this.votes += 1;
  return this.save();
};

// Ensure virtuals are included in JSON
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
