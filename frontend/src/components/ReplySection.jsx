import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Clock } from "lucide-react";
import { postsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const ReplySection = ({ postId, replies, onReplyAdded }) => {
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await postsAPI.addReply(postId, {
        content: replyContent,
        author: user ? undefined : author || "Anonymous",
      });

      setReplyContent("");
      setAuthor("");
      onReplyAdded();
    } catch (error) {
      setError(error.response?.data?.message || "Error adding reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const replyDate = new Date(date);
    const diff = Math.floor((now - replyDate) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return replyDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        replyDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Reply Form */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Write a Reply
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <textarea
              value={replyContent}
              onChange={(e) => {
                setReplyContent(e.target.value);
                setError("");
              }}
              placeholder="Share your thoughts, answer, or suggestion..."
              rows="4"
              className="input-field resize-none"
              maxLength={2000}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {replyContent.length}/2000 characters
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!user && (
              <div>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name (optional)"
                  className="input-field"
                  maxLength={50}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !replyContent.trim()}
              className={`btn-primary flex items-center justify-center gap-2 ${
                !user ? "" : "sm:col-span-2"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post Reply
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Replies List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h3>

        {replies.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500">
              No replies yet. Be the first to respond!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map((reply, index) => (
              <motion.div
                key={reply._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-5"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {reply.authorName ||
                          reply.author?.username ||
                          "Anonymous"}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap break-words">
                      {reply.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplySection;
