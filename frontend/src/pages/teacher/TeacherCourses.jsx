import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  useTheme,
  Alert,
} from "@mui/material";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import TeachersCoursesTable from "../../components/TeachersCoursesTable";

/**
 * All courses a teacher is teaching
 *
 * @component
 * @returns {JSX.Element} table of all courses a teacher is teaching
 */
export default function TeacherCourses() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, token } = useAuth();

  // === Fetch courses & enrollments ===
  const fetchCoursesAndEnrollments = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-user": JSON.stringify(user),
      };

      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.get(`/read/api/get-data?tableName=course`, { headers }),
        api.get(`/read/api/get-data?tableName=enrollment`, { headers }),
      ]);

      const allCourses = coursesRes.data?.data || [];
      const allEnrollments = enrollmentsRes.data?.data || [];

      const teacherCourses = allCourses.filter(
        (course) => course.teacherId === user.id
      );

      const courseWithCounts = teacherCourses.map((course) => {
        const studentCount = allEnrollments.filter(
          (enroll) => enroll.courseId === course.id
        ).length;
        return { ...course, studentCount };
      });

      const availableCourses = courseWithCounts.filter(
        (c) => c.isDeleted !== 1
      );

      setCourses(availableCourses);
      setFilteredCourses(availableCourses);
    } catch (err) {
      console.error("Error fetching teacher courses:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCoursesAndEnrollments();
  }, [user]);

  // === Filter on search ===
  useEffect(() => {
    const filtered = courses.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [search, courses]);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="70vh"
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ m: { xs: 1, sm: 2 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <Box sx={{ m: { xs: 1, sm: 2 } }}>
      <BreadcrumbsNav
        items={[{ label: "Home", to: "/" }, { label: "Courses" }]}
      />
      <Header title="Your Courses" subtitle="Courses you are teaching" />

      <TeachersCoursesTable
        colors={colors}
        search={search}
        setSearch={setSearch}
        filteredCourses={filteredCourses}
        isTeacher={true}
      />
    </Box>
  );
}
