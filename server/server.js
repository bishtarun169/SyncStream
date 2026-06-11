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

// Maps for presence and timers
const userSocketMap = new Map();
const lastIncrementMap = new Map();

// Track active sockets per room and user: roomId -> Map(userId -> Set(socketId))
const roomConnections = new Map();
const cleanupTimeouts = new Map(); // key: `${roomId}_${userId}` -> timeoutId

// Expose io and userSocketMap to express app
app.set("io", io);
app.set("userSocketMap", userSocketMap);

const User = require("./src/models/User");

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Home notification presence mapping
  socket.on("join-home", ({ userId }) => {
    if (userId) {
      userSocketMap.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} joined home on socket ${socket.id}`);
    }
  });

  socket.on("join-public-rooms", () => {
    socket.join("public-rooms");
    console.log(`Socket ${socket.id} joined public-rooms channel`);
  });

  socket.on("join-room", async ({ roomId, userId, role }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;
    socket.role = role;
    console.log(`Socket ${socket.id} (user: ${userId}, role: ${role}) joined room: ${roomId}`);

    if (roomId && userId) {
      // Clear any pending cleanup timeout for this user in this room
      const timeoutKey = `${roomId}_${userId}`;
      if (cleanupTimeouts.has(timeoutKey)) {
        clearTimeout(cleanupTimeouts.get(timeoutKey));
        cleanupTimeouts.delete(timeoutKey);
        console.log(`Cancelled pending cleanup for user ${userId} in room ${roomId}`);
      }

      // Add to connection tracking
      if (!roomConnections.has(roomId)) {
        roomConnections.set(roomId, new Map());
      }
      const userSockets = roomConnections.get(roomId);
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);
    }

    // Broadcast user joined info to the room
    try {
      if (userId) {
        const userObj = await User.findById(userId).select("name email userId profilePic");
        if (userObj) {
          socket.to(roomId).emit("participant-joined", {
            user: userObj,
            role: role || "member",
            isMuted: false,
            joinedAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error("Error in join-room socket broadcast:", error);
    }
  });

  // Host playback actions
  socket.on("host-play", ({ roomId, currentTime }) => {
    socket.to(roomId).emit("media-play", { currentTime });
  });

  socket.on("host-pause", ({ roomId }) => {
    socket.to(roomId).emit("media-pause");
  });

  socket.on("host-seek", ({ roomId, currentTime }) => {
    socket.to(roomId).emit("media-seek", { currentTime });
  });

  // Host heartbeat & totalWatchMinutes increment
  socket.on("host-heartbeat", async ({ roomId, currentTime, isPlaying }) => {
    socket.to(roomId).emit("media-heartbeat", { currentTime, isPlaying });

    if (isPlaying && socket.role === "host" && socket.userId) {
      const now = Date.now();
      const lastTime = lastIncrementMap.get(socket.id) || 0;
      if (now - lastTime >= 60000) {
        lastIncrementMap.set(socket.id, now);
        try {
          await User.findByIdAndUpdate(socket.userId, { $inc: { totalWatchMinutes: 1 } });
          console.log(`Incremented totalWatchMinutes for host ${socket.userId}`);
        } catch (error) {
          console.error("Error incrementing watch minutes:", error);
        }
      }
    }
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

  // Kick and Mute direct socket events (instant broadcast)
  socket.on("kick-user", ({ roomId, targetUserId }) => {
    socket.to(roomId).emit("user-kicked", { targetUserId });
  });

  socket.on("mute-user", ({ roomId, targetUserId, isMuted }) => {
    socket.to(roomId).emit("user-mute-toggled", { targetUserId, isMuted });
  });

  // Room settings update (instant broadcast)
  socket.on("room-settings-update", ({ roomId, settings }) => {
    socket.to(roomId).emit("room-settings-changed", settings);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Clean up timers
    lastIncrementMap.delete(socket.id);

    // Clean up home presence map
    if (socket.userId && userSocketMap.get(socket.userId) === socket.id) {
      userSocketMap.delete(socket.userId);
      console.log(`User ${socket.userId} removed from presence map`);
    }

    // Handle room connection disconnect tracking and cleanup
    if (socket.roomId && socket.userId) {
      const { roomId, userId } = socket;

      const userSockets = roomConnections.get(roomId);
      if (userSockets && userSockets.has(userId)) {
        const socketsSet = userSockets.get(userId);
        socketsSet.delete(socket.id);

        if (socketsSet.size === 0) {
          userSockets.delete(userId);
          if (userSockets.size === 0) {
            roomConnections.delete(roomId);
          }

          // No active socket connections remain for this user in this room.
          // Schedule database cleanup and notifications after 5 seconds grace period.
          const timeoutKey = `${roomId}_${userId}`;
          if (cleanupTimeouts.has(timeoutKey)) {
            clearTimeout(cleanupTimeouts.get(timeoutKey));
          }

          const timeoutId = setTimeout(async () => {
            cleanupTimeouts.delete(timeoutKey);
            console.log(`Running database cleanup for user ${userId} leaving room ${roomId}`);

            try {
              const Room = require("./src/models/Room");
              const roomObj = await Room.findOne({ roomCode: roomId, isActive: true });
              if (roomObj) {
                if (roomObj.host.toString() === userId) {
                  // Host left permanently: deactivate room
                  roomObj.isActive = false;
                  await roomObj.save();
                  console.log(`Host disconnected permanently. Room ${roomId} marked inactive.`);

                  // Notify all room guests
                  io.to(roomId).emit("room-ended");
                } else {
                  // Guest left permanently: remove from participant list
                  roomObj.participants = roomObj.participants.filter(
                    p => p.user && p.user.toString() !== userId
                  );
                  await roomObj.save();
                  console.log(`Guest ${userId} disconnected permanently. Removed from room ${roomId}.`);

                  // Broadcast participant left to remaining guests
                  io.to(roomId).emit("participant-left", { userId });
                }

                // If room was public, notify all clients on JoinRoom page
                if (roomObj.privacy === "public") {
                  io.to("public-rooms").emit("public-rooms-updated");
                }
              }
            } catch (err) {
              console.error(`Error in scheduled room cleanup for user ${userId}:`, err);
            }
          }, 5000);

          cleanupTimeouts.set(timeoutKey, timeoutId);
        }
      }
    }
  });
});