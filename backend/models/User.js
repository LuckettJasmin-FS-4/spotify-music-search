
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

module.exports = {
  saveSpotifyUser,
};
