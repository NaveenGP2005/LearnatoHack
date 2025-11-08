# 🚀 Quick Start Guide - Discussion Forum

Get up and running in 5 minutes!

## ⚡ Super Quick Setup (For the Impatient)

```bash
# 1. Clone/Download the project
cd discussion-forum

# 2. Run setup script (Windows)
setup.bat

# OR (Mac/Linux)
chmod +x setup.sh
./setup.sh

# 3. Get MongoDB connection string (see MONGODB_SETUP.md)
# Add it to backend/.env

# 4. Start backend (Terminal 1)
cd backend
npm run dev

# 5. Start frontend (Terminal 2)
cd frontend
npm run dev

# 6. Open browser
# http://localhost:3000
```

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] MongoDB Atlas account (free)
- [ ] Code editor (VS Code recommended)
- [ ] Two terminal windows

## 🎯 Step-by-Step Setup

### 1️⃣ Install Node.js Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### 2️⃣ Setup Environment Variables

**Backend (.env):**

```bash
cd backend
cp .env.example .env
# Edit .env and add your MongoDB Atlas connection string
```

**Frontend (.env):**

```bash
cd frontend
cp .env.example .env
# Default settings work for local development
```

### 3️⃣ Get MongoDB Atlas Connection String

Follow the detailed guide: [MONGODB_SETUP.md](./MONGODB_SETUP.md)

**Quick version:**

1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (free)
3. Create cluster (free M0 tier)
4. Create database user
5. Allow network access (0.0.0.0/0 for dev)
6. Get connection string
7. Add to `backend/.env`

### 4️⃣ Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Expected output:

```
✅ MongoDB Connected: cluster0.mongodb.net
🚀 Server running in development mode on port 5000
📝 API available at http://localhost:5000
💚 Health check at http://localhost:5000/health
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Expected output:

```
VITE v5.0.8  ready in 1234 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 5️⃣ Open Your Browser

Navigate to: **http://localhost:3000**

You should see the beautiful Discussion Forum homepage! 🎉

## 🧪 Test Your Setup

1. Click **"Ask a Question"**
2. Fill in the form and submit
3. Your question should appear on the homepage
4. Click on the question to view details
5. Add a reply
6. Upvote the question

If all steps work - **congratulations!** 🎊

## 🐳 Docker Alternative (Even Easier!)

If you have Docker installed:

```bash
# 1. Create .env in root with MongoDB connection string
echo "MONGODB_URI=your_connection_string" > .env

# 2. Run everything with one command
docker-compose up --build

# 3. Open browser
# http://localhost:3000
```

## 🎨 What You'll See

**Homepage:**

- 🌈 Beautiful gradient hero section
- 📝 List of all questions
- 🔍 Search bar
- 📊 Sort by votes or date
- ➕ "Ask a Question" button

**Question Detail Page:**

- 📄 Full question content
- 👍 Upvote button with count
- 💬 Replies section
- ✍️ Reply form
- 🏷️ Tags

**Create Question Modal:**

- 📝 Title and content fields
- 🏷️ Tags input
- 👤 Author name (optional)
- ✨ Smooth animations

## 🔧 Common Issues & Solutions

### Backend won't start

**Error:** `MongoServerError: Authentication failed`

- ✅ Check username/password in connection string
- ✅ Use database user credentials (not Atlas login)

**Error:** `ECONNREFUSED 127.0.0.1:27017`

- ✅ You're using local MongoDB, not Atlas
- ✅ Update `MONGODB_URI` to Atlas connection string

### Frontend won't connect to backend

- ✅ Check if backend is running on port 5000
- ✅ Verify `VITE_API_URL` in frontend `.env`
- ✅ Check for CORS errors in browser console

### "Cannot GET /" after deploy

- ✅ Make sure you're using nginx.conf for frontend
- ✅ Check React Router configuration

## 📚 Next Steps

1. **Customize the Design**

   - Edit `tailwind.config.js`
   - Modify colors in components

2. **Add Features**

   - User authentication
   - Real-time updates with Socket.io
   - AI-powered suggestions
   - Email notifications

3. **Deploy to Production**

   - Backend → Render/Railway
   - Frontend → Vercel/Netlify
   - Database → MongoDB Atlas (already cloud!)

4. **Read Full Documentation**
   - [README.md](./README.md) - Complete guide
   - [MONGODB_SETUP.md](./MONGODB_SETUP.md) - Database setup
   - [backend/README.md](./backend/README.md) - API docs
   - [frontend/README.md](./frontend/README.md) - Frontend guide

## 🆘 Need Help?

1. Check [README.md](./README.md) for detailed docs
2. Review [MONGODB_SETUP.md](./MONGODB_SETUP.md) for database issues
3. Look at the code comments
4. Check the browser console for errors
5. Check the terminal for server errors

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Docs](https://www.mongodb.com/docs)

---

<div align="center">
  <strong>🎉 You're all set! Start building amazing features!</strong>
  <br>
  <sub>Built for Learnato Hackathon 2025</sub>
</div>
