import crypto from "crypto";
import dotenv from "dotenv";
import { ENCRYPTION_IV, ENCRYPTION_KEY } from "../secrets";

dotenv.config();

// Ensure environment variables are set
const encryptionKey = ENCRYPTION_KEY;
const encryptionIV = ENCRYPTION_IV;

if (!encryptionKey || encryptionKey.length !== 32) {
  throw new Error(
    "ENCRYPTION_KEY must be defined in the environment variables and be 32 characters (256 bits) long!"
  );
}

if (!encryptionIV || encryptionIV.length !== 16) {
  throw new Error(
    "ENCRYPTION_IV must be defined in the environment variables and be 16 characters (128 bits) long!"
  );
}

// Convert to buffers
const key = Buffer.from(encryptionKey, "utf8");
const iv = Buffer.from(encryptionIV, "utf8");
const algorithm = "aes-256-cbc"; // AES-256-CBC encryption

/**
 * Encrypts plain text using AES-256-CBC.
 * @param text - The text to encrypt
 * @returns The encrypted text as a hex string
 */
export const encrypt = (text: string): string => {
  if (!text) throw new Error("Invalid input: text must be a non-empty string");

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

/**
 * Decrypts an AES-256-CBC encrypted hex string.
 * @param encryptedText - The encrypted text in hex format
 * @returns The decrypted plain text
 */
export const decrypt = (encryptedText: string): string => {
  if (!encryptedText)
    throw new Error("Invalid input: encryptedText must be non-empty");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
