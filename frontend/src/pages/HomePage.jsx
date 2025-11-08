import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, TrendingUp, Clock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";
import { postsAPI } from "../services/api";
import { useSocket } from "../contexts/SocketContext";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("votes");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const { socket, connected } = useSocket();

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for new posts
    socket.on("newPost", (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      toast.success("New question posted!");
    });

    // Listen for post upvotes
    socket.on("postUpvoted", ({ postId, votes }) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, votes } : post
        )
      );
    });

    // Listen for posts marked as answered
    socket.on("postAnswered", ({ postId, post }) => {
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId ? { ...p, isAnswered: true } : p
        )
      );
      toast.success("Question marked as answered!");
    });

    // Cleanup listeners
    return () => {
      socket.off("newPost");
      socket.off("postUpvoted");
      socket.off("postAnswered");
    };
  }, [socket]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await postsAPI.getAllPosts({
        sortBy,
        order: "desc",
        search: searchQuery,
      });
      setPosts(response.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white overflow-hidden animate-gradient"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-block mb-6"
            >
              <div className="bg-white/20 backdrop-blur-lg px-6 py-3 rounded-full border-2 border-white/30 shadow-2xl">
                <p className="text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {connected ? "Live Updates Active" : "Connecting..."}
                </p>
              </div>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 neon-text">
              Discussion Forum
            </h1>
            <p className="text-xl sm:text-2xl text-white/95 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              Ask questions, share knowledge, and learn together with the
              community in real-time
            </p>

            <motion.button
              whileHover={{ scale: 1.08, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3 mx-auto group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              Ask a Question
            </motion.button>
          </motion.div>
        </div>

        {/* Waves decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-16"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              fill="#ffffff"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              fill="#ffffff"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              fill="#ffffff"
            ></path>
          </svg>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5" />
          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary-500 w-5 h-5 transition-colors duration-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all duration-300 hover:border-primary-300 font-medium"
                />
              </div>
            </form>

            {/* Sort Options */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy("votes")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg ${
                  sortBy === "votes"
                    ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-primary-500/50"
                    : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border-2 border-gray-200"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="hidden sm:inline">Top</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy("date")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg ${
                  sortBy === "date"
                    ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-primary-500/50"
                    : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border-2 border-gray-200"
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="hidden sm:inline">Recent</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Posts List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading questions...</p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-8 text-center"
          >
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchPosts} className="btn-primary">
              Try Again
            </button>
          </motion.div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? "No questions found" : "No questions yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Be the first to ask a question!"}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Ask a Question
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {posts.length} {posts.length === 1 ? "Question" : "Questions"}
              </h2>
            </div>

            {posts.map((post) => (
              <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default HomePage;
