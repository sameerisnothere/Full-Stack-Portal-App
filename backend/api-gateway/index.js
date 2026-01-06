// api gateway/index.js
import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";
import rateLimit from "./middleware/rateLimiter.js";
import checkAuth from "./middleware/checkAuth.js";
// import { hybridDecrypt } from "./utils/hybridDecrypt.js";
import { pgpDecrypt } from "./utils/pgpDecrypt.js";

const app = express();
dotenv.config();

/**
 * Enable CORS for requests from the frontend.
 * Allows credentials and exposes Authorization header to client.
 */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["Authorization"],
    allowedHeaders: ["Authorization", "Content-Type", "x-user"],
  })
);

const port = process.env.PORT || 8080;

app.use(express.json());

// Global rate limiter applied to all routes
app.use(rateLimit.globalLimiter);

/**
 * Filters headers for proxying requests.
 * Removes sensitive or unnecessary headers but preserves Authorization and x-user.
 *
 * @param {Object} headers - Original request headers
 * @returns {Object} Filtered headers safe to forward
 */
const filterHeaders = (headers) => {
  const {
    host,
    connection,
    "content-length": contentLength,
    "accept-encoding": acceptEncoding,
    cookie, // remove cookie, since JWT is in Authorization header
    ...safeHeaders
  } = headers;

  // Preserve Authorization header if present
  if (headers.authorization) {
    safeHeaders.authorization = headers.authorization;
  }

  if (headers["x-user"]) {
    safeHeaders["x-user"] = headers["x-user"];
  }

  return safeHeaders;
};

/**
 * Proxy handler for /read routes.
 * Forwards requests to the READ microservice with optional throttling and authentication.
 */
app.use("/read", rateLimit.readLimiter, checkAuth, async (req, res) => {
  try {
    const path = req.path;
    const url = `${process.env.READ_URL}${path}`;

    const axiosConfig = {
      method: req.method,
      timeout: 5000,
      data: req.body,
      params: req.query,
      headers: filterHeaders(req.headers),
    };

    const response = await axios(url, axiosConfig);

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error proxying to READ service:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      res.status(502).json({ error: "No response from READ service" });
    } else {
      res.status(500).json({ error: "Failed to get data." });
    }
  }
});

/**
 * Proxy handler for /create routes.
 * Decrypts RSA payload if present and forwards request to CREATE microservice.
 */
app.use("/create", rateLimit.createLimiter, checkAuth, async (req, res) => {
  try {
    const path = req.path;
    const url = `${process.env.CREATE_URL}${path}`;

    let requestData = req.body;

    if (req.body && req.body?.encrypted) {
      // hybrid decrypt
      // requestData = hybridDecrypt(req.body.encrypted);

      // pgp decrypt
      requestData = await pgpDecrypt(req.body.encrypted);
    }
    const axiosConfig = {
      method: req.method,
      timeout: 5000,
      data: requestData,
      headers: filterHeaders(req.headers),
    };

    const response = await axios(url, axiosConfig);

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error proxying to CREATE service:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Failed to insert." });
    }
  }
});

/**
 * Proxy handler for /update routes.
 * Decrypts RSA payload if present and forwards request to UPDATE microservice.
 */
app.use("/update", rateLimit.updateLimiter, checkAuth, async (req, res) => {
  try {
    const path = req.path;
    const url = `${process.env.UPDATE_URL}${path}`;

    let requestData = req.body;

    if (req.body && req.body?.encrypted) {
      // hybrid decrypt
      // requestData = hybridDecrypt(req.body.encrypted);

      // pgp decrypt
      requestData = await pgpDecrypt(req.body.encrypted);
    }

    const axiosConfig = {
      method: req.method,
      timeout: 5000,
      params: req.query,
      data: requestData,
      headers: filterHeaders(req.headers),
    };
    const response = await axios(url, axiosConfig);

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error proxying to UPDATE service:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Failed to update." });
    }
  }
});

/**
 * Proxy handler for /delete routes.
 * Decrypts RSA payload if present and forwards request to DELETE microservice.
 */
app.use("/delete", rateLimit.deleteLimiter, checkAuth, async (req, res) => {
  try {
    const path = req.path;
    const url = `${process.env.DELETE_URL}${path}`;

    let requestData = req.body;

    if (req.body && req.body?.encrypted) {
      // hybrid decrypt
      // requestData = hybridDecrypt(req.body.encrypted);

      // pgp decrypt
      requestData = await pgpDecrypt(req.body.encrypted);
    }

    const axiosConfig = {
      method: req.method,
      timeout: 5000,
      data: requestData,
      headers: filterHeaders(req.headers),
    };
    const response = await axios(url, axiosConfig);

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error proxying to DELETE service:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Failed to delete." });
    }
  }
});

/**
 * Proxy handler for /auth routes.
 * Decrypts RSA payload if present and forwards request to AUTH microservice.
 */
app.use("/auth", rateLimit.authLimiter, async (req, res) => {
  try {
    const path = req.path;
    const url = `${process.env.AUTH_URL}${path}`;

    let requestData = req.body;

    if (req.body && req.body?.encrypted) {
      // hybrid decrypt
      // requestData = hybridDecrypt(req.body.encrypted);

      // pgp decrypt
      requestData = await pgpDecrypt(req.body.encrypted);
    }

    const axiosConfig = {
      method: req.method,
      timeout: 5000,
      params: req.query,
      data: requestData,
      headers: filterHeaders(req.headers),
      withCredentials: true,
    };

    const response = await axios(url, axiosConfig);

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error proxying to AUTH service:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Gateway error" });
    }
  }
});

/**
 * Start API Gateway server
 */
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
