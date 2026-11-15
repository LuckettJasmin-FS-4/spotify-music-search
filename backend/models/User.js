
const pool = require("../config/database");
const { encryptToken } = require("../utils/tokenCrypto");

async function saveSpotifyUser({
  spotifyUserId,
  displayName,
  email,
  accessToken,
  refreshToken,
  expiresIn,
}) {
  const encryptedAccessToken = encryptToken(accessToken);
  const encryptedRefreshToken = refreshToken
    ? encryptToken(refreshToken)
    : null;

  const tokenExpiresAt = new Date(
    Date.now() + expiresIn * 1000
  );

  const query = `
    INSERT INTO users (
      spotify_user_id,
      display_name,
      email,
      encrypted_access_token,
      encrypted_refresh_token,
      token_expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (spotify_user_id)
    DO UPDATE SET
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email,
      encrypted_access_token = EXCLUDED.encrypted_access_token,
      encrypted_refresh_token = COALESCE(
        EXCLUDED.encrypted_refresh_token,
        users.encrypted_refresh_token
      ),
      token_expires_at = EXCLUDED.token_expires_at,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id, spotify_user_id, display_name, email
  `;

  const values = [
    spotifyUserId,
    displayName,
    email,
    encryptedAccessToken,
    encryptedRefreshToken,
    tokenExpiresAt,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
}
async function getSpotifyCredentials(userId) {
  const query = `
    SELECT
      id,
      encrypted_access_token,
      encrypted_refresh_token,
      token_expires_at
    FROM users
    WHERE id = $1
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0] || null;
}
async function updateSpotifyTokens(
  userId,
  accessToken,
  refreshToken,
  expiresIn
) {
  const encryptedAccessToken = encryptToken(accessToken);

  const encryptedRefreshToken = refreshToken
    ? encryptToken(refreshToken)
    : null;

  const tokenExpiresAt = new Date(
    Date.now() + expiresIn * 1000
  );

  const query = `
    UPDATE users
    SET
      encrypted_access_token = $1,
      encrypted_refresh_token = COALESCE(
        $2,
        encrypted_refresh_token
      ),
      token_expires_at = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING id
  `;

  const result = await pool.query(query, [
    encryptedAccessToken,
    encryptedRefreshToken,
    tokenExpiresAt,
    userId,
  ]);

  return result.rows[0] || null;
}
module.exports = {
  saveSpotifyUser,
  getSpotifyCredentials,
  updateSpotifyTokens,
};