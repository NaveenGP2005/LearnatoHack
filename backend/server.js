require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/database");
const postRoutes = require("./routes/postRoutes");

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible to routes
app.set("socketio", io);

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Discussion Forum API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/posts", postRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Discussion Forum API",
    version: "1.0.0",
    endpoints: {
      posts: "/api/posts",
      health: "/health",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Join a room for real-time updates
  socket.on("join", () => {
    socket.join("forum");
    console.log(`👤 Client ${socket.id} joined forum room`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
  console.log(`📝 API available at http://localhost:${PORT}`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket ready for real-time updates`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  // Close server & exit process
  process.exit(1);
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

module.exports = app;
