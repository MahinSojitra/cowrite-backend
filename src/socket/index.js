const { Server } = require("socket.io");
const {
  handleJoin,
  handleSync,
  handleLeave,
  handleDisconnect,
} = require("./roomHandlers");
const {
  handleCreateShare,
  handleJoinWithToken,
  handleRevokeShare,
  handleListShares,
} = require("./shareHandlers");

const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:4200",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Room events
    socket.on("join", (data) => handleJoin(socket, data));
    socket.on("sync", (data) => handleSync(socket, data));
    socket.on("leave", (roomId) => handleLeave(socket, roomId));
    socket.on("disconnect", () => handleDisconnect(socket));

    // Share events
    socket.on("share:create", (data) => handleCreateShare(socket, data));
    socket.on("share:join", (data) => handleJoinWithToken(socket, data));
    socket.on("share:revoke", (data) => handleRevokeShare(socket, data));
    socket.on("share:list", (data) => handleListShares(socket, data));
  });

  return io;
};

module.exports = setupSocketIO;
