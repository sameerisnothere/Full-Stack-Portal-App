import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  useTheme,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { tokens } from "../../theme";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import Header from "../../components/Header";
import UserDetailCard from "../../components/UserDetailCard";
import TeachersCoursesTable from "../../components/TeachersCoursesTable";

const TeacherDetailPage = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await api.get(
          `/read/api/get-data?tableName=teacher&id=${id}`,
          { headers }
        );
        const data = res.data.data?.[0]; // assuming API returns an array
        setTeacher(data || null);
      } catch (error) {
        console.error("Failed to fetch teacher:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.type === "admin") fetchTeacher();
  }, [id, token, user]);

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
        (course) => course.teacherId == id
      );


      const courseWithCounts = teacherCourses.map((course) => {
        const studentCount = allEnrollments.filter(
          (enroll) => enroll.courseId === course.id
        ).length;
        return { ...course, studentCount };
      });

      const availableCourses = courseWithCounts.filter((c) => !c.isDeleted);

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

  if (loading) return <CircularProgress />;

  if (!teacher)
    return <Box sx={{ color: colors.grey[100], p: 3 }}>Teacher not found.</Box>;

  if (error)
    return (
      <Box m="20px">
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  // === Inline Teacher Card ===
  return (
    <Box sx={{ m: { xs: 1, sm: 2 } }}>
      <BreadcrumbsNav
        items={[
          { label: "Home", to: "/" },
          { label: "Teachers", to: "/teachers" },
          { label: teacher.email },
        ]}
      />
      <Header title={teacher.name} subtitle="Teacher Info" />

      <UserDetailCard user={teacher} colors={colors} />

      <TeachersCoursesTable
        colors={colors}
        search={search}
        setSearch={setSearch}
        filteredCourses={filteredCourses}
      />
    </Box>
  );
};

export default TeacherDetailPage;
