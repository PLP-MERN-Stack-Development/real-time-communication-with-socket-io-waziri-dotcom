// server/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const config = require("./config");

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: config.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Track online users
let onlineUsers = new Map(); // socket.id -> username
let userSockets = new Map(); // username -> socket.id

io.on("connection", (socket) => {
  const username = socket.handshake.query.username;
  if (username) {
    onlineUsers.set(socket.id, username);
    userSockets.set(username, socket.id);

    console.log(`✅ ${username} connected`);
    io.emit("users:update", Array.from(onlineUsers.values()));
  }

  // 🟢 Global messages
  socket.on("chat:message", (msg) => {
    io.emit("chat:message", msg);
  });

  // 🟡 Typing indicator
  socket.on("user:typing", (username) => {
    socket.broadcast.emit("user:typing", username);
  });

  // 🟣 Private message
  socket.on("private:message", ({ sender, receiver, text }) => {
    const targetSocketId = userSockets.get(receiver);
    const message = {
      sender,
      receiver,
      text,
      timestamp: new Date().toISOString(),
    };

    if (targetSocketId) {
      io.to(targetSocketId).emit("private:message", message);
    }

    // Optional: send delivery confirmation
    socket.emit("private:delivered", message);

    // Also send notification
    if (targetSocketId) {
      io.to(targetSocketId).emit("notify:message", {
        title: "New Message 💬",
        body: `Message from ${sender}`,
      });
    }
  });

  // 🔴 User disconnects
  socket.on("disconnect", () => {
    const name = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    userSockets.delete(name);
    console.log(`❌ ${name || "Unknown"} disconnected`);
    io.emit("users:update", Array.from(onlineUsers.values()));
  });
});

app.get("/", (req, res) => {
  res.send("💬 Chumbi Nyiri server is live");
});

server.listen(config.PORT, () => {
  console.log(`🚀 Server running on port ${config.PORT}`);
});

const path = require("path");

// Serve React build files in production
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}
