// updateservice/validation/updateValidation
import * as Yup from "yup";

/**
 * Regex pattern for validating CNIC (e.g., 12345-1234567-1)
 * @type {RegExp}
 */
const cnicPattern = /^[0-9]{5}-[0-9]{7}-[0-9]$/;

/**
 * Regex pattern for validating Pakistani phone numbers (e.g., 03XXXXXXXXX)
 * @type {RegExp}
 */
const phonePattern = /^03[0-9]{9}$/;

/**
 * Validation schemas for updating different database entities.
 * Each schema uses Yup for type checking, formatting, and constraints.
 */
export const updateSchemas = {
  /**
   * Validation schema for updating a student record.
   * Fields are optional to allow partial updates.
   */
  student: Yup.object({
    name: Yup.string(),
    email: Yup.string().email(),
    cnic: Yup.string().matches(cnicPattern),
    phone: Yup.string().matches(phonePattern).nullable(),
    status: Yup.string(),
    gender: Yup.string().nullable(),
    newPassword: Yup.string().min(6).nullable(),
    currentPassword: Yup.string().nullable(),
  }),

  /**
   * Validation schema for updating a teacher record.
   * Fields are optional to allow partial updates.
   */
  teacher: Yup.object({
    name: Yup.string(),
    email: Yup.string().email(),
    cnic: Yup.string().matches(cnicPattern),
    phone: Yup.string().matches(phonePattern).nullable(),
    status: Yup.string(),
    gender: Yup.string().nullable(),
    newPassword: Yup.string().min(6).nullable(),
    currentPassword: Yup.string().nullable(),
  }),

  /**
   * Validation schema for updating an admin record.
   * Admin updates are limited and optional.
   */
  admin: Yup.object({
    name: Yup.string().nullable(),
    email: Yup.string().email().nullable(),
    newPassword: Yup.string().min(6).nullable(),
    currentPassword: Yup.string().nullable(),
  }),

  /**
   * Validation schema for updating a course record.
   * Ensures name length, credit hours, and teacher ID are valid.
   */
  course: Yup.object({
    name: Yup.string().min(3).max(50),
    credit_hours: Yup.number().oneOf([1, 2, 3]),
    teacherId: Yup.number().integer(),
  }),

  /**
   * Validation schema for enrollments.
   * Enrollments cannot be updated; no unknown fields allowed.
   */
  enrollment: Yup.object({}).noUnknown(true, "Enrollments cannot be updated"),
};
