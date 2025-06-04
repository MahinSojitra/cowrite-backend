const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:4200" }));
app.use(express.json());

// Basic health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
