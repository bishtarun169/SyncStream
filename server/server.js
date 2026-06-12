require("dotenv").config();
const http = require('http');

// env file check
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in .env');
}

const app = require("./src/app");

// Connect through Mongodb
const connectDB = require("./src/config/db");
connectDB();

const PORT = process.env.PORT || 5000;

const initializeSocket = require("./src/socket");
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// make io available to controllers
app.set("io", io);

// initialize all socket handlers
initializeSocket(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});