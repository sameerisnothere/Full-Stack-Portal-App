import * as yup from "yup";

// Validation Schema
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

const selfUpdateSchema = yup
  .object({
    name: yup.string().required("Name is required"),

    phone: yup
      .string()
      .matches(/^03[0-9]{9}$/, "Invalid phone number (e.g. 03331234567)")
      .nullable(),

    currentPassword: yup.string().nullable(),
    newPassword: yup.string().nullable(),
    confirmPassword: yup.string().nullable(),
  })
  .test("password-change", null, function (values) {
    const { currentPassword, newPassword, confirmPassword } = values;

    const anyFilled = !!currentPassword || !!newPassword || !!confirmPassword;

    if (!anyFilled) return true;

    if (!currentPassword) {
      return this.createError({
        path: "currentPassword",
        message: "Current password is required",
      });
    }

    if (!newPassword) {
      return this.createError({
        path: "newPassword",
        message: "New password is required",
      });
    }

    if (!confirmPassword) {
      return this.createError({
        path: "confirmPassword",
        message: "Confirm password is required",
      });
    }

    if (newPassword.length < 6 || newPassword.length > 32) {
      return this.createError({
        path: "newPassword",
        message: "Password must be 6–32 characters",
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return this.createError({
        path: "newPassword",
        message:
          "Password must include uppercase, lowercase, number, and special character",
      });
    }

    if (newPassword !== confirmPassword) {
      return this.createError({
        path: "confirmPassword",
        message: "Passwords do not match",
      });
    }

    if (currentPassword === newPassword) {
      return this.createError({
        path: "newPassword",
        message: "New password must be different from the current password",
      });
    }

    return true;
  });


  export default selfUpdateSchema;