import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ThumbsUp,
  Clock,
  User,
  CheckCircle2,
  Loader2,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import ReplySection from "../components/ReplySection";
import { postsAPI } from "../services/api";
import { useSocket } from "../contexts/SocketContext";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpvoting, setIsUpvoting] = useState(false);
  const { socket, connected } = useSocket();

  useEffect(() => {
    fetchPost();
  }, [id]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket || !id) return;

    // Listen for new replies
    socket.on("newReply", ({ postId, post: updatedPost }) => {
      if (postId === id) {
        setPost(updatedPost);
        toast.success("New reply added!");
      }
    });

    // Listen for upvotes
    socket.on("postUpvoted", ({ postId, votes }) => {
      if (postId === id) {
        setPost((prevPost) => ({ ...prevPost, votes }));
      }
    });

    // Listen for post marked as answered
    socket.on("postAnswered", ({ postId }) => {
      if (postId === id) {
        setPost((prevPost) => ({ ...prevPost, isAnswered: true }));
        toast.success("Question marked as answered!");
      }
    });

    // Cleanup listeners
    return () => {
      socket.off("newReply");
      socket.off("postUpvoted");
      socket.off("postAnswered");
    };
  }, [socket, id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await postsAPI.getPost(id);
      setPost(response.data.data);
    } catch (error) {
      console.error("Error fetching post:", error);
      setError("Failed to load question. It may have been deleted.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (isUpvoting || !post) return;

    try {
      setIsUpvoting(true);
      await postsAPI.upvotePost(post._id);
      setPost({ ...post, votes: post.votes + 1 });
    } catch (error) {
      console.error("Error upvoting:", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Question Not Found
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={() => navigate("/")} className="btn-primary">
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Home
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to questions</span>
        </motion.button>

        {/* Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 mb-6"
        >
          {/* Header */}
          <div className="flex items-start gap-6 mb-6">
            {/* Votes */}
            <div className="flex flex-col items-center space-y-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleUpvote}
                disabled={isUpvoting}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isUpvoting
                    ? "bg-gray-100 text-gray-400"
                    : "hover:bg-primary-50 text-gray-600 hover:text-primary-600"
                }`}
              >
                <ThumbsUp className="w-6 h-6" />
              </motion.button>
              <span className="text-2xl font-bold text-primary-600">
                {post.votes}
              </span>
              <span className="text-xs text-gray-500">votes</span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {post.title}
                </h1>
                {post.isAnswered && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4" />
                    Answered
                  </span>
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Asked by{" "}
                  <span className="font-medium text-gray-700">
                    {post.author}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(post.createdAt)}
                </span>
              </div>

              {/* Description */}
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 text-lg whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Replies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReplySection
            postId={post._id}
            replies={post.replies || []}
            onReplyAdded={fetchPost}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default PostDetailPage;
