const axios = require("axios");

const {
  getSpotifyCredentials,
  updateSpotifyTokens,
} = require("../models/User");

const { decryptToken } = require("./tokenCrypto");

const SPOTIFY_TOKEN_URL =
  "https://accounts.spotify.com/api/token";

// Refresh a token 60 seconds before expiration.
const EXPIRATION_BUFFER = 60 * 1000;

async function getValidSpotifyToken(userId) {
  const credentials = await getSpotifyCredentials(userId);

  if (!credentials) {
    throw new Error("Spotify credentials not found");
  }

  const expiresAt = new Date(
    credentials.token_expires_at
  ).getTime();

 // Reuse the existing token unless a refresh is requested.

 if (
  credentials.encrypted_access_token &&
  Number.isFinite(expiresAt) &&
  Date.now() + EXPIRATION_BUFFER < expiresAt
) {
    return decryptToken(
      credentials.encrypted_access_token
    );
  }

  if (!credentials.encrypted_refresh_token) {
    throw new Error("Spotify authorization required");
  }

  // Request a replacement access token from Spotify.
  const refreshToken = decryptToken(
    credentials.encrypted_refresh_token
  );

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials are not configured");
  }

  const basicAuth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await axios.post(
    SPOTIFY_TOKEN_URL,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 10000,
    }
  );

  const {
    access_token: accessToken,
    refresh_token: newRefreshToken,
    expires_in: expiresIn,
  } = response.data;

  if (!accessToken || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new Error("Spotify returned an invalid token response");
  }

  // Store refreshed credentials securely in PostgreSQL.
  const updatedUser = await updateSpotifyTokens(
    userId,
    accessToken,
    newRefreshToken,
    expiresIn
  );

  if (!updatedUser) {
    throw new Error("Unable to save refreshed Spotify credentials");
  }

  return accessToken;
}

module.exports = {
  getValidSpotifyToken,
};


