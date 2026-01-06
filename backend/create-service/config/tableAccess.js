// createservice/config/TABLE_ACCESS.js
import axios from "axios";
// import { decryptData } from "../utils/decrypt.js";

const READ_SERVICE_URL = process.env.READ_SERVICE_URL;

/**
 * Checks global uniqueness for email, CNIC, and phone across all user tables.
 * Throws an error if any conflict is found.
 *
 * @param {Object} req - Express request object, must include req.user and req.headers.authorization
 * @param {Object} data - Object containing email, CNIC, or phone to validate
 * @throws {Error} If a conflict is found or user is unauthorized
 */
async function checkGlobalUniqueness(req, data) {
  const user = req.user;
  const token = req.headers.authorization;
  if (!user) throw new Error("Unauthorized");

  const tables = ["student", "teacher", "admin"];

  for (const table of tables) {
    try {
      const response = await axios.get(`${READ_SERVICE_URL}`, {
        params: { tableName: table },
        headers: {
          "x-user": JSON.stringify(user),
          Authorization: token,
        },
      });

      // const decrypted = await decryptData(response.data.iv, response.data.cipher);
      const rows = response.data?.data || [];

      // 🔍 Check uniqueness AND ignore soft-deleted rows
      const exists = rows.find(
        (obj) =>
          obj.isDeleted === 0 &&
          ((obj.email && obj.email === data.email) ||
            (obj.cnic && obj.cnic === data.cnic) ||
            (obj.phone && obj.phone === data.phone))
      );

      if (exists) {
        throw new Error(
          `Conflict: email, CNIC, or phone already exists in ${table} table`
        );
      }
    } catch (err) {
      console.error(`[Uniqueness Check] ${table}:`, err.message);
      throw new Error("A user with this email, CNIC, or phone already exists");
    }
  }
}

/**
 * TABLE_ACCESS defines allowed roles, fields, and preprocessing for each table.
 * Preprocess functions handle validation such as uniqueness, enrollment logic, or auto-assignment.
 */
export const TABLE_ACCESS = {
  student: {
    allowedRoles: ["admin"],
    fields: ["name", "email", "password", "phone", "gender", "cnic", "status"],
    /**
     * Preprocess before inserting/updating student
     */
    preProcess: async (req, data) => {
      await checkGlobalUniqueness(req, data);
      return data;
    },
  },

  teacher: {
    allowedRoles: ["admin"],
    fields: ["name", "email", "password", "phone", "gender", "cnic", "status"],
    preProcess: async (req, data) => {
      await checkGlobalUniqueness(req, data);
      return data;
    },
  },

  admin: {
    allowedRoles: ["admin"],
    fields: ["name", "email", "password", "phone", "gender", "cnic", "status"],
    preProcess: async (req, data) => {
      await checkGlobalUniqueness(req, data);
      return data;
    },
  },

  course: {
    allowedRoles: ["admin"],
    fields: ["name", "teacherId", "credit_hours", "isDeleted"],
    /**
     * Preprocess before inserting/updating course
     * Checks for duplicate course names
     */
    preProcess: async (req, data) => {
      const user = req.user;
      const token = req.headers.authorization;
      if (!user) throw new Error("Unauthorized");

      try {
        const response = await axios.get(`${READ_SERVICE_URL}`, {
          params: { tableName: "course" },
          headers: {
            "x-user": JSON.stringify(user),
            Authorization: token,
          },
        });

        // const decryptedResponse = await decryptData(response.data.iv, response.data.cipher);
        const existing = response.data?.data || [];
        const conflict = existing.find((s) => s.name === data.name && !s.isDeleted);

        if (conflict) {
          throw new Error(`A course with this name already exists`);
        }
      } catch (err) {
        console.error("Course uniqueness validation error:", err.message);
        throw new Error("A course with this name already exists");
      }

      return data;
    },
  },

  enrollment: {
    allowedRoles: ["student", "admin"],
    fields: ["studentId", "courseId"],
    /**
     * Preprocess before inserting/updating enrollment
     * - Auto-assign studentId if logged-in user is a student
     * - Validate course existence
     * - Prevent duplicate enrollments
     */
    preProcess: async (req, data) => {
      const user = req.user;
      const token = req.headers.authorization;
      if (!user) throw new Error("Unauthorized");

      if (user.type === "student") {
        data.studentId = user.id;
      }

      if (!data.courseId) throw new Error("Missing courseId");

      const courseIds = Array.isArray(data.courseId) ? data.courseId : [data.courseId];
      const insertedRows = [];

      for (const courseId of courseIds) {
        try {
          const response = await axios.get(`${READ_SERVICE_URL}`, {
            params: { tableName: "course", id: courseId },
            headers: { "x-user": JSON.stringify(user), Authorization: token },
          });

          // const decryptedResponse = await decryptData(response.data.iv, response.data.cipher);
          const courses = response.data?.data || [];
          if (!courses.length) {
            throw new Error(`Invalid courseId ${courseId} — course does not exist`);
          }

          const existingEnrollments = await axios.get(`${READ_SERVICE_URL}`, {
            params: { tableName: "enrollment" },
            headers: { "x-user": JSON.stringify(user), Authorization: token },
          });

          // const decryptedEnrollments = await decryptData(existingEnrollments.data.iv, existingEnrollments.data.cipher);
          const alreadyEnrolled = existingEnrollments.data?.data?.some(
            (e) => e.studentId === data.studentId && e.courseId === courseId
          );

          if (alreadyEnrolled) {
            console.warn(`Skipping duplicate enrollment: courseId ${courseId}`);
            continue;
          }

          insertedRows.push({ studentId: data.studentId, courseId });
        } catch (err) {
          console.error("Enrollment preProcess error:", err.message);
          throw new Error(err.message || "Failed to validate courses");
        }
      }

      if (insertedRows.length > 1) return insertedRows; // Controller will loop through
      return insertedRows[0] || data;
    },
  },
};
