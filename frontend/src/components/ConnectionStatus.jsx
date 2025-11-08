import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";
import { useSocket } from "../contexts/SocketContext";

const ConnectionStatus = () => {
  const { connected } = useSocket();

  return (
    <AnimatePresence>
      {!connected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 bg-red-500/90 backdrop-blur-lg text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 border border-red-400/20"
        >
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">Disconnected</span>
        </motion.div>
      )}
      {connected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 bg-green-500/90 backdrop-blur-lg text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 border border-green-400/20"
        >
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Live Updates Active</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
