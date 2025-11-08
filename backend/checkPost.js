const mongoose = require("mongoose");
const Post = require("./models/Post");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

const checkPost = async () => {
  try {
    const post = await Post.findById("690ecd4b4a0acfe230ebf467");

    if (!post) {
      console.log("❌ Post not found");
      process.exit(0);
    }

    console.log("\n📝 Post Details:");
    console.log("Title:", post.title);
    console.log("Author Type:", typeof post.author);
    console.log("Author Value:", post.author);
    console.log("AuthorName:", post.authorName);
    console.log("IsAnonymous:", post.isAnonymous);
    console.log("VotedBy:", post.votedBy);

    if (post.replies && post.replies.length > 0) {
      console.log("\n💬 Replies:");
      post.replies.forEach((reply, i) => {
        console.log(`Reply ${i + 1}:`);
        console.log("  Author Type:", typeof reply.author);
        console.log("  Author Value:", reply.author);
        console.log("  AuthorName:", reply.authorName);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkPost();
