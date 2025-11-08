# 🔐 Authentication & AI Features - Documentation

## ✅ Backend Implementation Complete!

### 🎯 What's Been Implemented

---

## 1. 🔐 **User Authentication System**

### Features:

✅ **User Registration & Login**

- Email & password authentication
- Password hashing with bcryptjs (10 salt rounds)
- JWT token generation (30-day expiration)
- Automatic avatar generation using DiceBear API

✅ **User Roles**

- `user` - Regular forum user (default)
- `moderator` - Can resolve posts
- `admin` - Full system access

✅ **User Profiles**

- Username, email, avatar, bio
- Reputation system (earned through participation)
- Post & reply counts
- Activity tracking (last login, created date)

✅ **Protected Routes**

- `protect` middleware - Requires valid JWT
- `optionalAuth` middleware - Attaches user if token exists
- `restrictTo(roles)` middleware - Role-based access control

---

## 2. 🗳️ **Voting System (Prevents Duplicates!)**

### How It Works:

✅ **One Vote Per User**

- `votedBy` array tracks user IDs who voted
- Throws error if user tries to vote twice
- Requires authentication to vote

✅ **Reputation System**

- Post author gets +1 reputation per upvote
- Voters must be logged in
- Anonymous users cannot vote

✅ **API Response**

- Returns `hasVoted: true/false` status
- Vote count updates in real-time
- Socket.io broadcasts to all users

---

## 3. 👤 **Anonymous Posting Option**

### Features:

✅ **Flexible Author System**

- `isAnonymous` flag on posts and replies
- Users can choose to:
  - Post with their username
  - Post anonymously
- Anonymous posts show "Anonymous" as author

✅ **Database Schema**

```javascript
{
  author: ObjectId,           // User ID (if logged in)
  authorName: String,         // Display name or "Anonymous"
  isAnonymous: Boolean       // True if user chose anonymous
}
```

✅ **Benefits**

- Encourages honest questions
- Protects user privacy when needed
- Still tracks user for reputation (if not anonymous)

---

## 4. 🤖 **AI-Powered Features**

### A. Auto-Tag Generation

✅ **Smart Tag Extraction**

- Analyzes post title + content
- Identifies tech keywords (javascript, python, react, etc.)
- Extracts topics using NLP (Natural library)
- Suggests 5 relevant tags automatically

**Example:**

```javascript
Input: "How do I connect MongoDB with Node.js?"
AI Tags: ["mongodb", "nodejs", "database", "backend"]
```

### B. Duplicate Detection

✅ **Similarity Analysis**

- Compares new posts with recent 100 posts
- Uses TF-IDF + cosine similarity
- Threshold: 85% similarity
- Prevents duplicate questions

**Response if duplicate found:**

```json
{
  "message": "A very similar question already exists",
  "similarPost": {
    /* existing post */
  },
  "similarity": 92
}
```

### C. Smart Search Ranking

✅ **AI-Enhanced Search**

- Traditional regex search
- AI similarity scoring
- Popularity boost (votes + replies)
- Returns ranked results with `searchScore`

### D. Related Questions

✅ **Content-Based Recommendations**

- Uses similarity algorithm
- Returns top 5 related posts
- Shows similarity percentage
- Helps users find existing answers

### E. Toxicity Detection

✅ **Content Moderation**

- Detects toxic/spam words
- Calculates confidence score
- Flags inappropriate content
- Used in admin moderation suggestions

### F. Sentiment Analysis

✅ **Tone Detection**

- Positive, negative, or neutral
- Sentiment score (-1 to +1)
- Can help identify frustrated users

---

## 5. 👨‍💼 **Admin Dashboard (Backend)**

### Features Implemented:

✅ **Dashboard Statistics**

- Total users, posts, replies
- Resolved vs unresolved posts
- Resolution rate percentage
- Active users count
- Posts per day (last 7 days)

✅ **User Management**

- List all users with filters
- Change user roles
- Activate/deactivate accounts
- View user stats (reputation, posts, replies)

✅ **Post Moderation**

- Mark posts as resolved
- Delete inappropriate posts
- View post details with author info
- Real-time Socket.io updates

✅ **AI Moderation Suggestions**

- **Duplicate Detection**: Finds similar posts (>80% similarity)
- **Toxic Content**: Flags posts with inappropriate language
- **Low Quality**: Identifies short posts with no engagement

✅ **Advanced Analytics**

- User growth over time
- Post activity trends
- Most active hours heatmap
- Average response time
- Time-range filters (24h, 7d, 30d, 90d)

✅ **Top Contributors**

- Leaderboard by reputation
- Top 5 most active users
- Posts & replies count

✅ **Trending Tags**

- Top 10 most used tags
- Usage count per tag

---

## 6. 📊 **Enhanced Post Features**

### New Post Schema:

```javascript
{
  // Author fields
  author: ObjectId,
  authorName: String,
  isAnonymous: Boolean,

  // Voting
  votes: Number,
  votedBy: [ObjectId],  // Prevents duplicate votes

  // Status
  isAnswered: Boolean,
  isResolved: Boolean,
  resolvedBy: ObjectId,
  resolvedAt: Date,

  // AI fields
  aiTags: [String],     // Auto-generated tags
  views: Number,         // View count

  // Existing fields
  title, content, tags, replies...
}
```

---

## 7. 🛣️ **API Endpoints**

### Authentication Routes (`/api/auth`)

```
POST   /register          - Create new user
POST   /login             - Login user (returns JWT)
GET    /me                - Get current user (Protected)
PUT    /profile           - Update profile (Protected)
PUT    /password          - Change password (Protected)
GET    /leaderboard       - Get top users by reputation
```

### Post Routes (`/api/posts`)

```
GET    /                  - Get all posts (Optional Auth)
POST   /                  - Create post (Optional Auth, AI tagging)
GET    /:id               - Get post details (Optional Auth, related questions)
DELETE /:id               - Delete post (Protected)
POST   /:id/reply         - Add reply (Optional Auth)
POST   /:id/upvote        - Upvote post (Protected, prevents duplicates)
PATCH  /:id/answered      - Mark as answered (Protected)
```

### Admin Routes (`/api/admin`)

```
GET    /stats             - Dashboard statistics (Admin/Moderator)
GET    /analytics         - Advanced analytics (Admin/Moderator)
GET    /moderation        - AI moderation suggestions (Admin/Moderator)
GET    /users             - List all users (Admin/Moderator)
PUT    /users/:id         - Update user role (Admin only)
PUT    /posts/:id/resolve - Mark post resolved (Admin/Moderator)
DELETE /posts/:id         - Delete post (Admin only)
```

---

## 8. 🔧 **Environment Variables**

Add to `.env`:

```properties
# JWT Configuration
JWT_SECRET=learnato_hackathon_2025_super_secret_key
JWT_EXPIRE=30d

# Admin Account
ADMIN_EMAIL=admin@learnato.com
ADMIN_PASSWORD=Admin@123456
```

---

## 9. 🚀 **How to Use**

### Step 1: Create Admin Account

```bash
npm run seed:admin
```

**Login Credentials:**

- Email: admin@learnato.com
- Password: Admin@123456

### Step 2: Test Authentication

**Register a User:**

```bash
POST /api/auth/register
Body: {
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      /* user profile */
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 3: Use Token in Headers

```
Authorization: Bearer <your-jwt-token>
```

### Step 4: Create Post with Auth

```bash
POST /api/posts
Headers: Authorization: Bearer <token>
Body: {
  "title": "How to use React hooks?",
  "content": "I'm new to React and confused about hooks...",
  "tags": ["react"],
  "isAnonymous": false
}
```

**Response includes AI tags:**

```json
{
  "success": true,
  "data": {
    /* post */
  },
  "aiSuggestions": {
    "tags": ["react", "javascript", "hooks", "frontend"]
  }
}
```

### Step 5: Vote (Requires Auth)

```bash
POST /api/posts/:id/upvote
Headers: Authorization: Bearer <token>
```

**Try voting twice:**

```json
{
  "success": false,
  "message": "You have already voted on this post"
}
```

### Step 6: Access Admin Dashboard

```bash
GET /api/admin/stats
Headers: Authorization: Bearer <admin-token>
```

---

## 10. 🎯 **Unique Features That Stand Out**

### Why This is Competition-Winning:

1. **Prevents Multiple Votes** ✅

   - Most forums allow unlimited votes
   - Ours tracks users with `votedBy` array

2. **AI-Powered Everything** 🤖

   - Auto-tagging saves time
   - Duplicate detection prevents spam
   - Smart search with relevance ranking
   - Moderation suggestions help admins

3. **Flexible Anonymity** 👤

   - Post with your name or anonymously
   - Encourages honest questions
   - Rare in student projects!

4. **Reputation System** ⭐

   - Gamification encourages participation
   - +5 for posting
   - +2 for replying
   - +1 for receiving upvotes

5. **Advanced Admin Dashboard** 📊

   - Real-time statistics
   - AI moderation suggestions
   - Activity heatmaps
   - User management
   - Analytics with time ranges

6. **Related Questions** 🔗
   - Uses AI similarity
   - Helps users find existing answers
   - Reduces duplicate questions

---

## 11. 🔒 **Security Features**

✅ **Password Security**

- Bcrypt hashing (10 rounds)
- Passwords never returned in API
- `select: false` on password field

✅ **JWT Protection**

- 30-day expiration
- Secure token verification
- Role-based access control

✅ **Input Validation**

- Email format validation
- Password min length (6 chars)
- Content length limits
- XSS protection ready

✅ **User Account Security**

- Account deactivation capability
- Password change endpoint
- Last login tracking

---

## 12. 📊 **Database Models**

### User Model

```javascript
{
  username: String (unique, 3-30 chars),
  email: String (unique, validated),
  password: String (hashed, select: false),
  role: "user" | "admin" | "moderator",
  avatar: String (auto-generated),
  bio: String (max 200 chars),
  reputation: Number (default: 0),
  postsCount: Number,
  repliesCount: Number,
  isActive: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### Post Model (Updated)

```javascript
{
  title: String,
  content: String,
  author: ObjectId → User,
  authorName: String,
  isAnonymous: Boolean,
  votes: Number,
  votedBy: [ObjectId],  // 🆕 Prevents duplicates
  replies: [{
    content: String,
    author: ObjectId → User,  // 🆕
    authorName: String,
    isAnonymous: Boolean,
    createdAt: Date
  }],
  isAnswered: Boolean,
  isResolved: Boolean,      // 🆕 Admin feature
  resolvedBy: ObjectId,     // 🆕
  resolvedAt: Date,         // 🆕
  tags: [String],
  aiTags: [String],         // 🆕 Auto-generated
  views: Number,            // 🆕
  timestamps: true
}
```

---

## 13. 🧪 **Testing the Features**

### Test Scenarios:

**Scenario 1: Duplicate Vote Prevention**

1. Login as user1
2. Upvote post A
3. Try to upvote again → ❌ Error
4. Login as user2
5. Upvote post A → ✅ Success

**Scenario 2: Anonymous Posting**

1. Login as user
2. Create post with `isAnonymous: true`
3. Check: Shows "Anonymous", but user still gets reputation

**Scenario 3: AI Tagging**

1. Create post: "How to deploy React app on AWS?"
2. Check `aiTags`: Should include ["react", "aws", "deployment"]

**Scenario 4: Admin Moderation**

1. Login as admin
2. GET /api/admin/moderation
3. See suggestions for duplicates, toxic content, low quality posts

**Scenario 5: Related Questions**

1. View any post detail
2. Check `relatedQuestions` array
3. Should show 5 similar posts with similarity scores

---

## 14. 🎓 **Skills Demonstrated**

### Technical Skills:

✅ JWT authentication
✅ Password hashing
✅ Role-based access control
✅ NLP/AI implementation
✅ TF-IDF algorithm
✅ Cosine similarity
✅ Advanced MongoDB queries
✅ Aggregation pipelines
✅ Real-time updates (Socket.io)

### Architecture Skills:

✅ MVC pattern
✅ Middleware design
✅ Service layer (AI utilities)
✅ Data modeling
✅ API design
✅ Security best practices

### Problem-Solving:

✅ Preventing duplicate votes
✅ Duplicate question detection
✅ Reputation system design
✅ Anonymous posting with tracking
✅ AI-powered moderation

---

## 15. 🚀 **Next Steps (Frontend)**

The backend is **100% ready**. Next tasks:

1. **Login/Register Pages** - Forms with validation
2. **Auth Context** - React Context for token management
3. **Protected Routes** - Redirect if not authenticated
4. **Anonymous Toggle** - Checkbox on create post form
5. **Vote Button** - Disabled if already voted
6. **Admin Dashboard** - Charts, tables, moderation UI
7. **Reputation Display** - Show user reputation
8. **Related Questions** - Sidebar component
9. **AI Tags Display** - Show suggested tags

---

## 16. 📦 **Dependencies Added**

```json
{
  "bcryptjs": "^2.4.3", // Password hashing
  "jsonwebtoken": "^9.0.2", // JWT tokens
  "natural": "^6.10.0", // NLP for AI features
  "compromise": "^14.10.0" // Text analysis
}
```

---

## 🎉 **Summary**

### What Makes This Special:

1. ✅ **Authentication** - Secure JWT-based system
2. ✅ **Prevents Duplicate Votes** - One vote per user
3. ✅ **Anonymous Posting** - Post with name or anonymously
4. ✅ **AI Auto-Tagging** - Smart keyword extraction
5. ✅ **Duplicate Detection** - Prevents similar questions
6. ✅ **Smart Search** - AI-ranked results
7. ✅ **Related Questions** - Content-based recommendations
8. ✅ **Admin Dashboard** - Complete moderation system
9. ✅ **Reputation System** - Gamification
10. ✅ **Toxicity Detection** - Auto-moderation

### Competition Advantages:

🏆 **Most hackathon projects don't have:**

- Duplicate vote prevention
- AI-powered features
- Anonymous posting option
- Advanced admin dashboard
- Reputation system
- Moderation suggestions

🏆 **This project has ALL of them!**

---

**Backend Implementation: 100% COMPLETE! ✅**

Ready for frontend integration! 🚀
