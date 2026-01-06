import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  useTheme,
  Alert,
} from "@mui/material";
import { tokens } from "../../theme";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import Header from "../../components/Header";
import UserDetailCard from "../../components/UserDetailCard";
import StudentsCoursestable from "../../components/StudentsCoursesTable";

const StudentDetailPage = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await api.get(
          `/read/api/get-data?tableName=student&id=${id}`,
          { headers }
        );
        const data = res.data.data?.[0]; // assuming API returns an array
        setStudent(data || null);
      } catch (error) {
        console.error("Failed to fetch student:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.type === "admin") fetchStudent();
  }, [id, token, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [coursesRes, enrollRes] = await Promise.all([
        api.get("/read/api/get-data?tableName=course", { headers }),
        api.get("/read/api/get-data?tableName=enrollment", { headers }),
      ]);

      const allCourses = coursesRes.data?.data || [];
      let enrollments = enrollRes.data?.data || [];


      enrollments = enrollments.filter((en) => en.studentId == id);

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

      setCourses(enrolledCourses);

    } catch (error) {
      console.error("Error fetching:", error);
      setMessage({ type: "error", text: "Failed to load courses" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  if (loading) return <CircularProgress />;

  if (!student)
    return <Box sx={{ color: colors.grey[100], p: 3 }}>Student not found.</Box>;

  const columns = [
    { field: "name", headerName: "Course Name", flex: 1 },
    { field: "teacherName", headerName: "Teacher Name", flex: 1 },
    { field: "credit_hours", headerName: "Credit Hours", width: 150 },
  ];

  // === Inline Student Card ===
  return (
    <Box sx={{ m: { xs: 1, sm: 2 } }}>
      <BreadcrumbsNav
        items={[
          { label: "Home", to: "/" },
          { label: "Students", to: "/students" },
          { label: student.email },
        ]}
      />
      <Header title={student.name} subtitle="Student Info" />
      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <UserDetailCard user={student} colors={colors} />

      <StudentsCoursestable
        loading={loading}
        colors={colors}
        courses={courses}
        columns={columns}
      />
    </Box>
  );
};

export default StudentDetailPage;
