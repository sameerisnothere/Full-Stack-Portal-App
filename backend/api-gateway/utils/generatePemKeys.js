// generateKeys.js
import crypto from "crypto";
import fs from "fs";

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

fs.writeFileSync("./server_public.pem", publicKey);
fs.writeFileSync("./server_private.pem", privateKey);

console.log("RSA key pair generated.");
