import crypto from "crypto";
import fs from "fs";

const privateKey = fs.readFileSync("./utils/server_private.pem", "utf8");

export function hybridDecrypt(payload) {
  const { encryptedKey, iv, data, authTag } = payload;

  //  Decrypt AES key
  const aesKey = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encryptedKey, "base64")
  );

  //  Decrypt data
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    aesKey,
    Buffer.from(iv, "base64")
  );

  //  SET AUTH TAG (THIS WAS MISSING)
  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data, "base64")),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString());
}
