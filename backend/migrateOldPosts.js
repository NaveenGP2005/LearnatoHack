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

const migrateOldPosts = async () => {
  try {
    console.log("🔄 Starting migration of old posts...\n");

    // Find all posts with string author field
    const oldPosts = await Post.find({
      $or: [
        { author: { $type: "string" } },
        { "replies.author": { $type: "string" } },
      ],
    }).lean();

    console.log(`📊 Found ${oldPosts.length} posts to migrate\n`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const post of oldPosts) {
      try {
        const updates = {};

        // Fix main author field if it's a string
        if (typeof post.author === "string") {
          updates.author = null;
          updates.authorName = post.author;
          updates.isAnonymous = post.author === "Anonymous";
        }

        // Fix replies with string author
        if (post.replies && post.replies.length > 0) {
          const fixedReplies = post.replies.map((reply) => {
            if (typeof reply.author === "string") {
              return {
                ...reply,
                author: null,
                authorName: reply.author || "Anonymous",
                isAnonymous: !reply.author || reply.author === "Anonymous",
              };
            }
            return reply;
          });
          updates.replies = fixedReplies;
        }

        // Update votedBy if it doesn't exist
        if (!post.votedBy) {
          updates.votedBy = [];
        }

        // Add other missing fields
        if (post.views === undefined) updates.views = 0;
        if (post.isResolved === undefined) updates.isResolved = false;

        await Post.updateOne({ _id: post._id }, { $set: updates });

        migratedCount++;
        console.log(`✅ Migrated post: ${post.title.substring(0, 50)}...`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating post ${post._id}:`, error.message);
      }
    }

    console.log(`\n✨ Migration complete!`);
    console.log(`✅ Successfully migrated: ${migratedCount} posts`);
    console.log(`❌ Failed: ${errorCount} posts`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

// Run migration
migrateOldPosts();
