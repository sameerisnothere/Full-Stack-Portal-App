// authservice/routes/authRoutes.js
import express from "express";
import authController from "../controllers/authController.js";
import validate from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validation/authValidation.js";

const router = express.Router();

/**
 * @route POST /login
 * @desc Authenticate a user and return a JWT token
 * @access Public
 * @middleware validate(loginSchema) - validates email and password payload
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @route POST /logout
 * @desc Log out the current user by invalidating their token
 * @access Private (requires authentication)
 */
router.post("/logout", authController.logout);

/**
 * @route GET /me
 * @desc Get information about the authenticated user
 * @access Private (requires authentication)
 */
router.get("/me", authController.me);

/**
 * @route POST /register
 * @desc Register a new user (student, teacher, or admin)
 * @access Public
 * @middleware validate(registerSchema) - validates name, email, password, and type
 */
// router.post("/register", validate(registerSchema), authController.register);

export default router;
