const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  content: { type: String, default: "" },
  lastModified: { type: Date, default: Date.now },
  participants: [{ type: String }],
  readOnlyParticipants: [{ type: String }],
});

module.exports = mongoose.model("Room", RoomSchema);
