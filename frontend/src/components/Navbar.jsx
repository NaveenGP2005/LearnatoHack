import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Home,
  Sparkles,
  Zap,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Shield,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl"
            >
              <MessageSquare className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold gradient-text flex items-center gap-1.5">
                Learnato Forum
                <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
              </h1>
              <p className="text-xs text-gray-600 font-medium">
                Empowering Learning Through Conversation
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 bg-white/50 hover:bg-white hover:shadow-md transition-all duration-300 font-medium border border-gray-200/50"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-xl shadow-lg animate-gradient pulse-glow"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span className="text-sm font-bold text-white">
                Hackathon 2025
              </span>
            </motion.div>

            {/* Auth Buttons */}
            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg transition-all duration-300 font-medium"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-6 h-6 rounded-full border-2 border-white"
                  />
                  <span>{user.username}</span>
                  {user.reputation > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full">
                      <Award className="w-3 h-3" />
                      <span className="text-xs font-bold">
                        {user.reputation}
                      </span>
                    </div>
                  )}
                </motion.button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-accent-50 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-800">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-xs text-primary-600">
                            <Award className="w-3 h-3" />
                            <span className="font-semibold">
                              {user.reputation} points
                            </span>
                          </div>
                          {(user.role === "admin" ||
                            user.role === "moderator") && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {user.role}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {isAdmin() && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-purple-600" />
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 bg-white/50 hover:bg-white hover:shadow-md transition-all duration-300 font-medium border border-gray-200/50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
