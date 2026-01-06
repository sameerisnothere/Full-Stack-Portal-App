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
 * Student dashboard with a graph
 *
 * @component
 * @returns {JSX.Element} student dashboard
 */
export default function StudentDashboard() {
  // const [availableCourses, setAvailableCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [totalCreditHrs, setTotalCreditHrs] = useState(0);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const [coursesRes, enrollRes] = await Promise.all([
          api.get("/read/api/get-data?tableName=course", { headers }),
          api.get("/read/api/get-data?tableName=enrollment", { headers }),
        ]);

        const allCourses = coursesRes.data?.data || [];
        const enrollments = enrollRes.data?.data || [];

        const enrolledIds = enrollments.map((c) => c.courseId);

        const enrolledCourses = allCourses
          .filter((c) => enrolledIds.includes(c.id))
          .map((course) => {
            const enrollment = enrollments.find(
              (e) => e.courseId === course.id
            );
            return {
              ...course,
              enrollmentId: enrollment?.id || null,
            };
          });

        setCourses(enrolledCourses);

        // === Calculate total credit hours ===
        const totalCredits = enrolledCourses.reduce(
          (sum, c) => sum + (c.credit_hours || 0),
          0
        );
        setTotalCreditHrs(totalCredits);
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

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
    credit_hours: course.credit_hours || 0,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <BreadcrumbsNav items={[{ label: "Home" }]} />
      <Header title="STUDENT DASHBOARD" subtitle="Welcome to your dashboard." />

      {/* === Summary Cards === */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2, xl: 2 }}>
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
              sx={{ color: colors.blueAccent[500], fontWeight: 600, mb: 1 }}
            >
              Enrolled Courses
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
              {courses.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2, xl: 2 }}>
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
              Total Credit Hours
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
              {totalCreditHrs}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: colors.grey[600] }} />

      {/* === Charts === */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 10, md: 8, lg: 6, xl: 6 }}>
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
              Course Credit Hours Overview
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
                  <YAxis stroke={colors.grey[100]} tickCount={4} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="credit_hours" fill={colors.greenAccent[500]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No enrolled courses yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
