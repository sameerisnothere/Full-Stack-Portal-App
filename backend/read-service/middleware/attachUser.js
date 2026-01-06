// readservice/middleware/attachUser.js

/**
 * Middleware to attach user information from the `x-user` header to the request object.
 * 
 * - Checks if the `x-user` header exists
 * - Parses it as JSON and attaches it to `req.user`
 * - Returns a 400 error if parsing fails
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export default function attachUser(req, res, next) {
  const userHeader = req.headers['x-user'];
  if (userHeader) {
    try {
      req.user = JSON.parse(userHeader);
    } catch (e) {
      return res.status(400).json({ error: "Invalid user header" });
    }
  }
  next();
}
