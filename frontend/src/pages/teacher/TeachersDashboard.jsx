import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Grid,
  useTheme,
  Divider,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import TruncatedTick from "../../components/TruncatedTick";

/**
 * teachers dashboard component, giving his stats.
 *
 * @component
 * @returns {JSX.Element} some cards with stats and a graph
 */
export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, token } = useAuth();

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

      // === Filter for teacher’s courses ===
      const teacherCourses = allCourses.filter(
        (course) => course.teacherId === user.id && course.isDeleted !== 1
      );

      // === Attach number of enrolled students ===
      const courseWithCounts = teacherCourses.map((course) => {
        const studentCount = allEnrollments.filter(
          (enroll) => enroll.courseId === course.id
        ).length;
        return { ...course, studentCount };
      });

      // === Calculate total students across all courses ===
      const totalStudentsCount = courseWithCounts.reduce(
        (sum, c) => sum + c.studentCount,
        0
      );

      setCourses(courseWithCounts);
      setTotalStudents(totalStudentsCount);
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

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="60vh"
      >
        <CircularProgress />
      </Box>
    );

  // === Prepare bar chart data ===
  const courseChartData = courses.map((course) => ({
    name: course.name,
    students: course.studentCount,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <BreadcrumbsNav items={[{ label: "Home" }]} />
      <Header title="TEACHER DASHBOARD" subtitle="Welcome to your dashboard." />

      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* === Summary Cards === */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Number of Courses */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: "15px",
              boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
              border: 2,
              borderColor: colors.primary[500],
              backgroundColor:
                theme.palette.mode === "dark"
                  ? colors.primary[400]
                  : colors.primary[900],
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: colors.blueAccent[500], fontWeight: 600, mb: 1 }}
            >
              Courses Taught
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
              {courses.length}
            </Typography>
          </Paper>
        </Grid>

        {/* Total Students */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: "15px",
              border: 2,
              borderColor: colors.primary[500],
              boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? colors.primary[400]
                  : colors.primary[900],
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: colors.greenAccent[500], fontWeight: 600, mb: 1 }}
            >
              Total Students
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
              {totalStudents}
            </Typography>
          </Paper>
        </Grid>

        {/* Average Students per Course (optional insight) */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: "15px",
              border: 2,
              borderColor: colors.primary[500],
              boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? colors.primary[400]
                  : colors.primary[900],
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: colors.redAccent[500], fontWeight: 600, mb: 1 }}
            >
              Avg Students per Course
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
              {courses.length > 0
                ? (totalStudents / courses.length).toFixed(1)
                : 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: colors.grey[600] }} />

      {/* === Charts === */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 10, md: 6, lg: 6, xl: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: "15px",
              boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
              border: 2,
              borderColor: colors.primary[500],
              backgroundColor:
                theme.palette.mode === "dark"
                  ? colors.primary[400]
                  : colors.primary[900],
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Students per Course
            </Typography>
            {courseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseChartData}>
                  <XAxis
                    dataKey="name"
                    stroke={colors.grey[100]}
                    interval={0} // Forces every label to be shown
                    tick={<TruncatedTick colors={colors} />} // Uses custom truncation logic
                  />
                  <YAxis stroke={colors.grey[100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill={colors.blueAccent[500]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No active courses to display.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
