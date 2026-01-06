import * as Yup from "yup";

// Yup Validation Schema
const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .max(100, "Email must be at most 100 characters")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password cannot exceed 32 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]+$/,
      "Password must contain uppercase, lowercase, number, and special character"
    )
    .required("Password is required"),
});

export default loginValidationSchema;
