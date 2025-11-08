import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Tag, Sparkles, User, UserX } from "lucide-react";
import { postsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [aiTags, setAiTags] = useState([]);
  const [similarPost, setSimilarPost] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.title.trim().length < 5) {
      setError("Title must be at least 5 characters long");
      toast.error("Title must be at least 5 characters");
      return;
    }

    if (formData.content.trim().length < 10) {
      setError("Content must be at least 10 characters long");
      toast.error("Content must be at least 10 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSimilarPost(null);

      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await postsAPI.createPost({
        title: formData.title,
        content: formData.content,
        isAnonymous: user ? isAnonymous : undefined, // Only send if logged in
        tags,
      });

      // Show AI-suggested tags if any
      if (response.data.aiSuggestions?.tags?.length > 0) {
        setAiTags(response.data.aiSuggestions.tags);
        toast.success(
          `🤖 AI suggested ${response.data.aiSuggestions.tags.length} tags!`
        );
      }

      toast.success("Question posted successfully! 🎉");
      setFormData({ title: "", content: "", tags: "" });
      setIsAnonymous(false);
      setAiTags([]);
      setSimilarPost(null);
      onPostCreated();
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = errors.map((err) => err.message).join(", ");
        setError(errorMessages);
        toast.error(errorMessages);
        return;
      }

      const errorMsg = error.response?.data?.message || "Error creating post";
      setError(errorMsg);

      // Check if it's a duplicate post
      if (error.response?.data?.similarPost) {
        setSimilarPost(error.response.data.similarPost);
        toast.error("Similar question already exists!");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Ask a Question
              </h2>
              {user && (
                <p className="text-xs text-gray-600 mt-1">
                  Posting as:{" "}
                  <span className="font-semibold text-purple-700">
                    {user.username}
                  </span>
                </p>
              )}
              {!user && (
                <p className="text-xs text-gray-600 mt-1">
                  Posting as:{" "}
                  <span className="font-semibold text-gray-700">
                    Guest (Anonymous)
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            {similarPost && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  ⚠️ A similar question already exists:
                </p>
                <p className="text-sm text-yellow-700 font-medium">
                  {similarPost.title}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Similarity: {Math.round(similarPost.similarity)}%
                </p>
              </motion.div>
            )}

            {/* Anonymous Toggle */}
            {user && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  {isAnonymous ? (
                    <UserX className="w-5 h-5 text-purple-600" />
                  ) : (
                    <User className="w-5 h-5 text-purple-600" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-purple-900">
                      {isAnonymous
                        ? "Posting Anonymously"
                        : `Posting as ${user.username}`}
                    </p>
                    <p className="text-xs text-purple-600">
                      {isAnonymous
                        ? "Your identity will be hidden"
                        : "Your name will be visible"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAnonymous ? "bg-purple-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAnonymous ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="What's your question? Be specific..."
                className="input-field"
                required
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Provide more details about your question..."
                rows="6"
                className="input-field resize-none"
                required
                maxLength={5000}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.content.length}/5000 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., react, javascript, hooks (comma separated)"
                className="input-field"
              />
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                AI will suggest relevant tags automatically
              </p>
            </div>

            {aiTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
              >
                <p className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Suggested Tags:
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Question
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreatePostModal;
