# 🚀 Discussion Forum - Learnato Hackathon 2025

A modern, full-stack discussion forum built with React.js, Tailwind CSS, Node.js, Express, and MongoDB Atlas. This project empowers learning through conversation by allowing users to ask questions, share knowledge, and engage with a community.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## ✨ Features

### Core Features

- 📝 **Create Questions** - Post questions with title, content, and tags
- 👀 **View Posts** - Browse all questions sorted by votes or date
- 💬 **Reply System** - Add thoughtful replies to any question
- 👍 **Upvoting** - Vote for helpful questions and see real-time updates
- 🔍 **Search** - Find questions quickly with text search
- ✅ **Answered Status** - Mark questions as answered (instructor feature)

### UI/UX Features

- 🎨 Modern, clean design with Tailwind CSS
- ✨ Smooth animations with Framer Motion
- 📱 Fully responsive layout (mobile, tablet, desktop)
- 🌈 Beautiful gradient accents and hover effects
- ⚡ Fast and intuitive user experience
- 🎯 Minimal and professional color scheme

### Technical Features

- 🐳 Docker containerization for easy deployment
- 🔄 RESTful API with proper error handling
- 🗄️ MongoDB Atlas cloud database integration
- 🔐 CORS and security best practices
- 📊 Scalable MVC architecture
- 🚀 Production-ready with health checks

## 📸 Screenshots

<!-- Add your screenshots here -->

```
[Home Page] [Post Detail] [Create Post Modal]
```

## 🏗️ Project Structure

```
discussion-forum/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Business logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── .env.example        # Environment template
│   ├── Dockerfile          # Backend container
│   ├── package.json
│   └── server.js           # Entry point
├── frontend/               # React + Tailwind app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example        # Environment template
│   ├── Dockerfile          # Frontend container
│   ├── nginx.conf          # Nginx configuration
│   ├── tailwind.config.js
│   └── package.json
├── docker-compose.yml      # Container orchestration
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- MongoDB Atlas account (get free tier at [mongodb.com](https://www.mongodb.com/cloud/atlas))
- npm or yarn
- Docker (optional, for containerized deployment)

### Option 1: Local Development

#### Backend Setup

1. **Navigate to backend directory:**

```bash
cd backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Add your MongoDB Atlas connection string to `.env`:**

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/discussion-forum?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**How to get MongoDB Atlas connection string:**

- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a new cluster (free tier available)
- Click "Connect" → "Connect your application"
- Copy the connection string and replace `<username>` and `<password>`

5. **Start the backend:**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Backend will run at `http://localhost:5000`

#### Frontend Setup

1. **Navigate to frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Configure API URL in `.env`:**

```env
VITE_API_URL=http://localhost:5000
```

5. **Start the frontend:**

```bash
npm run dev
```

Frontend will run at `http://localhost:3000`

### Option 2: Docker Deployment

1. **Create `.env` file in root directory with your MongoDB Atlas connection string:**

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/discussion-forum?retryWrites=true&w=majority
```

2. **Build and run with Docker Compose:**

```bash
docker-compose up --build
```

3. **Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

4. **Stop the containers:**

```bash
docker-compose down
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

| Method   | Endpoint              | Description      | Request Body                              |
| -------- | --------------------- | ---------------- | ----------------------------------------- |
| `GET`    | `/posts`              | Get all posts    | Query params: `sortBy`, `order`, `search` |
| `GET`    | `/posts/:id`          | Get single post  | -                                         |
| `POST`   | `/posts`              | Create new post  | `{ title, content, author?, tags? }`      |
| `POST`   | `/posts/:id/reply`    | Add reply        | `{ content, author? }`                    |
| `POST`   | `/posts/:id/upvote`   | Upvote post      | -                                         |
| `PATCH`  | `/posts/:id/answered` | Mark as answered | -                                         |
| `DELETE` | `/posts/:id`          | Delete post      | -                                         |

### Example Requests

**Create a Post:**

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to use React Hooks?",
    "content": "I am new to React and want to understand hooks better...",
    "author": "John Doe",
    "tags": ["react", "hooks", "javascript"]
  }'
```

**Get All Posts (Sorted by Votes):**

```bash
curl http://localhost:5000/api/posts?sortBy=votes&order=desc
```

**Add Reply:**

```bash
curl -X POST http://localhost:5000/api/posts/[POST_ID]/reply \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great question! Here is how...",
    "author": "Jane Smith"
  }'
```

**Upvote Post:**

```bash
curl -X POST http://localhost:5000/api/posts/[POST_ID]/upvote
```

## 🛠️ Technology Stack

### Frontend

- **React 18.2** - UI library
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Framer Motion 10.16** - Animation library
- **React Router DOM 6.20** - Client-side routing
- **Axios 1.6** - HTTP client
- **Lucide React** - Beautiful icon library
- **Vite 5** - Build tool and dev server

### Backend

- **Node.js 18** - Runtime environment
- **Express 4.18** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose 8** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server for frontend

## 🎨 Design Philosophy

- **Minimal & Modern** - Clean interface with neutral backgrounds and indigo/purple accents
- **User-Friendly** - Intuitive navigation and clear visual hierarchy
- **Responsive** - Mobile-first design that works on all devices
- **Accessible** - Proper contrast ratios and semantic HTML
- **Performant** - Optimized bundle size and fast load times

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## 🚢 Deployment

### Deploy to Render (Backend)

1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variable: `MONGODB_URI`

### Deploy to Vercel (Frontend)

1. Create account at [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set root directory: `frontend`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variable: `VITE_API_URL`

### Deploy with Docker (Any Platform)

```bash
# Build images
docker-compose build

# Push to registry
docker tag discussion-forum-backend your-registry/backend
docker push your-registry/backend

docker tag discussion-forum-frontend your-registry/frontend
docker push your-registry/frontend

# Deploy to cloud (AWS, GCP, Azure, DigitalOcean, etc.)
```

## 🔐 Environment Variables

### Backend (.env)

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-api-domain.com
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

**Learnato Hackathon Team**

- Built for Learnato Hackathon 2025
- Empowering learning through conversation

## 🙏 Acknowledgments

- Learnato for organizing the hackathon
- MongoDB Atlas for free cloud database
- Open source community for amazing tools

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Contact: [your-email@example.com]

---

<div align="center">
  <strong>🎓 Built with ❤️ for Learnato Hackathon 2025</strong>
  <br>
  <sub>Empowering Learning Through Conversation</sub>
</div>
