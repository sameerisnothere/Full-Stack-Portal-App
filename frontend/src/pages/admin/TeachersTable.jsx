import React, { useState, useEffect } from "react";
import { Box, Alert, useTheme, Snackbar, Slide } from "@mui/material";
import { tokens } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import Header from "../../components/Header";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useFormik } from "formik";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import UserTable from "../../components/UserTable";
import userInsertValidationSchema from "../../validation/insertUser";
import UserForm from "../../components/UserForm";

/**
 * teachers table and register teacher form, with all CRUD functionality
 *
 * @component
 * @returns {JSX.Element} Form to register new and a CRUD table containing all
 */
const TeacherManagement = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]); // filtered list
  const [searchQuery, setSearchQuery] = useState(""); // search input
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // === Fetch Teachers ===
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setFetching(true);
        const headers = { Authorization: `Bearer ${token}` };
        const res = await api.get("/read/api/get-data?tableName=teacher", {
          headers,
        });

        setTeachers(res.data.data || []);
        setFilteredTeachers(res.data.data || []); // initialize filtered list
      } catch (error) {
        console.log("error: ", error.response);
        setMessage({
          type: "error",
          text:
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.response?.data?.detail ||
            "Failed to fetch teachers",
        });
      } finally {
        setFetching(false);
      }
    };

    if (user?.type === "admin") fetchTeachers();
  }, [token, user]);

  // === Filter when search changes ===
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTeachers(teachers);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = teachers.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.cnic?.toLowerCase().includes(q) ||
        t.phone?.toLowerCase().includes(q)
    );
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  // === Formik Setup ===
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      cnic: "",
      status: "active",
      gender: "",
    },
    validationSchema: userInsertValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setMessage(null);
      try {
        setLoading(true);
        const headers = {
          Authorization: `Bearer ${token}`,
          "x-user": JSON.stringify(user),
        };

        const payload = {
          table: "teacher",
          data: {
            name: values.name,
            email: values.email,
            password: values.password,
            cnic: values.cnic,
            phone: values.phone,
            status: values.status,
            gender: values.gender,
          },
        };

        const res = await api.post(
          "/create/api/insert",
          {
            payload: payload,
          },
          { headers }
        );

        setMessage({
          type: "success",
          text: res.data.message || "Teacher added successfully!",
        });
        resetForm();

        // Refresh teacher list
        const updated = await api.get("/read/api/get-data?tableName=teacher", {
          headers,
        });

        setTeachers(updated.data.data);
        setFilteredTeachers(updated.data.data);
      } catch (error) {
        console.error("Insert error:", error);
        setMessage({
          type: "error",
          text:
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.response?.data?.detail ||
            "Insert failed",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // === Delete Logic ===
  const handleDeleteClick = (teacher) => {
    setSelectedTeacher(teacher);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;
    setConfirmOpen(false);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-user": JSON.stringify(user),
      };

      const payload = { type: "teacher" };

      await api.delete(`/delete/api/delete/${selectedTeacher.id}`, {
        data: payload,
        headers: headers,
      });

      const res = await api.get("/read/api/get-data?tableName=teacher", {
        headers,
      });

      setTeachers(res.data.data || []);
      setFilteredTeachers(res.data.data || []);
      setMessage({ type: "success", text: "Teacher deleted successfully!" });
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Delete failed",
      });
    } finally {
      setSelectedTeacher(null);
    }
  };

  function SlideDownTransition(props) {
    return <Slide {...props} direction="down" />;
  }

  const handleUpdate = (teacher) => {
    navigate(`/update-teacher/${teacher.id}`);
  };

  const handleStatusChange = async (teacher) => {
    if (teacher.isDeleted) {
      console.error("Cannot make the status of a deleted teacher to active");
      setMessage({
        type: "error",
        text: "Cannot make the status of a deleted teacher to active",
      });
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-user": JSON.stringify(user),
      };

      const payload = {
        type: "teacher",
        data: {
          status: teacher.status === "active" ? "inactive" : "active",
        },
      };

      await api.put(`/update/api/update-one/${teacher.id}`, payload, {
        headers,
      });

      const res = await api.get("/read/api/get-data?tableName=teacher", {
        headers,
      });

      setTeachers(res.data.data || []);
      setFilteredTeachers(res.data.data || []);
      setMessage({
        type: "success",
        text: "teacher status changed successfully.",
      });
    } catch (error) {
      console.error("Status change error:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Status change failed",
      });
    }
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ m: { xs: 1, sm: 2 } }}>
      <BreadcrumbsNav
        items={[{ label: "Home", to: "/" }, { label: "Teachers" }]}
      />
      <Header
        title="TEACHER MANAGEMENT"
        subtitle="Add and manage teacher records"
      />

      <Snackbar
        open={Boolean(message)}
        onClose={() => setMessage(null)}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={SlideDownTransition}
      >
        <Alert
          onClose={() => setMessage(null)}
          severity={message?.type || "info"}
          sx={{
            width: "100%",
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          {message?.text}
        </Alert>
      </Snackbar>

      {/* === ADD TEACHER FORM === */}
      <UserForm
        colors={colors}
        formik={formik}
        formTitle="Add New Teacher"
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirm={showConfirm}
        setShowConfirm={setShowConfirm}
        loading={loading}
        buttonTitle="Add Teacher"
        loadingMessage="Adding..."
      />

      {/* === SEARCH + TEACHERS TABLE === */}

      <UserTable
        filteredUsers={filteredTeachers}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        userType="teacher"
        handleUpdate={handleUpdate}
        handleStatusChange={handleStatusChange}
        handleDeleteClick={handleDeleteClick}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        fetching={fetching}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Teacher"
        message={`Are you sure you want to delete "${selectedTeacher?.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
};

export default TeacherManagement;
