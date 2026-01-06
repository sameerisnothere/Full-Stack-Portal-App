// updateservice/controllers/updateController.js
import pool from "../config/db.js";
import tableAccess from "../config/tableAccess.js";
import { updateSchemas } from "../validation/updateValidation.js";

/**
 * Handles updating a record in the database.
 * 
 * Steps:
 * 1. Validate the request payload.
 * 2. Check authentication and authorization.
 * 3. Validate the data against the appropriate schema.
 * 4. Run pre-update hooks from tableAccess to enforce permissions and data modifications.
 * 5. Execute the SQL UPDATE query.
 * 6. Return success or error responses.
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with success or error message.
 */
const updateData = async (req, res) => {
  try {
    const payload = req.body;
    console.log(req.body);

    // === Payload validation ===
    if (!payload)
      return res.status(400).json({ error: "Missing payload wrapper" });

    const { type, data } = payload;
    const id = req.params.id;
    const user = req.user;
    const token = req.headers.authorization;

    // === Authentication and basic checks ===
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!id) return res.status(400).json({ error: "Missing ID parameter" });
    if (!type || !tableAccess[type])
      return res.status(400).json({ error: "Invalid type" });

    // === Data validation ===
    const schema = updateSchemas[type];
    await schema.validate(data, { abortEarly: false });

    // === Permission checks via beforeUpdate hook ===
    const { allowed, modifiedData, error } =
      (await tableAccess[type].beforeUpdate(token, user, id, data)) || {};

    if (!allowed)
      return res.status(403).json({ error: error || "Access denied" });

    // === Prepare and execute SQL UPDATE ===
    const finalData = modifiedData;
    const fields = Object.keys(finalData);

    const placeholders = fields.map((f) => `${f} = ?`).join(", ");
    const values = [...fields.map((f) => finalData[f]), id];

    const q = `UPDATE ${type} SET ${placeholders} WHERE id = ?`;
    const [result] = await pool.query(q, values);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: `${type} not found` });

    // === Success response ===
    return res.json({ message: `${type} updated successfully` });
  } catch (err) {
    console.error("UPDATE ERROR:", err);

    // === Validation error handling ===
    if (err.name === "ValidationError")
      return res.status(400).json({
        error: "Validation failed",
        details: err.errors,
      });

    // === Server error handling ===
    return res.status(500).json({ error: "Server error" });
  }
};

export default { updateData };
