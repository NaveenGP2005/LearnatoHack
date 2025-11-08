# 🗄️ MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas (free cloud database) for the Discussion Forum.

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Sign up using:
   - Email and password, OR
   - Google account, OR
   - GitHub account

## Step 2: Create a Free Cluster

1. After signing in, click **"Build a Database"**
2. Choose the **FREE** tier (M0 Sandbox)
   - ✅ 512 MB storage
   - ✅ Shared RAM
   - ✅ No credit card required
3. Select a cloud provider and region:
   - Choose the region closest to you for better performance
   - AWS, Google Cloud, or Azure all work fine
4. Name your cluster (or use default name)
5. Click **"Create Cluster"**
   - Wait 1-3 minutes for cluster creation

## Step 3: Set Up Database Access

### Create a Database User

1. On the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter:
   - **Username**: `forumuser` (or any name you prefer)
   - **Password**: Create a strong password (SAVE THIS!)
   - ⚠️ **Important**: Avoid special characters like `@`, `:`, `/` in password
5. Under "Database User Privileges", select:
   - **"Read and write to any database"**
6. Click **"Add User"**

## Step 4: Set Up Network Access

### Allow Your IP Address

1. On the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development, you can:
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - OR add your current IP address
4. Click **"Confirm"**
   - Wait a few seconds for the status to turn green

⚠️ **Security Note**: For production, restrict to specific IP addresses!

## Step 5: Get Your Connection String

1. Go back to **"Database"** in the left sidebar
2. Find your cluster and click **"Connect"**
3. Choose **"Connect your application"**
4. Select:
   - **Driver**: Node.js
   - **Version**: 4.1 or later
5. Copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Configure Your Application

1. Open `backend/.env` file in your project
2. Replace the placeholders in your connection string:

   ```env
   MONGODB_URI=mongodb+srv://forumuser:YourPassword123@cluster0.abc123.mongodb.net/discussion-forum?retryWrites=true&w=majority
   ```

   Replace:

   - `forumuser` → your database username
   - `YourPassword123` → your database password
   - `cluster0.abc123.mongodb.net` → your actual cluster address
   - Add `/discussion-forum` before the `?` to specify the database name

### Example Complete Connection String:

```env
MONGODB_URI=mongodb+srv://forumuser:MySecurePass123@cluster0.mongodb.net/discussion-forum?retryWrites=true&w=majority
```

## Step 7: Test the Connection

1. Save your `.env` file
2. Start your backend:
   ```bash
   cd backend
   npm run dev
   ```
3. Look for this message in the terminal:
   ```
   ✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
   🚀 Server running in development mode on port 5000
   ```

## Troubleshooting

### ❌ Connection Error: "Authentication failed"

- **Solution**: Double-check your username and password in the connection string
- Make sure you're using the database user credentials (not your Atlas account login)

### ❌ Connection Error: "Connection timeout"

- **Solution**: Check your Network Access settings
- Add "0.0.0.0/0" to allow access from anywhere (for development)

### ❌ Connection Error: "Invalid connection string"

- **Solution**: Make sure you replaced `<username>` and `<password>` with actual values
- Remove any `<` or `>` characters
- Ensure no spaces in the connection string

### ❌ Special Characters in Password

If your password contains special characters, you need to URL-encode them:

- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`

Example:

- Password: `MyP@ss:word`
- Encoded: `MyP%40ss%3Aword`

## Step 8: View Your Data (Optional)

1. In MongoDB Atlas, click **"Browse Collections"**
2. You'll see your `discussion-forum` database
3. Collections will appear as you use the app:
   - `posts` - All questions and replies

## Free Tier Limits

MongoDB Atlas Free Tier includes:

- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Connection limit: 500 connections
- ✅ No time limit - free forever!

Perfect for development and small projects! 🎉

## Need Help?

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB University (Free Courses)](https://university.mongodb.com/)
- [MongoDB Community Forums](https://www.mongodb.com/community/forums/)

---

**✅ That's it! Your MongoDB Atlas database is ready to use!**

Now go back to the main README.md and continue with the setup steps.
