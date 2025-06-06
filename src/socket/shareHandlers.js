const Share = require("../models/Share");
const Room = require("../models/Room");

const handleCreateShare = async (socket, { roomId, isReadOnly = true }) => {
  try {
    // Verify the user is a participant in the room
    const room = await Room.findOne({
      roomId,
      participants: socket.id,
    });

    if (!room) {
      socket.emit(
        "share:error",
        "You don't have permission to share this room"
      );
      return;
    }

    // Create new share link
    const share = await Share.create({
      roomId,
      isReadOnly,
      createdBy: socket.id,
    });

    // Emit the share link to the creator
    socket.emit("share:created", {
      accessToken: share.accessToken,
      isReadOnly: share.isReadOnly,
      expiresAt: share.expiresAt,
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    socket.emit("share:error", "Failed to create share link");
  }
};

const handleJoinWithToken = async (socket, { accessToken }) => {
  try {
    // Find valid share link
    const share = await Share.findOne({
      accessToken,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!share) {
      socket.emit("share:error", "Invalid or expired share link");
      return;
    }

    // Find the room
    const room = await Room.findOne({ roomId: share.roomId });
    if (!room) {
      socket.emit("share:error", "Room not found");
      return;
    }

    // Join the socket room
    socket.join(share.roomId);

    // Add participant based on share type
    if (share.isReadOnly) {
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

    // Store access type in socket
    socket.readOnly = share.isReadOnly;
    socket.shareToken = accessToken;

    // Send current room data
    socket.emit("sync", {
      content: room.content,
      lastModified: room.lastModified,
      readOnly: share.isReadOnly,
    });

    console.log(
      `Client ${socket.id} joined room ${share.roomId} via share link (${
        share.isReadOnly ? "read-only" : "editor"
      })`
    );
  } catch (error) {
    console.error("Error joining with share token:", error);
    socket.emit("share:error", "Failed to join room");
  }
};

const handleRevokeShare = async (socket, { accessToken }) => {
  try {
    // Find and verify ownership of share link
    const share = await Share.findOne({
      accessToken,
      createdBy: socket.id,
    });

    if (!share) {
      socket.emit(
        "share:error",
        "Share link not found or you don't have permission to revoke it"
      );
      return;
    }

    // Deactivate the share link
    share.isActive = false;
    await share.save();

    socket.emit("share:revoked", { accessToken });
  } catch (error) {
    console.error("Error revoking share link:", error);
    socket.emit("share:error", "Failed to revoke share link");
  }
};

const handleListShares = async (socket, { roomId }) => {
  try {
    // Verify the user is a participant in the room
    const room = await Room.findOne({
      roomId,
      participants: socket.id,
    });

    if (!room) {
      socket.emit(
        "share:error",
        "You don't have permission to list shares for this room"
      );
      return;
    }

    // Get all active shares for the room
    const shares = await Share.find({
      roomId,
      createdBy: socket.id,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).select("accessToken isReadOnly createdAt expiresAt");

    socket.emit("share:list", shares);
  } catch (error) {
    console.error("Error listing shares:", error);
    socket.emit("share:error", "Failed to list share links");
  }
};

module.exports = {
  handleCreateShare,
  handleJoinWithToken,
  handleRevokeShare,
  handleListShares,
};
