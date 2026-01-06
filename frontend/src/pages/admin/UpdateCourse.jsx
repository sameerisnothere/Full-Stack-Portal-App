import React, { useEffect, useState } from "react";
import {
  Box,
  Alert,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import Header from "../../components/Header";
import { useFormik } from "formik";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import courseValidationSchema from "../../validation/courseValidation";
import CourseForm from "../../components/CourseForm";

const creditOptions = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
];

/**
 * Update course component
 *
 * @component
 * @returns {JSX.Element} update course form with current values filled in
 */
const UpdateCourse = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { token, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [fetchingTeachers, setFetchingTeachers] = useState(true);

  // Fetch course details
  const fetchCourse = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const res = await api.get(`/read/api/get-data?tableName=course&id=${id}`, {
      headers,
    });

    return res.data?.data?.[0];
  };

  // Fetch teachers for dropdown
  const fetchTeachers = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const res = await api.get("/read/api/get-data?tableName=teacher", {
      headers,
    });

    return res.data?.data || [];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [courseData, teacherData] = await Promise.all([
          fetchCourse(),
          fetchTeachers(),
        ]);
        const availableTeachers = teacherData.filter(
          (t) => !t.isDeleted && t.status === "active"
        );
        setTeachers(availableTeachers);
        formik.setValues({
          courseName: courseData.name || "",
          teacherId: courseData.teacherId || "",
          creditHours: courseData.credit_hours || 3,
        });
      } catch (err) {
        console.error("Error loading data:", err);
        setMessage({
          type: "error",
          text: "Failed to load course or teacher data.",
        });
      } finally {
        setLoading(false);
        setFetchingTeachers(false);
      }
    };
    loadData();
  }, []);

  // Formik Setup
  const formik = useFormik({
    initialValues: {
      courseName: "",
      teacherId: "",
      creditHours: 3,
    },
    validationSchema: courseValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setMessage(null);
        const headers = {
          Authorization: `Bearer ${token}`,
          "x-user": JSON.stringify(user),
        };

        const payload = {
          type: "course",
          data: {
            name: values.courseName,
            teacherId: values.teacherId,
            credit_hours: values.creditHours,
          },
        };

        const res = await api.put(`/update/api/update-one/${id}`, payload, {
          headers,
        });

        setMessage({ type: "success", text: res.data.message });
        setTimeout(() => navigate("/course-list"), 1000);
      } catch (error) {
        console.error("Update error:", error);
        setMessage({
          type: "error",
          text:
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to update course.",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box sx={{ m: { xs: 1, sm: 2 } }}>
      <BreadcrumbsNav
        items={[
          { label: "Home", to: "/" },
          { label: "Courses", to: "/course-list" },
          { label: "Update Course" },
        ]}
      />

      <Header
        title="UPDATE COURSE"
        subtitle="Modify course details or teacher"
      />

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <CourseForm
        colors={colors}
        formik={formik}
        creditOptions={creditOptions}
        fetchingTeachers={fetchingTeachers}
        teachers={teachers}
        loading={loading}
        buttonTitle="Update Course"
        formTitle="Update Course"
      />
    </Box>
  );
};

export default UpdateCourse;
