// createservice/middleware/validate.js
/**
 * Middleware to validate and sanitize request payloads using a provided schema.
 * 
 * - Validates `req.body.payload` (or the raw body)
 * - Strips unknown fields not defined in the schema
 * - Aggregates all validation errors and responds with 400 if validation fails
 * - Overwrites `req.body` with the validated payload
 *
 * @param {Object} schema - Validation schema object (e.g., Yup schema)
 * @returns {Function} Express middleware function
 */
export default function validate(schema) {
  return async (req, res, next) => {
    try {
      const validated = await schema.validate(req.body.payload, {
        abortEarly: false, // Return all errors instead of stopping at the first
        stripUnknown: true, // Remove fields not defined in schema
      });

      // Overwrite req.body with the validated payload for downstream handlers
      req.body = validated;

      next();
    } catch (err) {
      res.status(400).json({
        message: "Validation failed",
        errors: err.errors || [err.message],
      });
    }
  };
}
