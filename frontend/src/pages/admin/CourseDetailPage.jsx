import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  useTheme,
  Paper,
  Typography,
  Grid,
  Alert,
} from "@mui/material";
import { tokens } from "../../theme";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import Header from "../../components/Header";
import CourseStudentsTable from "../../components/CourseStudentsTable";

const CourseDetailPage = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await api.get(
          `/read/api/get-data?tableName=course&id=${id}`,
          { headers }
        );
        let data = res.data.data?.[0]; // assuming API returns an array
        const teacherRes = await api.get(
          `/read/api/get-data?tableName=teacher&id=${data.teacherId}`,
          { headers }
        );
        const teacher = teacherRes.data.data?.[0];

        data.teacherName = teacher.name;
        setCourse(data || null);
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.type === "admin") fetchCourse();
  }, [id, token, user]);

  const fetchStudents = async () => {
    try {
      const headers = { "x-user": JSON.stringify(user) };
      const enrollmentRes = await api.get(
        `/read/api/get-data?tableName=enrollment&courseId=${id}`,
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
  }, [id]);

  // Filter students when search changes
  useEffect(() => {
    const filtered = students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [search, students]);

  useEffect(() => {
    if (user) fetchStudents();
  }, [user]);

  if (loading) return <CircularProgress />;

  if (!course)
    return <Box sx={{ color: colors.grey[100], p: 3 }}>Course not found.</Box>;

  if (error)
    return (
      <Box m="20px">
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  // === Inline Student Card ===
  return (
    <Box sx={{ m: { xs: 1, sm: 2 } }}>
      <BreadcrumbsNav
        items={[
          { label: "Home", to: "/" },
          { label: "Courses", to: "/course-list" },
          { label: course.name },
        ]}
      />
      <Header title={course.name} subtitle="Course Info" />
      <Paper
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: colors.primary[400],
          borderRadius: "15px",
          boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
          border: 2,
          borderColor: colors.primary[500],
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: colors.grey[100],
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            position: "relative",
            "&::after": {
              content: '""',
              display: "block",
              width: "40px",
              height: "3px",
              backgroundColor: colors.redAccent[500],
              mt: 1,
              borderRadius: "2px",
            },
          }}
        >
          Course Information
        </Typography>

        <Grid container spacing={2}>
          {[
            { label: "Name", value: course.name },
            { label: "Credit Hours", value: course.credit_hours },
            { label: "Teacher", value: course.teacherName },
            { label: "Deleted", value: course.isDeleted ? "Yes" : "No" },
          ].map((field) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4, lg: 2, xl: 2 }}
              key={field.label}
            >
              <Typography variant="subtitle2" sx={{ color: colors.grey[300] }}>
                {field.label}
              </Typography>
              <Typography variant="body1" sx={{ color: colors.grey[100] }}>
                {field.value || "-"}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* table of students in this course  */}
      <CourseStudentsTable
        colors={colors}
        search={search}
        setSearch={setSearch}
        filteredStudents={filteredStudents}
        course={course}
      />
    </Box>
  );
};

export default CourseDetailPage;
