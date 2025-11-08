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
      whileHover={{ y: -2 }}
      onClick={handleCardClick}
      className="card p-6 cursor-pointer group"
    >
      <div className="flex gap-4">
        {/* Votes Section */}
        <div className="flex flex-col items-center space-y-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleUpvote}
            disabled={isUpvoting}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isUpvoting
                ? "bg-gray-100 text-gray-400"
                : "hover:bg-primary-50 text-gray-600 hover:text-primary-600"
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
          </motion.button>
          <span className="text-lg font-bold text-primary-600">
            {post.votes}
          </span>
          <span className="text-xs text-gray-500">votes</span>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
              {post.title}
            </h3>
            {post.isAnswered && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3" />
                Answered
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {post.replyCount || post.replies?.length || 0} replies
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(post.createdAt)}
              </span>
            </div>
            <div className="text-xs">
              by{" "}
              <span className="font-medium text-gray-700">
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
