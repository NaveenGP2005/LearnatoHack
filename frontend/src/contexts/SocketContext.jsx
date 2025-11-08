import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to Socket.io server
    const newSocket = io(
      import.meta.env.VITE_API_URL || "http://localhost:5000",
      {
        transports: ["websocket", "polling"],
      }
    );

    newSocket.on("connect", () => {
      console.log("Socket.io connected:", newSocket.id);
      setConnected(true);
      // Join the forum room
      newSocket.emit("join", "forum");
    });

    newSocket.on("disconnect", () => {
      console.log("Socket.io disconnected");
      setConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("Socket.io error:", error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
