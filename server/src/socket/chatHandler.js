// Room  chat handle

function chatHandler (io, socket) {
    socket.on("send-chat-message", ({ roomId, message }) => {
        if (!roomId || !message) return;
        socket.to(roomId).emit("receive-chat-message", {
            message
        });
    });

};

module.exports = chatHandler;