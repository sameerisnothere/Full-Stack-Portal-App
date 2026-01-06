import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  useTheme,
  Button,
} from "@mui/material";
import { useParams, useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import CourseStudentsTable from "../../components/CourseStudentsTable";

/**
 * All students of a course
 *
 * @component
 * @returns {JSX.Element} table of all students of a course
 */
export default function CourseStudents() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { courseId } = useParams();
  const location = useLocation();
  const courseName = location.state?.courseName || "Course";
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      const headers = { "x-user": JSON.stringify(user) };
      const enrollmentRes = await api.get(
        `/read/api/get-data?tableName=enrollment&courseId=${courseId}`,
        { headers }
      );

      const enrollments = enrollmentRes.data.data || [];
      const studentIds = enrollments.map((e) => e.studentId);

      if (studentIds.length === 0) {
        setStudents([]);
        setFilteredStudents([]);
        return;
      }

      const studentRes = await api.get(`/read/api/get-data?tableName=student`, {
        headers,
      });

      const studentData = studentRes.data.data || [];
      const courseStudents = studentData.filter((s) =>
        studentIds.includes(s.id)
      );

      setStudents(courseStudents);
      setFilteredStudents(courseStudents);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  // Filter students when search changes
  useEffect(() => {
    const filtered = students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [search, students]);

  if (loading)
    return (
      <Box sx={{ m: { xs: 1, sm: 2 } }}>
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
        items={[
          { label: "Home", to: "/" },
          { label: "Courses", to: "/teacher/courses" },
          { label: courseName }, // last item has no "to"
        ]}
      />
      <Header
        title={`Students of ${courseName}`}
        subtitle="Enrolled students"
      />

      <CourseStudentsTable
        colors={colors}
        search={search}
        setSearch={setSearch}
        filteredStudents={filteredStudents}
      />

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={() => window.history.back()}
          sx={{
            backgroundColor: colors.greenAccent[700],
            borderRadius: "8px",
            textTransform: "none",
            px: 3,
            fontWeight: "bold",
          }}
        >
          Back
        </Button>
      </Box>
    </Box>
  );
}
