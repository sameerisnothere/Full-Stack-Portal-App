// readservice/config/readAccess

/**
 * TABLE_ACCESS
 *
 * Configuration for table-level access control, field filtering, and optional
 * pre/post-processing for CRUD operations.
 *
 * Each table configuration can include:
 * - allowedRoles: array of user roles permitted to access this table.
 * - fields: array of field names allowed for INSERT/UPDATE operations.
 * - selectFields: array of field names allowed for SELECT/READ operations.
 * - preProcess: optional async function to modify query filters before fetching.
 * - postProcess: optional async function to transform query results after fetching.
 *
 * Example usage:
 *   const tableConfig = TABLE_ACCESS['course'];
 *   if (!tableConfig.allowedRoles.includes(user.role)) { ... }
 */
export const TABLE_ACCESS = {
  student: {
    allowedRoles: ["admin", "teacher", "student"],
    fields: ["name", "email", "password", "phone", "gender", "cnic", "status", "isDeleted"],
    selectFields: ["id", "name", "email", "phone", "gender", "cnic", "status", "isDeleted"],
  },

  admin: {
    allowedRoles: ["admin"],
    fields: ["name", "email", "password", "phone", "gender", "cnic", "status", "isDeleted"],
    selectFields: ["id", "name", "email", "phone", "gender", "cnic", "status", "isDeleted"],
  },

  teacher: {
    allowedRoles: ["admin", "teacher"],
    fields: ["name", "email", "password", "phone", "gender", "cnic", "status", "isDeleted"],
    selectFields: ["id", "name", "email", "phone", "gender", "cnic", "status", "isDeleted"],
  },

  course: {
    allowedRoles: ["admin", "teacher", "student"],
    fields: ["name", "teacherId", "credit_hours", "isDeleted"],
    selectFields: ["id", "name", "teacherId", "credit_hours", "isDeleted"],

    /**
     * Optional post-processing function for course rows.
     * Enriches each course with the teacher's name.
     *
     * @param {Array} rows - Array of course rows fetched from DB
     * @param {Object} pool - MySQL connection pool for querying
     * @returns {Array} - Modified rows including teacherName
     */
    postProcess: async (rows, pool) => {
      const teacherMap = {};
      const teacherIds = [...new Set(rows.map((r) => r.teacherId))];
      if (teacherIds.length > 0) {
        const placeholders = teacherIds.map(() => "?").join(", ");
        const [teachers] = await pool.query(
          `SELECT id, name FROM teacher WHERE id IN (${placeholders})`,
          teacherIds
        );
        teachers.forEach((t) => (teacherMap[t.id] = t.name));
      }

      return rows.map((r) => ({
        ...r,
        teacherName: teacherMap[r.teacherId] || null,
      }));
    },
  },

  enrollment: {
    allowedRoles: ["admin", "student", "teacher"],
    fields: ["studentId", "courseId"],
    selectFields: ["id", "studentId", "courseId"],

    /**
     * Optional pre-processing function for enrollment filters.
     * Ensures that students can only view their own enrollments.
     *
     * @param {Object} req - Express request object
     * @param {Object} filters - Query filters to modify before fetching
     * @returns {Object} - Updated filters
     */
    preProcess: async (req, filters) => {
      if (req.user.type === "student") {
        filters.studentId = req.user.id;
      }
      return filters;
    },
  },
};
