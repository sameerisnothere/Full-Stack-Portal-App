// updateservice/config/tableAccess.js
import bcryptjs from "bcryptjs";
import { fetchRecord } from "../utils/readService.js";

export default {
  // === STUDENT ===
  student: {
    /**
     * Hook executed before updating a student record.
     * Handles permission checks and password updates.
     *
     * @param {string} token - Authorization token of the user making the request.
     * @param {Object} user - The currently authenticated user.
     * @param {number|string} id - ID of the student to update.
     * @param {Object} data - Data to update, may include newPassword and currentPassword.
     * @returns {Promise<Object>} Object containing `allowed` (boolean) and `modifiedData` or `error`.
     */
    beforeUpdate: async (token, user, id, data) => {
      const isAdmin = user.type === "admin";
      const isSelf = user.type === "student" && user.id === parseInt(id);

      if (!token) return { allowed: false, error: "Missing authorization token" };
      if (!isAdmin && !isSelf) return { allowed: false, error: "Forbidden" };

      // === Password change handling ===
      if (data.newPassword) {
        let currentHash = null;

        // Admin can update without current password
        if (isAdmin) {
          const rows = await fetchRecord("student", id, false, user, token);
          if (!rows || rows.length === 0)
            return { allowed: false, error: "Student not found" };
        }

        // Self-update requires current password verification
        if (!isAdmin && isSelf) {
          if (!data.currentPassword)
            return { allowed: false, error: "Current password required" };

          const rows = await fetchRecord("student", id, true, user, token);
          if (!rows || rows.length === 0)
            return { allowed: false, error: "Student not found" };

          currentHash = rows[0].password;
          const match = await bcryptjs.compare(data.currentPassword, currentHash);
          if (!match)
            return { allowed: false, error: "Current password is incorrect" };
        }

        // Hash new password and replace in data
        data.password = await bcryptjs.hash(data.newPassword, 10);
        delete data.currentPassword;
        delete data.newPassword;
      }

      return { allowed: true, modifiedData: data };
    },
  },

  // === TEACHER ===
  teacher: {
    /**
     * Hook executed before updating a teacher record.
     * Handles permission checks and password updates.
     *
     * @param {string} token - Authorization token of the user making the request.
     * @param {Object} user - The currently authenticated user.
     * @param {number|string} id - ID of the teacher to update.
     * @param {Object} data - Data to update, may include newPassword and currentPassword.
     * @returns {Promise<Object>} Object containing `allowed` (boolean) and `modifiedData` or `error`.
     */
    beforeUpdate: async (token, user, id, data) => {
      const isAdmin = user.type === "admin";
      const isSelf = user.type === "teacher" && user.id === parseInt(id);

      if (!token) return { allowed: false, error: "Missing authorization token" };
      if (!isAdmin && !isSelf) return { allowed: false, error: "Forbidden" };

      if (data.newPassword) {
        let currentHash = null;

        if (isAdmin) {
          const rows = await fetchRecord("teacher", id, false, user, token);
          if (!rows || rows.length === 0)
            return { allowed: false, error: "Teacher not found" };
        }

        if (!isAdmin && isSelf) {
          if (!data.currentPassword)
            return { allowed: false, error: "Current password required" };

          const rows = await fetchRecord("teacher", id, true, user, token);
          if (!rows || rows.length === 0)
            return { allowed: false, error: "Teacher not found" };

          currentHash = rows[0].password;
          const match = await bcryptjs.compare(data.currentPassword, currentHash);
          if (!match)
            return { allowed: false, error: "Current password is incorrect" };
        }

        data.password = await bcryptjs.hash(data.newPassword, 10);
        delete data.currentPassword;
        delete data.newPassword;
      }

      return { allowed: true, modifiedData: data };
    },
  },

  // === ADMIN ===
  admin: {
    /**
     * Hook executed before updating an admin record.
     * Admins can only update their own account and must verify current password for changes.
     *
     * @param {string} token - Authorization token of the user making the request.
     * @param {Object} user - The currently authenticated user.
     * @param {number|string} id - ID of the admin to update.
     * @param {Object} data - Data to update, may include newPassword and currentPassword.
     * @returns {Promise<Object>} Object containing `allowed` (boolean) and `modifiedData` or `error`.
     */
    beforeUpdate: async (token, user, id, data) => {
      const isSelf = user.id === parseInt(id);
      if (!isSelf)
        return { allowed: false, error: "Admins can only update their own account" };

      if (data.newPassword) {
        if (!data.currentPassword)
          return { allowed: false, error: "Current password required" };

        const rows = await fetchRecord("admin", id, true, user, token);
        if (!rows || rows.length === 0)
          return { allowed: false, error: "Admin not found" };

        const match = await bcryptjs.compare(data.currentPassword, rows[0].password);
        if (!match)
          return { allowed: false, error: "Current password incorrect" };

        data.password = await bcryptjs.hash(data.newPassword, 10);
        delete data.currentPassword;
        delete data.newPassword;
      }

      return { allowed: true, modifiedData: data };
    },
  },

  // === COURSE ===
  course: {
    /**
     * Hook executed before updating a course record.
     * Only admins can update courses, and only specific fields are allowed.
     *
     * @param {string} token - Authorization token of the user making the request.
     * @param {Object} user - The currently authenticated user.
     * @param {number|string} id - ID of the course to update.
     * @param {Object} data - Data to update (name, teacherId, credit_hours).
     * @returns {Promise<Object>} Object containing `allowed` (boolean) and `modifiedData` or `error`.
     */
    beforeUpdate: async (token, user, id, data) => {
      if (user.type !== "admin")
        return { allowed: false, error: "Only admins can update courses" };

      const rows = await fetchRecord("course", id, false, user, token);
      if (!rows || rows.length === 0)
        return { allowed: false, error: "Course not found" };

      const allowed = ["name", "teacherId", "credit_hours"];
      const filtered = Object.fromEntries(
        Object.entries(data).filter(([k]) => allowed.includes(k))
      );

      if (Object.keys(filtered).length === 0)
        return { allowed: false, error: "No valid fields to update" };

      return { allowed: true, modifiedData: filtered };
    },
  },

  // === ENROLLMENT ===
  enrollment: {
    /**
     * Hook executed before updating an enrollment record.
     * Enrollment records are immutable and cannot be updated.
     *
     * @returns {Object} Object with `allowed` set to false and an `error` message.
     */
    beforeUpdate: async () => ({
      allowed: false,
      error: "Enrollments cannot be updated",
    }),
  },
};
