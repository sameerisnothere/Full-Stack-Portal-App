// server/routes/clientKeys.js
import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const STORE_DIR = path.resolve("./client_keys");
if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });

// expects { userId, publicKeyPem } and Authorization header
router.post("/register", (req, res) => {
  try {
    const { userId, publicKeyPem } = req.body;
    if (!userId || !publicKeyPem) return res.status(400).json({ error: "userId + publicKeyPem required" });

    const filename = path.join(STORE_DIR, `${userId}.pem`);
    fs.writeFileSync(filename, publicKeyPem, "utf8");

    return res.json({ ok: true });
  } catch (err) {
    console.error("Failed to register client key", err);
    return res.status(500).json({ error: "failed to register key" });
  }
});

export default router;
