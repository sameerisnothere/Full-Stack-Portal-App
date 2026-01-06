import React, { useState, useEffect } from "react";
import { Box, Alert, useTheme, Snackbar, Slide } from "@mui/material";
import { tokens } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useFormik } from "formik";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import courseValidationSchema from "../../validation/courseValidation";
import CourseForm from "../../components/CourseForm";
import CoursesTable from "../../components/CoursesTable";

const creditOptions = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
];

/**
 * Courses page component with an add course form and a courses table.
 *
 * @component
 * @returns {JSX.Element} add course form and a courses table.
 */
const CoursesPage = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); //  Search term
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // === States ===
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTeachers, setFetchingTeachers] = useState(true);
  const [message, setMessage] = useState(null);

  // Table states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // === Fetch teachers ===
  const fetchTeachers = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-user": JSON.stringify(user),
      };
      const res = await api.get("/read/api/get-data?tableName=teacher", {
        headers,
      });

      // Check if isDeleted is NOT true (i.e., is false, 0, null, or undefined)
      const availableTeachers = res.data.data.filter(
        (t) => !t.isDeleted && t.status === "active"
      );
      setTeachers(availableTeachers || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setMessage({ type: "error", text: "Failed to load teachers." });
    } finally {
      setFetchingTeachers(false);
    }
  };

  // === Fetch courses ===
  const fetchCourses = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [coursesRes, teachersRes] = await Promise.all([
        api.get("/read/api/get-data?tableName=course", { headers }),
        api.get("/read/api/get-data?tableName=teacher", { headers }),
      ]);

      const courseList = coursesRes.data?.data || [];
      const teacherList = teachersRes.data?.data || [];

      // Merge teacher names into courses
      const merged = courseList.map((course) => {
        const teacher = teacherList.find((t) => t.id === course.teacherId);
        return { ...course, teacherName: teacher ? teacher.name : "Unknown" };
      });

      setCourses(merged);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setMessage({
        type: "error",
        text:
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to fetch courses.",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTeachers();
      fetchCourses();
    }
  }, [user, token]);

  // === Formik Setup ===
  const formik = useFormik({
    initialValues: {
      courseName: "",
      teacherId: "",
      creditHours: 3,
    },
    validationSchema: courseValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setMessage(null);
        const headers = {
          Authorization: `Bearer ${token}`,
          "x-user": JSON.stringify(user),
        };

        const payload = {
          table: "course",
          data: {
            name: values.courseName,
            teacherId: values.teacherId,
            credit_hours: values.creditHours,
          },
        };

        const res = await api.post(
          "/create/api/insert",
          {
            payload: payload,
          },
          { headers }
        );

        setMessage({ type: "success", text: res.data.message });
        resetForm();
        fetchCourses();
      } catch (err) {
        console.error("Course creation failed:", err);
        setMessage({
          type: "error",
          text:
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.response?.data?.detail ||
            "Failed to add course.",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // === Delete Confirmation ===
  const handleDeleteClick = (course) => {
    setSelectedCourse(course);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;
    setConfirmOpen(false);

    try {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-user": JSON.stringify(user),
      };

      const payload = { type: "course" };

      await api.delete(`/delete/api/delete/${selectedCourse.id}`, {
        data: payload,
        headers: headers,
      });

      fetchCourses();
      setMessage({ type: "success", text: "Course deleted successfully." });
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Delete failed",
      });
    } finally {
      setLoading(false);
      setSelectedCourse(null);
    }
  };

  function SlideDownTransition(props) {
    return <Slide {...props} direction="down" />;
  }

  // === Pagination Handlers ===
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  // === Search Filter ===
  const filteredCourses = courses.filter((course) => {
    const search = searchTerm.toLowerCase();
    return (
      course.name.toLowerCase().includes(search) ||
      course.teacherName.toLowerCase().includes(search) ||
      String(course.credit_hours).includes(search)
    );
  });

  // === UI ===
  return (
    <Box sx={{ m: { xs: 1, sm: 2 } }}>
      <BreadcrumbsNav
        items={[
          { label: "Home", to: "/" },
          { label: "Courses" }, // last item has no "to"
        ]}
      />
      <Header title="COURSES" subtitle="Manage courses and their teachers" />

      <Snackbar
        open={Boolean(message)}
        onClose={() => setMessage(null)}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={SlideDownTransition}
      >
        <Alert
          onClose={() => setMessage(null)}
          severity={message?.type || "info"}
          sx={{
            width: "100%",
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          {message?.text}
        </Alert>
      </Snackbar>

      {/* ---------- FORM SECTION ---------- */}
      <CourseForm
        colors={colors}
        formik={formik}
        creditOptions={creditOptions}
        fetchingTeachers={fetchingTeachers}
        teachers={teachers}
        loading={loading}
        buttonTitle="Add Course"
        formTitle="Add New Course"
      />

      {/* ---------- TABLE SECTION ---------- */}
      {/* === COURSES TABLE === */}
      <CoursesTable
        colors={colors}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredCourses={filteredCourses}
        page={page}
        rowsPerPage={rowsPerPage}
        loading={loading}
        navigate={navigate}
        handleDeleteClick={handleDeleteClick}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />

      {/* ---------- Confirm Dialog ---------- */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Course"
        message={`Are you sure you want to delete "${selectedCourse?.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
};

export default CoursesPage;
