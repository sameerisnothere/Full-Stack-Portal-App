// src/pages/DashboardRedirect.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminDashboard from "../admin/AdminDashboard";
import StudentDashboard from "../student/StudentDashboard";
import TeacherDashboard from "../teacher/TeachersDashboard";

export default function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  switch (user.type) {
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}
