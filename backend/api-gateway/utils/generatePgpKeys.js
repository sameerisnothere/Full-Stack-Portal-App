import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import * as openpgp from "openpgp";
import fs from "fs";

// Resolve project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"), 
});

if (!process.env.PGP_PASSPHRASE) {
  throw new Error("PGP_PASSPHRASE is not set");
}

async function generate() {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: "rsa",
    rsaBits: 4096,
    userIDs: [{ name: "API Server", email: "api@server.local" }],
    passphrase: process.env.PGP_PASSPHRASE,
  });

  fs.writeFileSync("./server_public.asc", publicKey);
  fs.writeFileSync("./server_private.asc", privateKey);

  console.log("PGP key pair generated");
}

generate();
