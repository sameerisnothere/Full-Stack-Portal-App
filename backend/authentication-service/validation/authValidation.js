// authservice/validation/authValidation.js
import * as yup from "yup";

/**
 * Validation schema for user login requests.
 * Ensures email is valid and password meets minimum length.
 */
export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

/**
 * Validation schema for user registration requests.
 * Ensures:
 * - type is one of ["student", "teacher", "admin"]
 * - name is trimmed and between 2-50 characters
 * - email is valid
 * - password has minimum length of 6
 */
export const registerSchema = yup.object({
  type: yup
    .string()
    .oneOf(["student", "teacher", "admin"], "Invalid user type")
    .required("User type is required"),
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long")
    .required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});
