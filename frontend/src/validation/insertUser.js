import * as Yup from "yup";

const userInsertValidationSchema = Yup.object({
  name: Yup.string()
    .matches(/^[A-Za-z ]+$/, "Name can only contain letters and spaces")
    .max(50, "Name cannot exceed 50 characters")
    .required("Name is required"),

  email: Yup.string()
    .email("Invalid email format")
    .max(100, "Email cannot exceed 100 characters")
    .required("Email is required"),

  cnic: Yup.string()
    .matches(
      /^[0-9]{5}-[0-9]{7}-[0-9]$/,
      "Invalid CNIC format (e.g. 42101-1234567-9)"
    )
    .max(15, "CNIC cannot exceed 15 characters")
    .required("CNIC is required"),

  phone: Yup.string()
    .matches(/^03[0-9]{9}$/, "Invalid phone number (e.g. 03331234567)")
    .max(11, "Phone number cannot exceed 11 digits")
    .nullable(),

  status: Yup.string()
    .max(20, "Status cannot exceed 20 characters")
    .required("Status is required"),

  gender: Yup.string().max(10, "Gender cannot exceed 10 characters").nullable(),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password cannot exceed 32 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must include uppercase, lowercase, number, and special character"
    )
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords do not match")
    .required("Confirm your password"),
});

export default userInsertValidationSchema;
