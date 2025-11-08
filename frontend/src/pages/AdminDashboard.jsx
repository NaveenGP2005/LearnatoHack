import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Shield,
  Award,
  Activity,
  Clock,
  Loader2,
} from "lucide-react";
import { adminAPI } from "../services/authAPI";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [moderation, setModeration] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, analyticsData, moderationData, usersData] =
        await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getAnalytics(timeRange),
          adminAPI.getModerationSuggestions(),
          adminAPI.getAllUsers({ limit: 10 }),
        ]);

      setStats(statsData);
      setAnalytics(analyticsData);
      setModeration(moderationData);
      setUsers(usersData.users);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUser(userId, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await adminAPI.deletePost(postId);
      toast.success("Post deleted successfully");
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleResolvePost = async (postId) => {
    try {
      await adminAPI.markPostResolved(postId);
      toast.success("Post marked as resolved");
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to resolve post");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Manage your forum with powerful insights and AI-powered tools
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <div className="mb-6 flex gap-2">
        {["24h", "7d", "30d", "90d"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              timeRange === range
                ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {range === "24h"
              ? "24 Hours"
              : range === "7d"
              ? "7 Days"
              : range === "30d"
              ? "30 Days"
              : "90 Days"}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.overview?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Posts"
          value={stats?.overview?.totalPosts || 0}
          icon={<FileText className="w-6 h-6" />}
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Total Replies"
          value={stats?.overview?.totalReplies || 0}
          icon={<MessageSquare className="w-6 h-6" />}
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Resolution Rate"
          value={`${stats?.overview?.resolutionRate?.toFixed(1) || 0}%`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="from-amber-500 to-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Posts Per Day Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            Posts Activity (Last 7 Days)
          </h3>
          <div className="space-y-3">
            {stats?.postsPerDay && stats.postsPerDay.length > 0 ? (
              stats.postsPerDay.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-24">
                    {new Date(day._id).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (day.count /
                            Math.max(
                              ...stats.postsPerDay.map((d) => d.count)
                            )) *
                          100
                        }%`,
                      }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-white">
                        {day.count}
                      </span>
                    </motion.div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No activity in the last 7 days
              </p>
            )}
          </div>
        </motion.div>

        {/* Top Contributors */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Top Contributors
          </h3>
          <div className="space-y-3">
            {stats?.topContributors && stats.topContributors.length > 0 ? (
              stats.topContributors.map((user, index) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0
                        ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                        : index === 1
                        ? "bg-gradient-to-br from-gray-400 to-gray-500"
                        : index === 2
                        ? "bg-gradient-to-br from-orange-400 to-amber-500"
                        : "bg-gradient-to-br from-purple-400 to-pink-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-10 h-10 rounded-full border-2 border-white shadow"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user.postsCount} posts, {user.repliesCount} replies
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-700">
                      {user.reputation}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No contributors yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Trending Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-8"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Trending Tags
        </h3>
        <div className="flex flex-wrap gap-3">
          {stats?.trendingTags && stats.trendingTags.length > 0 ? (
            stats.trendingTags.map((tag, index) => (
              <motion.div
                key={tag._id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-200"
              >
                <span className="font-bold text-purple-800">#{tag._id}</span>
                <span className="ml-2 text-sm text-purple-600">
                  ({tag.count})
                </span>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No trending tags yet</p>
          )}
        </div>
      </motion.div>

      {/* AI Moderation Suggestions */}
      {moderation &&
        moderation.suggestions &&
        moderation.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-8 border-2 border-amber-200"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              🤖 AI Moderation Suggestions
            </h3>

            {/* Duplicate Posts */}
            {moderation.suggestions.filter((s) => s.type === "duplicate")
              .length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  📋 Potential Duplicates (
                  {
                    moderation.suggestions.filter((s) => s.type === "duplicate")
                      .length
                  }
                  )
                </h4>
                <div className="space-y-2">
                  {moderation.suggestions
                    .filter((s) => s.type === "duplicate")
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item.post._id}
                        className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <p className="font-medium text-gray-900 text-sm">
                          {item.post.title}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-yellow-700">
                            Similarity: {Math.round(item.similarity)}%
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResolvePost(item.post._id)}
                              className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleDeletePost(item.post._id)}
                              className="text-xs px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Toxic Content */}
            {moderation.suggestions.filter((s) => s.type === "toxic").length >
              0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  ⚠️ Potentially Toxic Content (
                  {
                    moderation.suggestions.filter((s) => s.type === "toxic")
                      .length
                  }
                  )
                </h4>
                <div className="space-y-2">
                  {moderation.suggestions
                    .filter((s) => s.type === "toxic")
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item.post._id}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">
                          {item.post.title}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-red-700">
                            Confidence: {Math.round(item.toxicityScore * 100)}%
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResolvePost(item.post._id)}
                              className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleDeletePost(item.post._id)}
                              className="text-xs px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Low Quality */}
            {moderation.suggestions.filter((s) => s.type === "low_quality")
              .length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  📉 Low Quality Posts (
                  {
                    moderation.suggestions.filter(
                      (s) => s.type === "low_quality"
                    ).length
                  }
                  )
                </h4>
                <div className="space-y-2">
                  {moderation.suggestions
                    .filter((s) => s.type === "low_quality")
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item.post._id}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">
                          {item.post.title}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-600">
                            {item.reason || "Low engagement"}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResolvePost(item.post._id)}
                              className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleDeletePost(item.post._id)}
                              className="text-xs px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  <div
                    key={post._id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">
                      {post.title}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-600">
                        {post.content.length} chars, {post.votes} votes,{" "}
                        {post.replies?.length || 0} replies
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolvePost(post._id)}
                          className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-xs px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

      {/* User Management Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          User Management
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Reputation
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Posts
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full border border-gray-200"
                      />
                      <span className="font-medium text-gray-900">
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleUpdateUserRole(user._id, e.target.value)
                      }
                      className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-700">
                        {user.reputation}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.postsCount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Analytics Summary */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mt-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Analytics Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">User Growth</p>
              <p className="text-3xl font-bold text-blue-600">
                {analytics.userGrowth?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">new users in period</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Post Activity</p>
              <p className="text-3xl font-bold text-purple-600">
                {analytics.postActivity?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">posts in period</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
              <p className="text-3xl font-bold text-green-600">
                {analytics.averageResponseTime
                  ? `${Math.round(analytics.averageResponseTime / 60)}m`
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                minutes to first reply
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="glass-card p-6 relative overflow-hidden group"
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500`}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div
            className={`p-2 bg-gradient-to-br ${color} rounded-lg text-white`}
          >
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold gradient-text">{value}</p>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
