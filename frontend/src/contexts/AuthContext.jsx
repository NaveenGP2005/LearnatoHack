import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/authAPI";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error("Failed to load user:", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register function
  const register = async (username, email, password) => {
    try {
      const response = await authAPI.register({ username, email, password });
      const { user, token } = response;

      localStorage.setItem("token", token);
      setUser(user);
      setToken(token);

      toast.success(`Welcome ${user.username}! 🎉`);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response;

      localStorage.setItem("token", token);
      setUser(user);
      setToken(token);

      toast.success(`Welcome back, ${user.username}! 👋`);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    toast.success("Logged out successfully");
  };

  // Update profile
  const updateProfile = async (data) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.message || "Update failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Password change failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === "admin" || user?.role === "moderator";
  };

  // Get auth token
  const getToken = () => {
    return token;
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    isAdmin,
    getToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
