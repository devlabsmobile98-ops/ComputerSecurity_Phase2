const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const secret = process.env.PRIVATE_KEY_ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error("PRIVATE_KEY_ENCRYPTION_SECRET is missing in .env");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function encrypt(text) {
  if (!text) return null;

  const iv = crypto.randomBytes(16);
  const key = getKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

function decrypt(payload) {
  if (!payload) return null;

  const [ivHex, tagHex, encrypted] = payload.split(":");

  if (!ivHex || !tagHex || !encrypted) {
    throw new Error("Invalid encrypted payload");
  }

  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};