// client/src/hooks/useSocket.js
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export default function useSocket(user, onMessage, onUsersUpdate, onPrivateMsg) {
  const socketRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      query: { username: user.username },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`🟢 Connected as ${user.username}`);
      socket.emit("user:online", user.username);
    });

    socket.on("chat:message", (msg) => {
      if (onMessage) onMessage(msg);
    });

    socket.on("users:update", (users) => {
      if (onUsersUpdate) onUsersUpdate(users);
    });

    socket.on("user:typing", (username) => {
      setIsTyping(username);
      setTimeout(() => setIsTyping(false), 1500);
    });

    socket.on("private:message", (msg) => {
      if (onPrivateMsg) onPrivateMsg(msg);
    });

    socket.on("notify:message", (data) => {
      showNotification(data.title, data.body);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from server");
    });

    return () => {
      socket.emit("user:offline", user.username);
      socket.disconnect();
    };
  }, [user, onMessage, onPrivateMsg, onUsersUpdate]);

  // Public chat message
  const sendMessage = (text) => {
    if (socketRef.current && text.trim()) {
      socketRef.current.emit("chat:message", {
        text,
        sender: user.username,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Typing event
  const sendTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit("user:typing", user.username);
    }
  };

  // Private message
  const sendPrivateMessage = (receiver, text) => {
    if (socketRef.current && receiver && text.trim()) {
      socketRef.current.emit("private:message", {
        sender: user.username,
        receiver,
        text,
      });
    }
  };

  // Browser notification helper
  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  };

  return {
    socket: socketRef.current,
    sendMessage,
    sendTyping,
    sendPrivateMessage,
    isTyping,
  };
}
