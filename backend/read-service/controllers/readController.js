// readservice/controllers/readController
import pool from "../config/db.js";
import { TABLE_ACCESS } from "../config/readAccess.js";

/**
 * Generic read controller.
 * Handles dynamic table queries with role-based access control, field filtering,
 * pre/post-processing, and optional password inclusion.
 */
const readData = async (req, res) => {
  try {
    // === Attach user from x-user header if not already set ===
    if (!req.user && req.headers["x-user"]) {
      try {
        req.user = JSON.parse(req.headers["x-user"]);
      } catch {
        return res.status(400).json({ error: "Invalid x-user header format" });
      }
    }

    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // === Source data based on method ===
    const source = req.method === "GET" ? req.query : req.body;
    let { tableName, includePassword, ...filters } = source;

    // Normalize array inputs (common with query params)
    if (Array.isArray(tableName)) tableName = tableName[0];
    for (const key in filters) {
      if (Array.isArray(filters[key])) filters[key] = filters[key][0];
    }

    if (!tableName) return res.status(400).json({ error: "Missing tableName" });

    const table = tableName.trim().toLowerCase();
    const config = TABLE_ACCESS[table];
    if (!config) return res.status(400).json({ error: "Invalid table name" });

    // === Role-based access check ===
    if (!config.allowedRoles.includes(user.type)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // === Pre-processing filters ===
    let finalFilters = { ...filters };
    if (config.preProcess) {
      finalFilters = await config.preProcess(req, finalFilters);
    }

    // === Determine if password field is requested ===
    const wantPassword =
      includePassword &&
      (includePassword === true || includePassword[0] === "true");

    let selectFields = [...(config.selectFields || ["*"])];
    if (wantPassword) {
      const idFilter =
        finalFilters.id !== undefined ? Number(finalFilters.id) : Number(user.id);
      const isSelf = idFilter === Number(user.id);
      const isAdmin = user.type === "admin";

      if (isAdmin || isSelf) {
        if (!selectFields.includes("password")) selectFields.push("password");
      } else {
        return res
          .status(403)
          .json({ error: "You are not allowed to access the password field" });
      }
    }

    // === Build dynamic SQL query ===
    let query = `SELECT ${selectFields.join(", ")} FROM ${table}`;
    const values = [];

    const whereClauses = Object.entries(finalFilters)
      .filter(([_, val]) => val !== undefined && val !== null && val !== "")
      .map(([key, val]) => {
        values.push(val);
        return `${key} = ?`;
      });

    if (whereClauses.length > 0) query += ` WHERE ${whereClauses.join(" AND ")}`;
    if (config.defaultOrderBy) query += ` ORDER BY ${config.defaultOrderBy}`;

    console.log("FINAL QUERY:", query, "VALUES:", values);

    // === Execute query ===
    const [rows] = await pool.query(query, values);

    // === Post-processing (e.g., join teacher names for courses) ===
    let finalResult = config.postProcess ? await config.postProcess(rows, pool) : rows;

    // === Remove password field if not requested ===
    if (!wantPassword) {
      finalResult = finalResult.map(({ password, ...rest }) => rest);
    }
    console.log("data from read: ", finalResult);
    return res.status(200).json({ data: finalResult });
  } catch (error) {
    console.error("Generic Read Error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
};

export default { readData };
