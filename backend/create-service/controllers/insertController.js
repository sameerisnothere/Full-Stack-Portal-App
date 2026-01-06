// createservice/controllers/insertOrEnroll.js
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { TABLE_ACCESS } from "../config/tableAccess.js";

/**
 * Generic controller for inserting or enrolling records into a table.
 * 
 * Features:
 * - Validates table name and user permissions
 * - Runs table-specific `preProcess` for validation/uniqueness/enrollment logic
 * - Filters allowed fields according to table configuration
 * - Auto-hashes password fields
 * - Supports inserting single or multiple rows (preProcess can return an array)
 *
 * @param {Object} req - Express request object, expects:
 *   - req.user (from checkAuth middleware or x-user header)
 *   - req.body.table: string, target table name
 *   - req.body.data: object or array of objects with data to insert
 * @param {Object} res - Express response object
 * @returns JSON response with success message or error
 */
const insertOrEnroll = async (req, res) => {
  try {
    // Parse user from x-user header if not already set
    if (!req.user && req.headers["x-user"]) {
      req.user = JSON.parse(req.headers["x-user"]);
    }

    const { table, data } = req.body;

    if (!table || !data || typeof data !== "object") {
      return res.status(400).json({ error: "Missing table or data object" });
    }

    const tableConfig = TABLE_ACCESS[table];
    if (!tableConfig) {
      return res.status(400).json({ error: "Invalid table name" });
    }

    const userRole = req.user?.type;
    if (!tableConfig.allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Access denied for this operation" });
    }

    // Attach pool to request for preProcess functions
    req.pool = pool;
    let processedData = { ...data };
    if (tableConfig.preProcess) {
      processedData = await tableConfig.preProcess(req, processedData);
    }

    // Normalize processedData to array
    const records = Array.isArray(processedData) ? processedData : [processedData];
    const inserted = [];

    for (const record of records) {
      const allowedData = {};

      // Filter only allowed fields for this table
      for (const key of tableConfig.fields) {
        if (record[key] !== undefined) allowedData[key] = record[key];
      }

      if (Object.keys(allowedData).length === 0) continue;

      // Auto-hash password if present
      if (allowedData.password) {
        allowedData.password = await bcrypt.hash(allowedData.password, 10);
      }

      const columns = Object.keys(allowedData).join(", ");
      const placeholders = Object.keys(allowedData).map(() => "?").join(", ");
      const values = Object.values(allowedData);


      const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
      await pool.query(query, values);

      inserted.push(allowedData);
    }

    if (!inserted.length) {
      return res.status(400).json({ error: "No valid fields provided" });
    }

    return res.json({
      message:
        inserted.length > 1
          ? `${inserted.length} ${table} records inserted successfully`
          : `${table} record inserted successfully`,
    });
  } catch (error) {
    console.error("Generic Insert Error:", error);
    return res.status(400).json({ error: error.message || "Server error" });
  }
};

export default { insertOrEnroll };
