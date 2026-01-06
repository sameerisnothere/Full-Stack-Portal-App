// deleteservice/validation/deleteValidation
import * as Yup from "yup";

/**
 * Validation schema for deletion requests.
 *
 * Ensures the request contains a valid table type and numeric IDs.
 * Supports both:
 *   1. Bulk deletion via `ids` array in request body.
 *   2. Single deletion via `id` path parameter.
 *
 * Fields:
 * - type: string
 *   - Required.
 *   - Must be one of: "student", "teacher", "course", "enrollment".
 *
 * - ids: number[]
 *   - Optional array of positive integers.
 *   - Minimum of 1 ID if provided.
 *
 * - id: number
 *   - Optional single positive integer (used in path /delete/:id).
 *
 * Usage:
 * ```js
 * await deleteValidationSchema.validate({ type: 'student', ids: [1,2] });
 * await deleteValidationSchema.validate({ type: 'course', id: 5 });
 * ```
 */
export const deleteValidationSchema = Yup.object({
  type: Yup.string()
    .oneOf(["student", "teacher", "course", "enrollment"], "Invalid table type")
    .required("Type is required"),

  ids: Yup.array()
    .of(Yup.number().integer().positive("Invalid ID"))
    .min(1, "At least one ID is required")
    .optional(),

  // Optional: handle path-based delete (/delete/:id)
  id: Yup.number().integer().positive("Invalid ID").optional(),
});
