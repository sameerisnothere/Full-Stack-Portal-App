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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import api from "../../api/axiosInstance";
// import { useAuth } from "../context/AuthContext";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";

/**
 * AdminDashboard component displays summary counts of students, teachers, and courses.
 * It fetches the data from the backend and prepares it for charts.
 *
 * @component
 * @returns {JSX.Element} Dashboard UI with loading indicator and chart data.
 */
export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
  });
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  // const { user } = useAuth();

  useEffect(() => {
    /** fetch the students, teachers, and courses and store their counts in their state. */
    const fetchCounts = async () => {
      try {
        const [studentsRes, teachersRes, coursesRes, enrollmentRes] =
          await Promise.all([
            api.get("/read/api/get-data", { params: { tableName: "student" } }),
            api.get("/read/api/get-data", { params: { tableName: "teacher" } }),
            api.get("/read/api/get-data", { params: { tableName: "course" } }),
            api.get("/read/api/get-data", {
              params: { tableName: "enrollment" },
            }),
          ]);

        setCounts({
          students: studentsRes.data.data.length,
          teachers: teachersRes.data.data.length,
          courses: coursesRes.data.data.length,
        });
        setTeachers(teachersRes.data?.data);
        setCourses(coursesRes.data?.data);
        setStudents(studentsRes.data?.data);
        setEnrollments(enrollmentRes.data?.data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Aggregate data by date for any entity
  const aggregateByDate = (items) => {
    return items.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  };

  // Build time-series data
  const studentsByDate = aggregateByDate(students);
  const teachersByDate = aggregateByDate(teachers);
  const coursesByDate = aggregateByDate(courses);
  const enrollmentsByDate = aggregateByDate(enrollments);

  // Merge all dates into a sorted array
  const allDates = Array.from(
    new Set([
      ...Object.keys(studentsByDate),
      ...Object.keys(teachersByDate),
      ...Object.keys(coursesByDate),
      ...Object.keys(enrollmentsByDate),
    ])
  ).sort((a, b) => new Date(a) - new Date(b));

  // Create a merged dataset
  const mergedTimeSeries = allDates.map((date) => ({
    date,
    students: studentsByDate[date] || 0,
    teachers: teachersByDate[date] || 0,
    courses: coursesByDate[date] || 0,
    enrollments: enrollmentsByDate[date] || 0,
  }));

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

  // === Chart Data ===
  const barData = [
    { name: "Students", count: counts.students },
    { name: "Teachers", count: counts.teachers },
    { name: "Courses", count: counts.courses },
  ];

  const pieData = [
    { name: "Students", value: counts.students },
    { name: "Teachers", value: counts.teachers },
    { name: "Courses", value: counts.courses },
  ];

  const COLORS = [
    colors.greenAccent[400],
    colors.blueAccent[400],
    colors.redAccent[400],
  ];

  return (
    <Box sx={{ p: 3 }}>
      <BreadcrumbsNav items={[{ label: "Home" }]} />
      <Header title="DASHBOARD" subtitle="System overview and analytics" />

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          {
            label: "Students",
            value: counts.students,
            color: colors.blueAccent[500],
          },
          {
            label: "Teachers",
            value: counts.teachers,
            color: colors.greenAccent[500],
          },
          {
            label: "Courses",
            value: counts.courses,
            color: colors.redAccent[500],
          },
        ].map((item, idx) => (
          <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2, xl: 2 }} key={idx}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: "15px",
                boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? colors.primary[400]
                    : colors.primary[900],
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: item.color,
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: "bold",
                }}
              >
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3, borderColor: colors.grey[600] }} />

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Bar Chart */}
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: "15px",
              boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? colors.primary[400]
                  : colors.primary[900],
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Students, Teachers, and Courses Count
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke={colors.grey[100]} />
                <YAxis stroke={colors.grey[100]} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill={colors.greenAccent[500]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie Chart */}
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: "15px",
              boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? colors.primary[400]
                  : colors.primary[900],
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              System Composition
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Enrollment Over Time */}
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: "15px",
              boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? colors.primary[400]
                  : colors.primary[900],
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Data Inserted Over Time
            </Typography>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={mergedTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={colors.grey[100]} />
                <YAxis stroke={colors.grey[100]} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke={colors.blueAccent[400]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="teachers"
                  stroke={colors.greenAccent[400]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="courses"
                  stroke={colors.redAccent[400]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  stroke={colors.orangeAccent?.[400] || "#FFA500"}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
