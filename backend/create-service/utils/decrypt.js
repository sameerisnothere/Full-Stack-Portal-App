import crypto from "crypto";

export async function decryptData(ivBase64, cipherBase64) {
  const keyBytes = Buffer.from(process.env.AES_KEY, "base64");

  const key = await crypto.webcrypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const iv = Uint8Array.from(Buffer.from(ivBase64, "base64"));
  const cipherBytes = Uint8Array.from(Buffer.from(cipherBase64, "base64"));

  const decrypted = await crypto.webcrypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBytes
  );

  return JSON.parse(Buffer.from(decrypted).toString());
}
