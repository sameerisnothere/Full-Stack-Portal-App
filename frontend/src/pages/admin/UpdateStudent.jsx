import React, { useState, useEffect } from "react";
import {
  Box,
  Alert,
  useTheme,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { tokens } from "../../theme";
import api from "../../api/axiosInstance";
import Header from "../../components/Header";
import { useFormik } from "formik";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import userUpdateValidationSchema from "../../validation/UpdateUser";
import UserForm from "../../components/UserForm";

/**
 * Update student component
 *
 * @component
 * @returns {JSX.Element} update student form with current values filled in
 */
const UpdateStudent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // === Fetch Student details ===
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await api.get(
          `/read/api/get-data?tableName=student&id=${id}`,
          { headers }
        );

        const t = res.data?.data?.[0];


        setIsDeleted(t.isDeleted === 1 || t.isDeleted === true);
        if (t) {
          formik.setValues({
            name: t.name || "",
            email: t.email || "",
            cnic: t.cnic || "",
            phone: t.phone || "",
            gender: t.gender || "",
            status: t.status || "active",
            password: "",
            confirmPassword: "",
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setMessage({
          type: "error",
          text:
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to load Student details",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  // === Formik Setup ===
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      cnic: "",
      phone: "",
      gender: "",
      status: "active",
      password: "",
      confirmPassword: "",
    },
    validationSchema: userUpdateValidationSchema,
    onSubmit: async (values) => {
      setMessage(null);

      // Prevent status change if student is deleted
      if (isDeleted && values.status !== "inactive") {
        setMessage({
          type: "error",
          text: "Cannot change status of a deleted student.",
        });
        return;
      }

      try {
        setLoading(true);
        const headers = {
          Authorization: `Bearer ${token}`,
          "x-user": JSON.stringify(user),
        };

        const payload = {
          type: "student",
          data: {
            name: values.name,
            email: values.email,
            cnic: values.cnic,
            phone: values.phone,
            gender: values.gender,
            status: values.status,
          },
        };

        if (values.password) payload.data.newPassword = values.password;

        const res = await api.put(`/update/api/update-one/${id}`, payload, {
          headers,
        });

        setMessage({
          type: "success",
          text: res.data.message || "Student updated successfully!",
        });

        setTimeout(() => navigate("/students"), 1500);
      } catch (error) {
        console.error("Update error:", error);
        setMessage({
          type: "error",
          text:
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Update failed",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box sx={{ m: { xs: 1, sm: 2 } }}>
      <BreadcrumbsNav
        items={[
          { label: "Home", to: "/" },
          { label: "Students", to: "/students" },
          { label: "Update Student" },
        ]}
      />
      <Header title="UPDATE STUDENT" subtitle="Modify student details" />

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <UserForm
        colors={colors}
        formik={formik}
        formTitle="Update Student"
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirm={showConfirm}
        setShowConfirm={setShowConfirm}
        loading={loading}
        buttonTitle="Update Student"
        loadingMessage="Updating..."
      />
    </Box>
  );
};

export default UpdateStudent;
