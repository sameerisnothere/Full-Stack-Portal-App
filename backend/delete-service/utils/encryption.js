import crypto from "crypto";

export async function encryptData(data) {
  const json = JSON.stringify(data);

  const keyBytes = Uint8Array.from(
    Buffer.from(process.env.AES_KEY, "base64")
  );

  const key = await crypto.webcrypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  // Secure IV
  const iv = crypto.randomBytes(12);

  const encrypted = await crypto.webcrypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(json)
  );

  return {
    iv: Buffer.from(iv).toString("base64"),                // ✅ FIXED
    cipher: Buffer.from(encrypted).toString("base64"),     // ✅ SAFE
  };
}
