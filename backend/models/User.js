const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    avatar: {
      type: String,
      default: function () {
        // Generate random avatar URL using DiceBear API
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.username}`;
      },
    },
    bio: {
      type: String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default: "",
    },
    reputation: {
      type: Number,
      default: 0,
    },
    postsCount: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to update reputation
userSchema.methods.updateReputation = function (points) {
  this.reputation += points;
  return this.save();
};

// Method to increment post count
userSchema.methods.incrementPostCount = function () {
  this.postsCount += 1;
  return this.save();
};

// Method to increment reply count
userSchema.methods.incrementReplyCount = function () {
  this.repliesCount += 1;
  return this.save();
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    username: this.username,
    avatar: this.avatar,
    bio: this.bio,
    reputation: this.reputation,
    postsCount: this.postsCount,
    repliesCount: this.repliesCount,
    role: this.role,
    createdAt: this.createdAt,
  };
};

// Static method to get leaderboard
userSchema.statics.getLeaderboard = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ reputation: -1 })
    .limit(limit)
    .select("username avatar reputation postsCount repliesCount");
};

const User = mongoose.model("User", userSchema);

module.exports = User;
