// api-gateway/checkAuth.js
import axios from "axios";

/**
 * Middleware to verify user authentication for API Gateway routes.
 * 
 * - First checks if a session user exists (req.session.user)
 * - Fallback: verifies Bearer token via the AUTH service `/me` endpoint
 * - Attaches user info to `req.user` and `req.headers['x-user']` for downstream services
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export default async function checkAuth(req, res, next) {
  try {
    // 1. Check if user session exists
    if (req.session && req.session.user) {
      req.user = req.session.user;
      // Pass user info downstream via custom header
      req.headers['x-user'] = JSON.stringify(req.user);
      return next();
    }

    // 2. Fallback: check Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized: No token provided." });
    }
    const token = authHeader.split(' ')[1];

    // Verify token via AUTH service /me endpoint
    const response = await axios.get(`${process.env.AUTH_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    req.user = response.data.user;
    req.headers['x-user'] = JSON.stringify(req.user);
    next();
  } catch (error) {
    console.error("Auth check failed:", error.message);
    return res.status(401).json({ message: "Unauthorized: Please log in." });
  }
}
