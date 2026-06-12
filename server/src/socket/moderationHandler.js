
const User = require("../models/User");
function moderationHandler (io, socket) {
    // Kick user by host
    socket.on("kick-user", ({ roomId, targetUserId }) => {
        try {
            if (!roomId || !targetUserId) return;
            socket.to(roomId).emit("user-kicked", {
                targetUserId
            });

        } catch (error) {
            console.error("kick-user error:", error);
        }

    });

    // mute or unmute user
    socket.on("mute-user", ({ roomId, targetUserId, isMuted }) => {
        try {
            if (!roomId || !targetUserId) return;

            socket.to(roomId).emit("user-mute-toggled", {
                targetUserId,
                isMuted
            });

        } catch (error) {
            console.error("mute-user error:", error);
        }

    });


    // room settings changed
    socket.on("room-settings-update", ({ roomId, settings }) => {
        try {
            if (!roomId) return;
            socket.to(roomId).emit(
                "room-settings-changed",
                settings
            );

        } catch (error) {
            console.error("room-settings-update error:", error);
        }

    });

};

module.exports = moderationHandler;
