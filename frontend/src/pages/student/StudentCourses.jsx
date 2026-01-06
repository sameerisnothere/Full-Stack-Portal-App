import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Autocomplete,
  TextField,
  IconButton,
  Tooltip,
  useTheme,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import ConfirmDialog from "../../components/ConfirmDialog";
import StudentsCoursestable from "../../components/StudentsCoursesTable";

/**
 * All courses of a student and the functionality to enroll and unenroll
 *
 * @component
 * @returns {JSX.Element} Form to enroll in a course and a courses table below it.
 */
const CoursesPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, token } = useAuth();

  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [message, setMessage] = useState(null);
  const [totalCredHrs, setTotalCredHrs] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);

  // Fetch courses
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

      // === Enrolled courses with enrollmentId ===
      const enrolledCourses = allCourses
        .filter((c) => enrolledIds.includes(c.id))
        .map((course) => {
          const enrollment = enrollments.find((e) => e.courseId === course.id);
          return {
            ...course,
            enrollmentId: enrollment?.id || null, // attach enrollmentId
          };
        });

      const validCourses = allCourses.filter((c) => !c.isDeleted);

      const available = validCourses.filter((c) => !enrolledIds.includes(c.id));

      const sum = enrolledCourses.reduce(
        (total, course) => total + (Number(course.credit_hours) || 0),
        0
      );

      setTotalCredHrs(sum);
      setCourses(enrolledCourses);
      setAvailableCourses(available);
    } catch (error) {
      console.error("Error fetching:", error);
      setMessage({ type: "error", text: "Failed to load courses" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.type === "student") fetchData();
  }, [user]);

  // === Handle Enrollment ===
  const handleEnroll = async () => {
    if (selectedCourses.length === 0) return;
    try {
      setEnrolling(true);
      setUnenrolling(true);
      setMessage(null);

      const selectedCreds = selectedCourses.reduce(
        (total, course) => total + (Number(course.credit_hours) || 0),
        0
      );

      if (selectedCreds + totalCredHrs > 15) {
        setMessage({
          type: "warning",
          text: "Insufficient credit Hours",
        });
        return;
      }

      const courseId = selectedCourses.map((c) => c.id);

      const payload = {
        table: "enrollment",
        data: {
          courseId,
        },
      };

      const headers = { "x-user": JSON.stringify(user) };
      const res = await api.post(
        "/create/api/insert",
        {
          payload: payload,
        },
        { headers }
      );

      setMessage({ type: "success", text: res.data.message });
      setSelectedCourses([]);
      fetchData();
    } catch (error) {
      console.error("Enroll error:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Enrollment failed",
      });
    } finally {
      setEnrolling(false);
      setUnenrolling(false);
    }
  };

  // === Handle Unenroll ===
  const handleUnenroll = async () => {
    if (!selectedEnrollmentId) return;

    try {
      setConfirmOpen(false);
      setMessage(null);
      setUnenrolling(true);

      const headers = { "x-user": JSON.stringify(user) };
      const payload = { type: "enrollment" };

      await api.delete(`/delete/api/delete/${selectedEnrollmentId}`, {
        data: payload,
        headers,
      });

      setMessage({ type: "success", text: "Unenrolled successfully" });
      fetchData();
    } catch (error) {
      console.error("Unenroll error:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Unenrollment failed",
      });
    } finally {
      setSelectedEnrollmentId(null);
      setUnenrolling(false);
    }
  };

  // === DataGrid Columns ===
  const columns = [
    { field: "name", headerName: "Course Name", flex: 1 },
    { field: "teacherName", headerName: "Teacher Name", flex: 1 },
    { field: "credit_hours", headerName: "Credit Hours", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Unenroll">
          <IconButton
            color="error"
            onClick={() => {
              setSelectedEnrollmentId(params.row.enrollmentId);
              setConfirmOpen(true);
            }}
            disabled={unenrolling}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ m: { xs: 1, sm: 2 } }}>
      <BreadcrumbsNav
        items={[{ label: "Home", to: "/" }, { label: "Courses" }]}
      />
      <Header title="COURSES" subtitle="Manage your courses and enrollments" />

      {/* ---------- Enroll Form Card ---------- */}
      <Card
        sx={{
          backgroundColor: colors.primary[400],
          mb: 4,
          border: 2,
          borderColor: colors.primary[500],
          borderRadius: "20px",
          boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
          p: 1,
        }}
      >
        <CardContent>
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
                backgroundColor: colors.greenAccent[500],
                mt: 1,
                borderRadius: "2px",
              },
            }}
          >
            Enroll in Courses
          </Typography>
          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          {/* Multi-select with chips */}
          {loading && (
            <Box display="flex" justifyContent="center" mb={2}>
              <CircularProgress size={28} />
            </Box>
          )}
          <Autocomplete
            multiple
            options={availableCourses}
            value={selectedCourses}
            disabled={loading}
            getOptionLabel={(option) => option.name} // still needed for filtering
            onChange={(event, newValue) => setSelectedCourses(newValue)}
            // Render table rows
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box sx={{ display: "flex", width: "100%", px: 2, py: 0.5 }}>
                  <Box sx={{ flex: 2 }}>{option.name}</Box>
                  <Box sx={{ flex: 2 }}>{option.teacherName}</Box>
                  <Box sx={{ flex: 1, textAlign: "right" }}>
                    {option.credit_hours}
                  </Box>
                </Box>
              </li>
            )}
            // Custom Paper to add header
            PaperComponent={(props) => (
              <Paper {...props}>
                <Box
                  sx={{
                    display: "flex",
                    px: 2,
                    py: 1,
                    backgroundColor: colors.greenAccent[600],
                    borderBottom: "1px solid #ccc",
                    fontWeight: "bold",
                  }}
                >
                  <Box sx={{ flex: 2 }}>Course Name</Box>
                  <Box sx={{ flex: 2 }}>Teacher</Box>
                  <Box sx={{ flex: 1, textAlign: "right" }}>Credit Hours</Box>
                </Box>
                {props.children}
              </Paper>
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={`${option.name} (${option.credit_hours} CH)`}
                  {...getTagProps({ index })}
                  key={option.id}
                  color="secondary"
                  variant="filled"
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select one or more courses"
                variant="filled"
                sx={{ mb: 3 }}
              />
            )}
          />

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="secondary"
              disabled={selectedCourses.length === 0 || enrolling}
              onClick={handleEnroll}
            >
              {enrolling
                ? "Enrolling..."
                : `Enroll (${selectedCourses.length})`}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ---------- Enrolled Courses Table ---------- */}
      <StudentsCoursestable
        loading={loading}
        colors={colors}
        totalCredHrs={totalCredHrs}
        courses={courses}
        columns={columns}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Unenrollment"
        message="Are you sure you want to unenroll from this course?"
        onConfirm={handleUnenroll}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedEnrollmentId(null);
        }}
      />
    </Box>
  );
};

export default CoursesPage;
