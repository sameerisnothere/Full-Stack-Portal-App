// deleteservice/config/deleteAccess.js
import axios from "axios";

const READ_SERVICE_URL = process.env.READ_SERVICE_URL;

/**
 * Access control rules and pre-deletion checks for different tables.
 * Each table exposes a `beforeDelete` async function that determines
 * if a user can delete the specified records.
 */
export default {
  /**
   * Teacher deletion rules:
   * - Only admins can delete teachers.
   * - Cannot delete a teacher who has active (non-deleted) courses.
   */
  teacher: {
    beforeDelete: async (token, user, ids) => {
      if (user.type !== "admin")
        return { allowed: false, error: "Only admin can delete teachers" };

      const readRes = await axios.get(READ_SERVICE_URL, {
        params: { tableName: "course", teacherId: ids.join(",") },
        headers: { "x-user": JSON.stringify(user), Authorization: token },
      });

      const courses = readRes.data?.data || [];
      if (courses.some((c) => !c.isDeleted)) {
        return { allowed: false, error: "Cannot delete teacher with active courses" };
      }

      return { allowed: true };
    },
  },

  /**
   * Student deletion rules:
   * - Only admins can delete students.
   * - Cannot delete a student who has active enrollments.
   */
  student: {
    beforeDelete: async (token, user, ids) => {
      if (user.type !== "admin")
        return { allowed: false, error: "Only admin can delete students" };

      const readRes = await axios.get(READ_SERVICE_URL, {
        params: { tableName: "enrollment", studentId: ids.join(",") },
        headers: { "x-user": JSON.stringify(user), Authorization: token },
      });

      const enrollments = readRes.data?.data || [];
      if (enrollments.length) {
        return { allowed: false, error: "Cannot delete student with active enrollments" };
      }

      return { allowed: true };
    },
  },

  /**
   * Course deletion rules:
   * - Only admins or teachers can delete courses.
   * - Cannot delete a course with enrolled students.
   */
  course: {
    beforeDelete: async (token, user, ids) => {
      if (user.type !== "admin" && user.type !== "teacher")
        return { allowed: false, error: "Only admins or teachers can delete courses" };

      const readRes = await axios.get(READ_SERVICE_URL, {
        params: { tableName: "enrollment", courseId: ids.join(",") },
        headers: { "x-user": JSON.stringify(user), Authorization: token },
      });

      const enrollments = readRes.data?.data || [];
      if (enrollments.length) {
        return { allowed: false, error: "Cannot delete course with enrolled students" };
      }

      return { allowed: true };
    },
  },

  /**
   * Enrollment deletion rules:
   * - Students can delete only their own enrollments.
   * - Teachers can delete enrollments only for their own courses.
   */
  enrollment: {
    beforeDelete: async (token, user, ids) => {
      // === STUDENT check ===
      if (user.type === "student") {
        const readRes = await axios.get(READ_SERVICE_URL, {
          params: { tableName: "enrollment", id: ids.join(",") },
          headers: { "x-user": JSON.stringify(user), Authorization: token },
        });

        const rows = readRes.data?.data || [];
        const owned = rows.filter((r) => r.studentId === user.id);

        if (owned.length !== ids.length) {
          return { allowed: false, error: "Students can only delete their own enrollments" };
        }
      }

      // === TEACHER check ===
      if (user.type === "teacher") {
        const readEnrollments = await axios.get(READ_SERVICE_URL, {
          params: { tableName: "enrollment", id: ids.join(",") },
          headers: { "x-user": JSON.stringify(user), Authorization: token },
        });

        const enrollments = readEnrollments.data?.data || [];
        if (!enrollments.length) return { allowed: false, error: "No enrollments found" };

        const courseIds = [...new Set(enrollments.map((e) => e.courseId))];
        const readCourses = await axios.get(READ_SERVICE_URL, {
          params: { tableName: "course", id: courseIds.join(",") },
          headers: { "x-user": JSON.stringify(user), Authorization: token },
        });

        const courses = readCourses.data?.data || [];
        const ownedCourseIds = courses.filter((c) => c.teacherId === user.id).map((c) => c.id);
        const unauthorized = enrollments.filter((e) => !ownedCourseIds.includes(e.courseId));

        if (unauthorized.length) {
          return { allowed: false, error: "Teachers can only delete enrollments in their own courses" };
        }
      }

      return { allowed: true };
    },
  },

  /**
   * Admin deletion rules:
   * - Only admins can delete other admin accounts.
   */
  admin: {
    beforeDelete: async (token, user, ids) => {
      if (user.type !== "admin") return { allowed: false, error: "Only admins can delete admins" };
      return { allowed: true };
    },
  },
};
