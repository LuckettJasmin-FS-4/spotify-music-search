const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const { getValidSpotifyToken } = require("../utils/spotifyToken");

const router = express.Router();

// Search Spotify for tracks, artists, and albums.
router.get("/search", async (req, res) => {
  const sessionToken = req.cookies?.racket_session;
  const searchTerm = req.query.q?.trim();

  if (!sessionToken) {
    return res.status(401).json({
      success: false,
      message: "Please log in to Racket first",
    });
  }

  if (typeof searchTerm !== "string" || !searchTerm) {
    return res.status(400).json({
      success: false,
      message: "Please enter a search term",
    });
  }

  try {
    const session = jwt.verify(
      sessionToken,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    const spotifyToken = await getValidSpotifyToken(
      session.userId
    );

    const response = await axios.get(
      "https://api.spotify.com/v1/search",
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
        params: {
          q: searchTerm,
          type: "track,artist,album",
          limit: 10,
        },
        timeout: 10000,
      }
    );

    return res.json({
      success: true,
      query: searchTerm,
      tracks: response.data.tracks?.items || [],
      artists: response.data.artists?.items || [],
      albums: response.data.albums?.items || [],
    });
  } catch (error) {
    console.error(
      "Spotify search failed:",
      error.response?.status || error.message
    );

    if (error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Your Racket session has expired",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to complete Spotify search",
    });
  }
});

module.exports = router;