// authservice/middleware/validate.js

/**
 * Middleware to validate request payloads using a given schema (e.g., Yup schema).
 *
 * - Validates `req.body.payload`
 * - Strips unknown fields from the payload
 * - Aggregates all validation errors
 * 
 * @param {Object} schema - Validation schema object (e.g., Yup schema)
 * @returns {Function} Express middleware function
 */
export default function validate(schema) {
  return async (req, res, next) => {
    try {
      // Validate payload and assign the sanitized data back to req.body.payload
      req.body.payload = await schema.validate(req.body.payload, { 
        abortEarly: false, // Return all errors instead of stopping at first
        stripUnknown: true, // Remove keys not defined in the schema
      });
      next();
    } catch (err) {
      const errors = err.errors || [err.message];
      res.status(400).json({ message: "Validation failed", errors });
    }
  };
}
