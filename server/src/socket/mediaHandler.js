// Media syncronizatin across host and participants

const User = require("../models/User");
const { lastIncrementMap } = require("./socketState");

function mediaHandler (io, socket) {
     // host-play
     console.log("host played");
     socket.on("host-play", ({ roomId, currentTime }) => {
          if (!roomId) return;
          socket.to(roomId).emit("media-play", {
               currentTime,
          });
     });

     // host pause
     socket.on("host-pause", ({ roomId }) => {
          if (!roomId) return;
          socket.to(roomId).emit("media-pause");
     });

     // host-seek
     socket.on("host-seek", ({ roomId, currentTime }) => {
          if (!roomId) return;
          socket.to(roomId).emit("media-seek", {
               currentTime,
          });
     });

     // host loads new meida
     socket.on("host-load-media", ({ roomId, mediaSource, videoURL }) => {
          if (!roomId) return;
          socket.to(roomId).emit("media-load", {
               mediaSource,
               videoURL,
          });
     });

     // automatic sync with host
     socket.on("host-heartbeat", async ({ roomId, currentTime, isPlaying }) => {
          if (!roomId) return;
          socket.to(roomId).emit("media-heartbeat", {
               currentTime,
               isPlaying,
          });

          if (isPlaying && socket.role === "host" && socket.userId) {
               const now = Date.now();
               const lastTime = lastIncrementMap.get(socket.id) || 0;
               if (now - lastTime >= 60000) {
                    lastIncrementMap.set(socket.id, now);
                    try {
                         await User.findByIdAndUpdate(socket.userId, {
                              $inc: {
                                   totalWatchMinutes: 1,
                              },
                         });
                    } catch (error) {
                         console.error("Watch minute increment error:", error);
                    }
               }
          }
     });

    // request host sync
     socket.on("request-host-sync", ({ roomId }) => {
          if (!roomId) return;

          socket.to(roomId).emit("need-host-sync", {
               requesterId: socket.id,
          });
     });

     // current status
     socket.on("host-sync-response", ({ requesterId, currentTime, isPlaying }) => {
          io.to(requesterId).emit("receive-host-sync", {
               currentTime,
               isPlaying,
          });
     });
};

module.exports = mediaHandler;
