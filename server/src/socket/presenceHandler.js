// handler to manage user online or offline presence

const User = require("../models/User");
const { userSocketMap,roomConnections, cleanupTimeouts } = require("./socketState");

function presenceHandler(io, socket) {
    // User comes online
    socket.on("user:online", ({ userId }) => {
        if (!userId) return;
        userSocketMap.set(userId, socket.id);
        socket.userId = userId;
        io.emit("presence:update", {
            userId,
            status: "online"
        });

        console.log(`User ${userId} is online`);
    });

    // Check user status
    socket.on("presence:check", ({ userId }, callback) => {
        callback?.({
            userId,
            online: userSocketMap.has(userId)
        });
    });

    // unintentinal disconnect
    socket.on("disconnect", () => {
        const userId = socket.userId;
        if (!userId) return;
        userSocketMap.delete(userId);

        // Remove user from room tracking
        for (const [roomId, users] of roomConnections.entries()) {
            if (!users.has(userId)) continue;
            const socketSet = users.get(userId);
            socketSet.delete(socket.id);
            if (socketSet.size === 0) {
                users.delete(userId);
            }
            if (users.size === 0) {
                roomConnections.delete(roomId);
            }
        }

        // Clear pending cleanup timer
        const cleanupKey = `${userId}`;

        if (cleanupTimeouts.has(cleanupKey)) {
            clearTimeout(cleanupTimeouts.get(cleanupKey));
            cleanupTimeouts.delete(cleanupKey);
        }

        io.emit("presence:update", {
            userId,
            status: "offline"
        });

        console.log(`User ${userId} is offline`);
    });
};

module.exports = presenceHandler;