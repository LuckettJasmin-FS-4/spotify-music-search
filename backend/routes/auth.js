
const express = require("express");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { saveSpotifyUser } = require("../models/User");

const router = express.Router();

router.get("/login", (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({
      error: "Spotify Client ID is not configured",
    });
  }

  const state = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "user-read-private user-read-email",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state,
  });

  res.cookie("spotify_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });

  return res.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
});

const axios = require("axios");

router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Spotify authorization was denied",
    });
  }

  const savedState = req.cookies?.spotify_auth_state;

  if (!state || !savedState || state !== savedState) {
    return res.status(403).json({
      success: false,
      message: "Invalid Spotify authorization state",
    });
  }

  res.clearCookie("spotify_auth_state");

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Authorization code is missing",
    });
  }

  try {
    const credentials = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Token persistence and JWT sessions are our next step.

    // Retrieve the authenticated Spotify user's profile.
    const profileResponse = await axios.get(
      "https://api.spotify.com/v1/me",
      {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      }
    );

    const spotifyUser = profileResponse.data;

    // Encrypt and save the Spotify tokens in PostgreSQL.
    const user = await saveSpotifyUser({
      spotifyUserId: spotifyUser.id,
      displayName: spotifyUser.display_name || null,
      email: spotifyUser.email || null,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Create a session token for Racket.
    const sessionToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );

    // Keep the JWT out of the callback URL and JSON response.
    res.cookie("racket_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Racket authentication successful",
      user: {
        id: user.id,
        displayName: user.display_name,
      },
      sessionCreated: true,
    });

  } catch (err) {
    console.error(
      "Spotify authentication failed:",
      err.response?.status || err.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to complete Spotify authentication",
    });
  }
});

router.get("/me", async (req, res) => {
  const token = req.cookies?.racket_session;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const pool = require("../config/database");

    const result = await pool.query(
      "SELECT id, display_name FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      authenticated: true,
      user: {
        id: result.rows[0].id,
        displayName: result.rows[0].display_name,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session invalid or expired",
    });
  }
});

module.exports = router;
