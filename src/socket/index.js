const { Server } = require("socket.io");
const {
  handleJoin,
  handleSync,
  handleLeave,
  handleDisconnect,
} = require("./roomHandlers");

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
    socket.on("join", (roomId) => handleJoin(socket, roomId));
    socket.on("sync", (data) => handleSync(socket, data));
    socket.on("leave", (roomId) => handleLeave(socket, roomId));
    socket.on("disconnect", () => handleDisconnect(socket));
  });

  return io;
};

module.exports = setupSocketIO;
