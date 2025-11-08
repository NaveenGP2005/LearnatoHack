import React, { useState, useEffect, useRef } from "react";
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
  Award,
  Shield,
  Sparkles,
  Eye,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import ReplySection from "../components/ReplySection";
import { postsAPI } from "../services/api";
import { adminAPI } from "../services/authAPI";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const { socket, connected } = useSocket();
  const hasFetchedRef = useRef(false); // Prevent double fetch in Strict Mode

  const hasVoted = post?.hasVoted || false;
  const isResolved = post?.isResolved || false;
  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  useEffect(() => {
    // Prevent double-fetch in React Strict Mode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

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

      // Set related questions if available
      if (response.data.relatedQuestions) {
        setRelatedQuestions(response.data.relatedQuestions);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      setError("Failed to load question. It may have been deleted.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (isUpvoting || hasVoted || !post) return;

    if (!user) {
      toast.error("Please login to vote");
      navigate("/login");
      return;
    }

    try {
      setIsUpvoting(true);
      await postsAPI.upvotePost(post._id);
      setPost({ ...post, votes: post.votes + 1, hasVoted: true });
      toast.success("Vote recorded! 👍");
    } catch (error) {
      const message = error.response?.data?.message || "Error upvoting";
      toast.error(message);
      console.error("Error upvoting:", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!isAdmin || isResolving || isResolved) return;

    try {
      setIsResolving(true);
      await adminAPI.markPostResolved(post._id);
      setPost({ ...post, isResolved: true, resolvedAt: new Date() });
      toast.success("Post marked as resolved! ✅");
    } catch (error) {
      const message =
        error.response?.data?.message || "Error marking as resolved";
      toast.error(message);
      console.error("Error marking resolved:", error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleGetSummary = async () => {
    if (!post || post.replies.length === 0) {
      toast.error("No discussion to summarize yet!");
      return;
    }

    if (summary) {
      setShowSummary(!showSummary);
      return;
    }

    try {
      setLoadingSummary(true);
      const response = await postsAPI.getSummary(post._id);
      setSummary(response.data.data);
      setShowSummary(true);
      toast.success("AI Summary generated! 🤖");
    } catch (error) {
      console.error("Error getting summary:", error);
      toast.error("Failed to generate summary");
    } finally {
      setLoadingSummary(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
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
                    whileHover={{ scale: hasVoted ? 1 : 1.1 }}
                    whileTap={{ scale: hasVoted ? 1 : 0.9 }}
                    onClick={handleUpvote}
                    disabled={isUpvoting || hasVoted}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      hasVoted
                        ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white cursor-not-allowed"
                        : isUpvoting
                        ? "bg-gray-100 text-gray-400"
                        : "hover:bg-primary-50 text-gray-600 hover:text-primary-600"
                    }`}
                    title={hasVoted ? "You already voted" : "Upvote this post"}
                  >
                    <ThumbsUp
                      className={`w-6 h-6 ${hasVoted ? "fill-current" : ""}`}
                    />
                  </motion.button>
                  <span className="text-2xl font-bold text-primary-600">
                    {post.votes}
                  </span>
                  <span className="text-xs text-gray-500">votes</span>
                  {post.views && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      {post.views}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {post.title}
                    </h1>
                    <div className="flex gap-2">
                      {isResolved && (
                        <span className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium whitespace-nowrap">
                          <Shield className="w-4 h-4" />
                          Resolved
                        </span>
                      )}
                      {post.isAnswered && (
                        <span className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium whitespace-nowrap">
                          <CheckCircle2 className="w-4 h-4" />
                          Answered
                        </span>
                      )}
                      {isAdmin && !isResolved && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleMarkResolved}
                          disabled={isResolving}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {isResolving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Resolving...
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4" />
                              Mark as Resolved
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
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
                      {post.aiTags &&
                        post.aiTags.length > 0 &&
                        post.aiTags.map((tag, index) => (
                          <span
                            key={`ai-${index}`}
                            className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium"
                          >
                            <Sparkles className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      {post.author?.avatar && (
                        <img
                          src={post.author.avatar}
                          alt={post.authorName}
                          className="w-6 h-6 rounded-full border border-gray-200"
                        />
                      )}
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Asked by{" "}
                        <span className="font-medium text-gray-700">
                          {post.authorName ||
                            post.author?.username ||
                            "Anonymous"}
                        </span>
                      </span>
                      {post.author?.reputation > 0 && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 rounded-full">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span className="text-xs font-bold text-amber-700">
                            {post.author.reputation}
                          </span>
                        </div>
                      )}
                    </div>
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

            {/* AI Summary Section */}
            {post.replies && post.replies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="card p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">
                      AI Discussion Summary
                    </h3>
                  </div>
                  <button
                    onClick={handleGetSummary}
                    disabled={loadingSummary}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingSummary ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        {showSummary ? "Hide" : "Generate"} Summary
                      </>
                    )}
                  </button>
                </div>

                {showSummary && summary && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Key Summary */}
                    {summary.summary && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {summary.summary}
                        </p>
                      </div>
                    )}

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-white border-2 border-purple-100 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          {summary.totalReplies}
                        </p>
                        <p className="text-xs text-gray-600">Replies</p>
                      </div>

                      <div className="p-4 bg-white border-2 border-green-100 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {summary.sentiment?.positive || 0}
                        </p>
                        <p className="text-xs text-gray-600">Positive</p>
                      </div>

                      <div className="p-4 bg-white border-2 border-red-100 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                          {summary.sentiment?.negative || 0}
                        </p>
                        <p className="text-xs text-gray-600">Negative</p>
                      </div>

                      <div className="p-4 bg-white border-2 border-gray-100 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-600">
                          {summary.statistics?.totalWords || 0}
                        </p>
                        <p className="text-xs text-gray-600">Words</p>
                      </div>
                    </div>

                    {/* Key Topics */}
                    {summary.keyTopics && summary.keyTopics.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-purple-600" />
                          Key Topics Discussed
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {summary.keyTopics.map((topic, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Contributors */}
                    {summary.topContributors &&
                      summary.topContributors.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-600" />
                            Top Contributors
                          </h4>
                          <div className="space-y-2">
                            {summary.topContributors.map(
                              (contributor, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg"
                                >
                                  <span className="text-sm font-semibold text-gray-900">
                                    {contributor.author}
                                  </span>
                                  <span className="text-xs text-amber-700 font-bold">
                                    {contributor.replies} replies
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Overall Sentiment */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 text-center">
                      <p className="text-sm text-gray-600 mb-1">
                        Overall Discussion Tone
                      </p>
                      <p className="text-xl font-bold text-blue-600 capitalize">
                        {summary.sentiment?.overall || "Neutral"} 😊
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

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

          {/* Sidebar - Related Questions */}
          <div className="lg:col-span-1">
            {relatedQuestions && relatedQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6 sticky top-20"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Related Questions
                </h3>
                <div className="space-y-3">
                  {relatedQuestions.map((related) => (
                    <motion.button
                      key={related._id}
                      whileHover={{ x: 4 }}
                      onClick={() => navigate(`/post/${related._id}`)}
                      className="w-full text-left p-3 bg-gradient-to-r from-gray-50 to-white hover:from-primary-50 hover:to-purple-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-all group"
                    >
                      <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 line-clamp-2 mb-2">
                        {related.title}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {related.votes} votes
                        </span>
                        {related.similarity && (
                          <span className="text-purple-600 font-semibold">
                            {Math.round(related.similarity)}% similar
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
