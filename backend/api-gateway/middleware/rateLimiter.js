// api-gateway/rateLimiter.js
import rateLimit from "express-rate-limit";

/**
 * Global rate limiter applied to all requests.
 * Limits total requests per minute across the entire API Gateway.
 */
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests globally, please slow down." },
});

/**
 * Rate limiter for read-heavy routes.
 * Allows more requests per minute due to read operations being less costly.
 */
const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests, slow down." },
});

/**
 * Rate limiter for create routes.
 * Prevents spamming or abuse of resource creation.
 */
const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: "Too many requests, wait a bit." },
});

/**
 * Rate limiter for update routes.
 * Moderate limit to avoid excessive updates.
 */
const updateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests, wait a bit." },
});

/**
 * Rate limiter for delete routes.
 * Strict limit as these operations are destructive.
 */
const deleteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests, wait a bit." },
});

/**
 * Rate limiter for auth routes (login, register, etc.)
 * Prevents brute-force login attempts and abuse of auth endpoints.
 */
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests. Try again later." },
});

export default {
  globalLimiter,
  readLimiter,
  createLimiter,
  updateLimiter,
  deleteLimiter,
  authLimiter,
};
