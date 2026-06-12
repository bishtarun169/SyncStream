// Entry point of Socket.IO
const presenceHandler = require("./presenceHandler");
const roomHandler = require("./roomHandler");
const mediaHandler = require("./mediaHandler");
const chatHandler = require("./chatHandler");
const moderationHandler = require("./moderationHandler");

// listen for new socket connection
function initializeSocket(io) {
    io.on("connection", (socket) => {

        // Register all event handlers
        presenceHandler(io, socket);
        roomHandler(io, socket);
        mediaHandler(io, socket);
        chatHandler(io, socket);
        moderationHandler(io, socket);

        socket.on("disconnect", () => {
            console.log("Disconnected:", socket.id);
        });

    });
}

module.exports = initializeSocket;