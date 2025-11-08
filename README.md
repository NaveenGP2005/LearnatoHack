# 🎓 Discussion Forum - Learnato Hackathon 2025

A modern, full-stack discussion forum built with React, Node.js, and MongoDB. This platform enables learners and instructors to ask questions, share knowledge, and engage in meaningful conversations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

---

## 🌐 Live Demo

**🚀 [Visit Live Application](https://learnatohack-front.onrender.com)**

**Backend API:** `https://learnatohack-backend.onrender.com`

**Test Credentials:**

- Admin: `admin@learnato.com` / `Admin@123456`
- Create your own account or use the demo
- Test User: `naveen@gmail.com` / `naveen123`

---

## 🌟 Features

- 📝 **Create & Browse Posts** - Ask questions with tags and rich content
- 💬 **Reply System** - Engage in discussions with nested replies
- 👍 **Upvoting** - Vote for helpful posts and answers
- 🔍 **Smart Search** - AI-powered search with relevance ranking
- 🔄 **Real-time Updates** - Live notifications via WebSocket
- 🤖 **AI Assistant** - Chatbot for trending topics and discussion summaries
- 🔐 **Authentication** - Secure JWT-based login with role management
- ✅ **Mark as Answered** - Instructors can resolve questions
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

**Frontend**

- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Socket.io Client

**Backend**

- Node.js + Express
- MongoDB Atlas
- Socket.io
- JWT Authentication

**AI/NLP**

- natural (sentiment analysis)
- compromise (entity extraction)

**DevOps**

- Docker + Docker Compose
- Nginx

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier available)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/NaveenGP2005/LearnatoHack.git
cd LearnatoHack
```

2. **Backend Setup**

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/discussion-forum
PORT=5000
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

Start backend:

```bash
npm run dev
```

3. **Frontend Setup** (open new terminal)

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 🐳 Docker Setup

```bash
# Create .env file with your MongoDB URI
echo "MONGODB_URI=your_connection_string" > .env

# Start containers
docker-compose up --build

# Access at http://localhost:3000
```

---

## 📡 API Endpoints

### Posts

- `GET /api/posts` - Get all posts (supports sorting & search)
- `GET /api/posts/:id` - Get single post with replies
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/reply` - Add reply
- `POST /api/posts/:id/upvote` - Upvote post
- `PATCH /api/posts/:id/answered` - Mark as answered
- `DELETE /api/posts/:id` - Delete post

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### AI Features

- `GET /api/posts/:id/summary` - Get AI discussion summary
- `POST /api/posts/ai/assist` - Ask AI assistant

### Admin

- `GET /api/admin/dashboard` - Admin statistics

---

## 🏗️ Project Structure

```
├── backend/
│   ├── config/          # Database config
│   ├── controllers/     # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # AI/NLP helpers
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # State management
│   │   └── services/    # API client
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🚢 Deployment

### Deployed On

- **Frontend:** [Render](https://learnatohack-front.onrender.com)
- **Backend:** [Render](https://learnatohack-backend.onrender.com)
- **Database:** MongoDB Atlas

### Backend (Render)

1. Create Web Service on [render.com](https://render.com)
2. Connect GitHub repo
3. Settings:
   - Root: `backend`
   - Build: `npm install`
   - Start: `npm start`
4. Add environment variables

### Frontend (Render/Vercel)

1. Import repo on [render.com](https://render.com) or [vercel.com](https://vercel.com)
2. Settings:
   - Root: `frontend`
   - Build: `npm run build`
   - Output: `dist`
3. Add `VITE_API_URL` environment variable

---

## 🔧 Environment Variables

**Backend `.env`**

```env
MONGODB_URI=mongodb+srv://...
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://your-frontend-url.com
```

**Frontend `.env`**

```env
VITE_API_URL=https://your-backend-url.com
```

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 👤 Author

**Naveen GP**

- GitHub: [@NaveenGP2005](https://github.com/NaveenGP2005)
- Repository: [LearnatoHack](https://github.com/NaveenGP2005/LearnatoHack)
- Live Demo: [learnatohack-front.onrender.com](https://learnatohack-front.onrender.com)

---

## 🙏 Acknowledgments

- Learnato for organizing the hackathon
- MongoDB Atlas for free cloud database
- Render for hosting
- Open source community

---

<div align="center">

**Built for Learnato Hackathon 2025**

_"Empower learning through conversation"_

[⭐ Star this repo](https://github.com/NaveenGP2005/LearnatoHack) | [🚀 Try Live Demo](https://learnatohack-front.onrender.com)

</div>
