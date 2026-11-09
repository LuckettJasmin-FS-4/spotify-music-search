
const crypto = require("node:crypto");

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const hexKey = process.env.TOKEN_ENCRYPTION_KEY;

  if (!hexKey || !/^[0-9a-fA-F]{64}$/.test(hexKey)) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be 64 hexadecimal characters");
  }

  return Buffer.from(hexKey, "hex");
}

function encryptToken(token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    getEncryptionKey(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

function decryptToken(storedToken) {
  const [ivHex, tagHex, encryptedHex] = storedToken.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

module.exports = {
  encryptToken,
  decryptToken,
};
