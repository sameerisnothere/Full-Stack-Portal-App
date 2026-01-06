// deleteservice/controllers/deleteController.js
import pool from "../config/db.js";
import tableAccess from "../config/tableAccess.js";
import { deleteValidationSchema } from "../validation/deleteValidation.js";

const deleteData = async (req, res) => {
  try {
    const { type, ids } = req.body;
    const id = req.params.id;
    const user = req.user;
    const token = req.headers.authorization;

    // Combine body + params for unified validation
    const dataToValidate = { type, ids, id };
    await deleteValidationSchema.validate(dataToValidate, { abortEarly: false });

    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!tableAccess[type]) return res.status(400).json({ error: "Invalid type" });

    // Create numeric list of IDs
    const idList = id ? [Number(id)] : (ids || []).map(Number);
    if (!idList.length || idList.some(isNaN))
      return res.status(400).json({ error: "Invalid or missing IDs" });

    // === Role-based / relationship validation ===
    const { allowed, error } = (await tableAccess[type].beforeDelete?.(token, user, idList)) || {};
    if (!allowed) return res.status(403).json({ error: error || "Not allowed to delete" });

    // === Determine SQL query for deletion ===
    let query;
    if (type === "enrollment") {
      // Hard delete
      query = `DELETE FROM ${type} WHERE id IN (${idList.map(() => "?").join(",")})`;
    } else {
      // Soft delete
      if (type === "course") {
        query = `UPDATE ${type} SET isDeleted = 1 WHERE id IN (${idList.map(() => "?").join(",")})`;
      } else {
        query = `UPDATE ${type} SET isDeleted = 1, status = 'inactive' WHERE id IN (${idList.map(() => "?").join(",")})`;
      }
    }

    // Execute query
    const [result] = await pool.query(query, idList);

    // Call afterDelete hook if exists
    if (tableAccess[type].afterDelete) await tableAccess[type].afterDelete(user, idList);

    return res.status(200).json({ message: `${type}(s) deleted successfully` });

  } catch (error) {
    console.error("Delete error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }

    return res.status(500).json({ error: error.message || "Server error" });
  }
};

export default { deleteData };
