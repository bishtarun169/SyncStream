
// shared socket state while server is running
const userSocketMap = new Map();
const lastIncrementMap = new Map();
const roomConnections = new Map();
const cleanupTimeouts = new Map();

module.exports = { userSocketMap,lastIncrementMap, roomConnections, cleanupTimeouts };