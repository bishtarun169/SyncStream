require("dotenv").config();

// env file check
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in .env');
}

const app = require("./src/app");

const connectDB = require("./src/config/db");
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize Socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-room", ({ roomId, userId, role }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;
    socket.role = role;
    console.log(`Socket ${socket.id} (user: ${userId}, role: ${role}) joined room: ${roomId}`);
  });

  socket.on("host-play", ({ roomId, currentTime }) => {
    socket.to(roomId).emit("media-play", { currentTime });
  });

  socket.on("host-pause", ({ roomId }) => {
    socket.to(roomId).emit("media-pause");
  });

  socket.on("host-seek", ({ roomId, currentTime }) => {
    socket.to(roomId).emit("media-seek", { currentTime });
  });

  socket.on("host-heartbeat", ({ roomId, currentTime, isPlaying }) => {
    socket.to(roomId).emit("media-heartbeat", { currentTime, isPlaying });
  });

  socket.on("request-host-sync", ({ roomId }) => {
    socket.to(roomId).emit("need-host-sync", { requesterId: socket.id });
  });

  socket.on("host-sync-response", ({ requesterId, currentTime, isPlaying }) => {
    io.to(requesterId).emit("receive-host-sync", { currentTime, isPlaying });
  });

  socket.on("host-load-media", ({ roomId, mediaSource, videoURL }) => {
    socket.to(roomId).emit("media-load", { mediaSource, videoURL });
  });

  socket.on("send-chat-message", ({ roomId, message }) => {
    socket.to(roomId).emit("receive-chat-message", { message });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});