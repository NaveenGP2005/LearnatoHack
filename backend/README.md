# Discussion Forum Backend API

A RESTful API for the Discussion Forum application built with Node.js, Express, and MongoDB Atlas.

## 🚀 Features

- Create, read, and delete posts
- Add replies to posts
- Upvote posts
- Search and sort posts
- Mark questions as answered
- Full error handling and validation
- MongoDB Atlas cloud database support

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account and connection string
- npm or yarn

## ⚙️ Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Add your MongoDB Atlas connection string to `.env`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/discussion-forum?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

4. Start the server:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 🛣️ API Endpoints

### Posts

| Method   | Endpoint                  | Description                               |
| -------- | ------------------------- | ----------------------------------------- |
| `GET`    | `/api/posts`              | Get all posts (supports sorting & search) |
| `GET`    | `/api/posts/:id`          | Get single post by ID                     |
| `POST`   | `/api/posts`              | Create new post                           |
| `DELETE` | `/api/posts/:id`          | Delete post                               |
| `POST`   | `/api/posts/:id/reply`    | Add reply to post                         |
| `POST`   | `/api/posts/:id/upvote`   | Upvote a post                             |
| `PATCH`  | `/api/posts/:id/answered` | Mark post as answered                     |

### Query Parameters

**GET /api/posts**

- `sortBy`: `votes` or `date` (default: `votes`)
- `order`: `asc` or `desc` (default: `desc`)
- `search`: Search in title and content

Example: `/api/posts?sortBy=votes&order=desc&search=react`

### Request Examples

**Create Post:**

```json
POST /api/posts
{
  "title": "How to use React Hooks?",
  "content": "I'm new to React and want to understand hooks better...",
  "author": "John Doe",
  "tags": ["react", "hooks", "javascript"]
}
```

**Add Reply:**

```json
POST /api/posts/:id/reply
{
  "content": "Great question! Here's how you use useState...",
  "author": "Jane Smith"
}
```

**Upvote Post:**

```json
POST /api/posts/:id/upvote
// No body required
```

## 🐳 Docker

Build and run with Docker:

```bash
docker build -t discussion-forum-backend .
docker run -p 5000:5000 --env-file .env discussion-forum-backend
```

## 📦 Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── controllers/
│   └── postController.js # Business logic
├── models/
│   └── Post.js           # Mongoose schema
├── routes/
│   └── postRoutes.js     # API routes
├── .env.example          # Environment template
├── .gitignore
├── Dockerfile
├── package.json
└── server.js             # Express app
```

## 🔒 Environment Variables

| Variable      | Description                     | Example                       |
| ------------- | ------------------------------- | ----------------------------- |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...`           |
| `PORT`        | Server port                     | `5000`                        |
| `NODE_ENV`    | Environment mode                | `development` or `production` |
| `CORS_ORIGIN` | Allowed CORS origin             | `http://localhost:3000`       |

## 🛠️ Technologies

- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **express-validator** - Input validation

## 📝 License

MIT
