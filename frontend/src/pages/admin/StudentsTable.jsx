import React, { useEffect, useMemo, useState } from "react";
import { Box, Alert, useTheme, Snackbar, Slide } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useFormik } from "formik";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import UserTable from "../../components/UserTable";
import UserForm from "../../components/UserForm";
import userInsertValidationSchema from "../../validation/insertUser";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudents,
  addStudent,
  deleteStudent,
  updateStudentStatus,
} from "../../store/students/studentsThunks";
import { clearMessage } from "../../store/students/studentsSlice";

function SlideDownTransition(props) {
  return <Slide {...props} direction="down" />;
}

const StudentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { token, user } = useAuth();

  const {
    list: students,
    fetching,
    loading,
    message,
    error,
  } = useSelector((state) => state.students);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // === Fetch students ===
  useEffect(() => {
    if (user?.type === "admin") {
      dispatch(fetchStudents({ token }));
    }
  }, [dispatch, token, user]);

  // === Derived search filter ===
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.cnic?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // === Formik ===
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
      const payload = {
        table: "student",
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

      const result = await dispatch(addStudent({ token, user, payload }));

      if (addStudent.fulfilled.match(result)) {
        resetForm();
      }
    },
  });

  // === Delete ===
  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;
    setConfirmOpen(false);

    dispatch(
      deleteStudent({
        token,
        user,
        id: selectedStudent.id,
      })
    );

    setSelectedStudent(null);
  };

  // === Status toggle ===
  const handleStatusChange = (student) => {
    dispatch(
      updateStudentStatus({
        token,
        user,
        student,
      })
    );
  };

  const handleUpdate = (student) => {
    navigate(`/update-student/${student.id}`);
  };

  return (
    <Box sx={{ m: { xs: 1, sm: 2 } }}>
      <BreadcrumbsNav
        items={[{ label: "Home", to: "/" }, { label: "Students" }]}
      />
      <Header title="STUDENTS" subtitle="Add and manage student records" />

      <Snackbar
        open={Boolean(message || error)}
        autoHideDuration={4000}
        onClose={() => dispatch(clearMessage())}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={SlideDownTransition}
      >
        <Alert
          severity={error ? "error" : "success"}
          onClose={() => dispatch(clearMessage())}
          sx={{ width: "100%", boxShadow: 3, borderRadius: 2 }}
        >
          {error || message}
        </Alert>
      </Snackbar>

      {/* === ADD STUDENT FORM === */}
      <UserForm
        colors={colors}
        formik={formik}
        formTitle="Add New Student"
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirm={showConfirm}
        setShowConfirm={setShowConfirm}
        loading={loading}
        buttonTitle="Add Student"
        loadingMessage="Adding..."
      />

      {/* === TABLE === */}
      <UserTable
        filteredUsers={filteredStudents}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={(_, p) => setPage(p)}
        handleChangeRowsPerPage={(e) => setRowsPerPage(+e.target.value)}
        userType="student"
        handleUpdate={handleUpdate}
        handleStatusChange={handleStatusChange}
        handleDeleteClick={handleDeleteClick}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        fetching={fetching}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Student"
        message={`Are you sure you want to delete "${selectedStudent?.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
};

export default StudentsPage;
