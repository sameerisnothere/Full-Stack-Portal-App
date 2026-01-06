import * as Yup from "yup";

// === Yup Validation Schema ===
const userUpdateValidationSchema = Yup.object({
  name: Yup.string()
    .matches(/^[A-Za-z ]+$/, "Name can only contain letters and spaces")
    .max(50, "Name cannot exceed 50 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  cnic: Yup.string()
    .matches(
      /^[0-9]{5}-[0-9]{7}-[0-9]$/,
      "Invalid CNIC format (e.g. 42101-1234567-9)"
    )
    .required("CNIC is required"),
  phone: Yup.string()
    .matches(/^03[0-9]{9}$/, "Invalid phone number (e.g. 03331234567)")
    .nullable(),
  status: Yup.string().required("Status is required"),
  gender: Yup.string().nullable(),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password cannot exceed 32 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must include uppercase, lowercase, number, and special character"
    )
    .nullable(),
  confirmPassword: Yup.string().when("password", {
    is: (val) => val && val.length > 0,
    then: (schema) =>
      schema
        .oneOf([Yup.ref("password"), null], "Passwords do not match")
        .required("Confirm your password"),
  }),
});

export default userUpdateValidationSchema;