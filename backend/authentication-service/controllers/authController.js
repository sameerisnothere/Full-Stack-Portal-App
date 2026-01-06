// authservice/controllers/authController.js
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

// In-memory store for throttling login attempts
const failedLogins = new Map(); // { email: { count, lastAttempt } }
const MAX_ATTEMPTS = 3;
const LOCK_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Generates a JWT token for the authenticated user.
 *
 * @param {Object} user - The user object containing id, name, email, type
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

/**
 * Handles user login.
 *
 * Checks for email and password, applies throttling for failed attempts,
 * validates credentials, issues a JWT token, and stores it in the database.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with message, token, and user data
 */
async function login(req, res) {
  const { email, password } = req.body.payload;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  const record = failedLogins.get(email) || { count: 0, lastAttempt: null };
  if (record.count >= MAX_ATTEMPTS && Date.now() - record.lastAttempt < LOCK_TIME) {
    return res
      .status(429)
      .json({ message: "Too many failed attempts. Try again in 5 minutes." });
  }

  const userTables = ["student", "teacher", "admin"];
  let user = null;
  let userType = null;

  try {
    for (const table of userTables) {
      const [rows] = await pool.execute(
        `SELECT * FROM ${table} WHERE email = ? LIMIT 1`,
        [email]
      );
      if (rows.length > 0) {
        user = rows[0];
        userType = table;
        break;
      }
    }

    if (!user) {
      record.count++;
      record.lastAttempt = Date.now();
      failedLogins.set(email, record);
      return res.status(407).json({ message: "Email not registered." });
    }

    if (user.status === "inactive") {
      return res.status(407).json({ message: "Inactive users cannot login." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      record.count++;
      record.lastAttempt = Date.now();
      failedLogins.set(email, record);
      return res.status(407).json({ message: "Invalid password." });
    }

    // Reset failed login counter
    failedLogins.delete(email);

    // Invalidate existing tokens for this user (single-session rule)
    await pool.execute(
      "DELETE FROM tokens WHERE user_id = ? AND user_type = ?",
      [user.id, userType]
    );

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: userType,
    };

    const token = generateToken(tokenPayload);
    const decoded = jwt.decode(token);
    const expiryTime = new Date(decoded.exp * 1000);

    await pool.execute(
      "INSERT INTO tokens (user_id, user_type, token, expires_at) VALUES (?, ?, ?, ?)",
      [user.id, userType, token, expiryTime]
    );

    return res.json({ message: "Logged in successfully", token, user: tokenPayload });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * Handles user logout.
 *
 * Deletes the token from the database to invalidate the session.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with message
 */
async function logout(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(400).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    await pool.execute("DELETE FROM tokens WHERE token = ?", [token]);
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * Returns information about the authenticated user.
 *
 * Validates the JWT token and returns the decoded user data.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user information
 */
async function me(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authenticated" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.execute("SELECT * FROM tokens WHERE token = ?", [token]);

    if (rows.length === 0)
      return res.status(401).json({ message: "Session expired or invalid" });

    res.json({ user: decoded });
  } catch (err) {
    console.error("me() error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * Registers a new user (student, teacher, or admin).
 *
 * Hashes the password and inserts the user into the appropriate table.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with message
 */
async function register(req, res) {
  const { type, name, email, password } = req.body;

  const saltRounds = 10;
  if (!["student", "teacher", "admin"].includes(type)) {
    return res.status(400).json({ error: "Invalid type." });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const emailCheckQuery =
      "SELECT email FROM student WHERE email = ? UNION " +
      "SELECT email FROM teacher WHERE email = ? UNION " +
      "SELECT email FROM admin WHERE email = ?";
    const [existing] = await pool.query(emailCheckQuery, [email, email, email]);

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const insertQuery = `INSERT INTO ${type} (name, email, password) VALUES (?, ?, ?)`;

    await pool.query(insertQuery, [name, email, hashedPassword]);
    return res.json({ message: `${type} registered successfully` });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export default { login, logout, me, register };
