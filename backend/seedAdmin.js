require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(
        "\n💡 You can use this account or update credentials in .env"
      );
      process.exit(0);
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@learnato.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

    const admin = await User.create({
      username: "admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      bio: "System Administrator",
    });

    console.log("✅ Admin user created successfully!");
    console.log("\n📧 Login Credentials:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Username: ${admin.username}`);
    console.log("\n⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
};

createAdminUser();
