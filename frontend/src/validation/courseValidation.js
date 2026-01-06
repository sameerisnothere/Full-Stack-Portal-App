import * as Yup from "yup";

// === Yup Validation Schema ===
const courseValidationSchema = Yup.object({
  courseName: Yup.string()
    .matches(/^[A-Za-z ]+$/, "Name can only contain letters and spaces")
    .trim()
    .min(3, "Course name must be at least 3 characters")
    .max(50, "Course name too long")
    .required("Course name is required"),
  creditHours: Yup.number()
    .oneOf([1, 2, 3], "Invalid credit hours")
    .required("Credit hours are required"),
  teacherId: Yup.string().required("Teacher is required"),
});

export default courseValidationSchema;
