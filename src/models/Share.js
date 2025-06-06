const mongoose = require("mongoose");
const crypto = require("crypto");

const ShareSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  accessToken: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(32).toString("hex"),
  },
  isReadOnly: { type: Boolean, default: true },
  createdBy: { type: String, required: true }, // socket.id of creator
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }, // 30 days expiry
  isActive: { type: Boolean, default: true },
});

// Index for faster queries
ShareSchema.index({ accessToken: 1 });
ShareSchema.index({ roomId: 1 });

module.exports = mongoose.model("Share", ShareSchema);
