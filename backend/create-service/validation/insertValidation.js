// createservice/validation/insertValidation.js
import * as yup from "yup";

// === COMMON REGEX ===
const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/; // e.g. 42101-1234567-9
const phoneRegex = /^03[0-9]{9}$/; // e.g. 03331234567

/**
 * Helper for optional string fields
 */
const optionalString = yup.string().nullable().notRequired();

/**
 * Validates payload for inserting a student record
 */
export const studentSchema = yup.object({
  table: yup.string().oneOf(["student"]).required(),
  data: yup.object({
    name: yup.string().trim().required("Name is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    cnic: yup
      .string()
      .matches(cnicRegex, "Invalid CNIC format (e.g. 42101-1234567-9)")
      .required("CNIC is required"),
    phone: yup.string().nullable().notRequired().matches(phoneRegex, {
      message: "Invalid phone number (e.g. 03331234567)",
      excludeEmptyString: true,
    }),
    gender: optionalString,
    status: yup.string().required("Status is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  }),
});

/**
 * Validates payload for inserting a teacher record
 */
export const teacherSchema = yup.object({
  table: yup.string().oneOf(["teacher"]).required(),
  data: yup.object({
    name: yup.string().trim().required("Name is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    cnic: yup
      .string()
      .matches(cnicRegex, "Invalid CNIC format (e.g. 42101-1234567-9)")
      .required("CNIC is required"),
    phone: yup.string().nullable().notRequired().matches(phoneRegex, {
      message: "Invalid phone number (e.g. 03331234567)",
      excludeEmptyString: true,
    }),
    gender: optionalString,
    status: yup.string().required("Status is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  }),
});

/**
 * Validates payload for inserting an admin record
 */
export const adminSchema = yup.object({
  table: yup.string().oneOf(["admin"]).required(),
  data: yup.object({
    name: yup.string().trim().required("Name is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    cnic: yup
      .string()
      .matches(cnicRegex, "Invalid CNIC format (e.g. 42101-1234567-9)")
      .required("CNIC is required"),
    phone: yup.string().nullable().notRequired().matches(phoneRegex, {
      message: "Invalid phone number (e.g. 03331234567)",
      excludeEmptyString: true,
    }),
    gender: optionalString,
    status: yup.string().required("Status is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  }),
});

/**
 * Validates payload for inserting a course record
 */
export const courseSchema = yup.object({
  table: yup.string().oneOf(["course"]).required(),
  data: yup.object({
    name: yup.string().trim().min(3, "Course name must be at least 3 characters").max(50, "Course name too long").required("Course name is required"),
    teacherId: yup.number().integer("Teacher ID must be numeric").required("Teacher is required"),
    credit_hours: yup.number().oneOf([1, 2, 3], "Invalid credit hours").required("Credit hours are required"),
  }),
});

/**
 * Validates payload for enrolling a student in a course
 */
export const enrollmentSchema = yup.object({
  table: yup.string().oneOf(["enrollment"]).required(),
  data: yup.object({
    studentId: yup.number().integer().nullable(), // auto-filled if student
    courseId: yup.number().integer().required("Course ID is required"),
  }),
});
