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
   console.error("Spotify save failed:", {
  status: error.response?.status,
  details: error.response?.data?.error,
  message: error.message,
});

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
// Get the logged-in user's Spotify playlists.
router.get("/playlists", async (req, res) => {
  const sessionToken = req.cookies?.racket_session;

  if (!sessionToken) {
    return res.status(401).json({
      success: false,
      message: "Please log in to Racket first",
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
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
        params: {
          limit: 20,
          offset: 0,
        },
        timeout: 10000,
      }
    );

    return res.json({
      success: true,
      playlists: response.data.items || [],
      total: response.data.total || 0,
    });
  } catch (error) {
    console.error("Spotify save failed:", {
  status: error.response?.status,
  details: error.response?.data?.error,
  message: error.message,
});

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your Racket session has expired",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to retrieve Spotify playlists",
    });
  }
});
// Get the logged-in user's liked songs.
router.get("/liked-songs", async (req, res) => {
  const sessionToken = req.cookies?.racket_session;

  if (!sessionToken) {
    return res.status(401).json({
      success: false,
      message: "Please log in to Racket first",
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
      "https://api.spotify.com/v1/me/tracks",
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
        params: {
          limit: 20,
          offset: 0,
        },
        timeout: 10000,
      }
    );

    return res.json({
      success: true,
      tracks: response.data.items || [],
      total: response.data.total || 0,
    });
  } catch (error) {
    console.error(
      "Spotify liked songs failed:",
      error.response?.status || error.message
    );

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your Racket session has expired",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to retrieve liked songs",
    });
  }
});

// Get the logged-in user's saved Spotify albums.
router.get("/saved-albums", async (req, res) => {
  const sessionToken = req.cookies?.racket_session;

  if (!sessionToken) {
    return res.status(401).json({
      success: false,
      message: "Please log in to Racket first",
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
      "https://api.spotify.com/v1/me/albums",
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
        params: {
          limit: 20,
          offset: 0,
        },
        timeout: 10000,
      }
    );

    return res.json({
      success: true,
      albums: response.data.items || [],
      total: response.data.total || 0,
    });
  } catch (error) {
    console.error(
      "Spotify saved albums failed:",
      error.response?.status || error.message
    );

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your Racket session has expired",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to retrieve saved albums",
    });
  }
});

// Get the logged-in user's followed Spotify artists.
router.get("/followed-artists", async (req, res) => {
  const sessionToken = req.cookies?.racket_session;

  if (!sessionToken) {
    return res.status(401).json({
      success: false,
      message: "Please log in to Racket first",
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
      "https://api.spotify.com/v1/me/following",
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
        params: {
          type: "artist",
          limit: 20,
        },
        timeout: 10000,
      }
    );

    return res.json({
      success: true,
      artists: response.data.artists?.items || [],
      total: response.data.artists?.total || 0,
    });
  } catch (error) {
    console.error(
      "Spotify followed artists failed:",
      error.response?.status || error.message
    );

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your Racket session has expired",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to retrieve followed artists",
    });
  }
});
// Save a song to the logged-in user's Spotify library.
router.put("/save-track/:trackId", async (req, res) => {
  const sessionToken = req.cookies?.racket_session;
  const { trackId } = req.params;

  if (!sessionToken) {
    return res.status(401).json({
      success: false,
      message: "Please log in to Racket first",
    });
  }

  if (!/^[A-Za-z0-9]{22}$/.test(trackId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Spotify track ID",
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

    await axios.put(
      `https://api.spotify.com/v1/me/tracks?ids=${encodeURIComponent(trackId)}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
        timeout: 10000,
      }
    );

    return res.json({
      success: true,
      message: "Song saved to your Spotify library!",
      trackId,
    });
  } catch (error) {
    console.error(
      "Spotify save failed:",
      error.response?.status || error.message
    );

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your Racket session has expired",
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        success: false,
        message: "Spotify permission required. Please reconnect your account.",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to save this song right now",
    });
  }
});
// Retrieve individual Spotify album or artist details.
async function getSpotifyDetails(req, res, resource) {
  const sessionToken = req.cookies?.racket_session;
  const { id } = req.params;

  if (!sessionToken) {
    return res.status(401).json({
      success: false,
      message: "Please log in to Racket first",
    });
  }

  if (!/^[A-Za-z0-9]{22}$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Spotify ID",
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
      `https://api.spotify.com/v1/${resource}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
        timeout: 10000,
      }
    );

    return res.json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error("Spotify details failed:", {
      resource,
      status: error.response?.status,
      message: error.message,
    });

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your Racket session has expired",
      });
    }

    const status = error.response?.status;

    return res.status(
      [403, 404, 429].includes(status) ? status : 502
    ).json({
      success: false,
      message: "Unable to retrieve Spotify details",
    });
  }
}

// Get an individual album.
router.get("/albums/:id", (req, res) => {
  return getSpotifyDetails(req, res, "albums");
});

// Get an individual artist.
router.get("/artists/:id", (req, res) => {
  return getSpotifyDetails(req, res, "artists");
});
module.exports = router;