import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ThumbsUp, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { postsAPI } from "../services/api";

const PostCard = ({ post, onUpdate }) => {
  const navigate = useNavigate();
  const [isUpvoting, setIsUpvoting] = React.useState(false);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (isUpvoting) return;

    try {
      setIsUpvoting(true);
      await postsAPI.upvotePost(post._id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error upvoting:", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/post/${post._id}`);
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now - postDate) / 1000); // seconds

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return postDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        postDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={handleCardClick}
      className="glass-card p-6 cursor-pointer group relative overflow-hidden"
    >
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex gap-4 relative z-10">
        {/* Votes Section */}
        <div className="flex flex-col items-center space-y-2">
          <motion.button
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleUpvote}
            disabled={isUpvoting}
            className={`p-3 rounded-xl transition-all duration-300 backdrop-blur-sm ${
              isUpvoting
                ? "bg-gray-200/50 text-gray-400"
                : "bg-white/80 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 text-gray-600 hover:text-primary-600 shadow-md hover:shadow-lg"
            }`}
          >
            <ThumbsUp
              className={`w-5 h-5 ${
                isUpvoting ? "" : "group-hover:animate-pulse"
              }`}
            />
          </motion.button>
          <div className="bg-gradient-to-br from-primary-600 to-purple-600 text-white px-3 py-2 rounded-xl shadow-lg">
            <span className="text-lg font-bold block text-center">
              {post.votes}
            </span>
            <span className="text-[10px] font-medium block text-center">
              votes
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:gradient-text transition-all duration-300 line-clamp-2">
              {post.title}
            </h3>
            {post.isAnswered && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                Answered
              </motion.span>
            )}
          </div>

          <p className="text-gray-700 text-sm line-clamp-2 mb-4 leading-relaxed">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag, index) => (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-primary-50 hover:to-purple-50 text-gray-700 hover:text-primary-700 rounded-lg text-xs font-semibold shadow-sm transition-all duration-300"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200/50">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 font-medium">
                <MessageCircle className="w-4 h-4 text-primary-600" />
                <span className="text-primary-600 font-bold">
                  {post.replyCount || post.replies?.length || 0}
                </span>{" "}
                replies
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-500" />
                {formatDate(post.createdAt)}
              </span>
            </div>
            <div className="text-xs font-medium">
              by{" "}
              <span className="gradient-text font-bold">
                {post.author || "Anonymous"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
