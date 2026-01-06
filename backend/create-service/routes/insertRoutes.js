// createservice/routes/insertRoutes.js
import express from "express";
import insertController from "../controllers/insertController.js";
import validate from "../middleware/validate.js";
import {
  studentSchema,
  teacherSchema,
  adminSchema,
  courseSchema,
  enrollmentSchema,
} from "../validation/insertValidation.js";

const router = express.Router();

/**
 * Selects the appropriate validation schema based on the `table` field in request payload.
 *
 * @param {Object} req - Express request object
 * @returns {Object|null} - Returns the corresponding schema or null if invalid table
 */
const schemaSelector = (req) => {
  switch (req.body.payload.table) {
    case "student":
      return studentSchema;
    case "teacher":
      return teacherSchema;
    case "admin":
      return adminSchema;
    case "course":
      return courseSchema;
    case "enrollment":
      return enrollmentSchema;
    default:
      return null;
  }
};

/**
 * POST /insert
 * Generic route to insert or enroll records into a table.
 * 
 * Steps:
 * 1. Dynamically select validation schema based on table
 * 2. Validate request payload
 * 3. Call insertController.insertOrEnroll to process the insertion
 *
 * @route POST /insert
 * @body { table: string, data: Object } - table: target table, data: object(s) to insert
 */
router.post(
  "/insert",
  async (req, res, next) => {
    const schema = schemaSelector(req);
    if (!schema) {
      return res.status(400).json({ error: "Invalid table name" });
    }
    return validate(schema)(req, res, next);
  },
  insertController.insertOrEnroll
);

export default router;
