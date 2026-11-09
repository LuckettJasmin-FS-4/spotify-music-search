
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

// Basic API health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    application: "Racket",
    message: "Backend API is running successfully",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Spotify Music Search API running on port ${PORT}`);
});
