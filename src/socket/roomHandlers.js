const Room = require("../models/Room");

const handleJoin = async (socket, { roomId, readOnly = false }) => {
  try {
    // Join the socket room
    socket.join(roomId);

    // Find or create room in MongoDB
    let room = await Room.findOne({ roomId });
    if (!room) {
      room = await Room.create({
        roomId,
        participants: readOnly ? [] : [socket.id],
        readOnlyParticipants: readOnly ? [socket.id] : [],
      });
    } else {
      // Add participant if not already in the room
      if (readOnly) {
        if (!room.readOnlyParticipants.includes(socket.id)) {
          room.readOnlyParticipants.push(socket.id);
          await room.save();
        }
      } else {
        if (!room.participants.includes(socket.id)) {
          room.participants.push(socket.id);
          await room.save();
        }
      }
    }

    // Store read-only status in socket for later use
    socket.readOnly = readOnly;

    // Send current room data to the new participant
    socket.emit("sync", {
      content: room.content,
      lastModified: room.lastModified,
      readOnly: readOnly,
    });

    console.log(
      `Client ${socket.id} joined room ${roomId} as ${
        readOnly ? "read-only" : "editor"
      }`
    );
  } catch (error) {
    console.error("Error joining room:", error);
    socket.emit("error", "Failed to join room");
  }
};

const handleSync = async (socket, { roomId, content }) => {
  try {
    // Prevent read-only users from sending updates
    if (socket.readOnly) {
      socket.emit("error", "Read-only users cannot modify content");
      return;
    }

    const room = await Room.findOneAndUpdate(
      { roomId },
      {
        content,
        lastModified: new Date(),
        $addToSet: { participants: socket.id },
      },
      { new: true }
    );

    if (room) {
      // Broadcast to all clients in the room except sender
      socket.to(roomId).emit("sync", {
        content: room.content,
        lastModified: room.lastModified,
      });
    }
  } catch (error) {
    console.error("Error syncing content:", error);
    socket.emit("error", "Failed to sync content");
  }
};

const handleLeave = async (socket, roomId) => {
  try {
    socket.leave(roomId);

    // Remove participant from room based on their role
    const update = socket.readOnly
      ? { $pull: { readOnlyParticipants: socket.id } }
      : { $pull: { participants: socket.id } };

    await Room.findOneAndUpdate({ roomId }, update);

    console.log(`Client ${socket.id} left room ${roomId}`);
  } catch (error) {
    console.error("Error leaving room:", error);
  }
};

const handleDisconnect = async (socket) => {
  console.log("Client disconnected:", socket.id);
  // Clean up rooms where this socket was a participant
  await Room.updateMany(
    {
      $or: [{ participants: socket.id }, { readOnlyParticipants: socket.id }],
    },
    {
      $pull: {
        participants: socket.id,
        readOnlyParticipants: socket.id,
      },
    }
  );
};

module.exports = {
  handleJoin,
  handleSync,
  handleLeave,
  handleDisconnect,
};
