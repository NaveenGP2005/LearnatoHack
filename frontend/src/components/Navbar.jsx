import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Home, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
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
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
