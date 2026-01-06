import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";

import LoadingScreen from "./components/Fallback";
const LoginPage = lazy(() => import("./pages/common/LoginPage"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const PublicRoute = lazy(() => import("./components/PublicRoute"));
const StudentCourses = lazy(() => import("./pages/student/StudentCourses"));
const ProfileUpdate = lazy(() => import("./pages/common/Profile"));
const StudentsTable = lazy(() => import("./pages/admin/StudentsTable"));
const TeachersTable = lazy(() => import("./pages/admin/TeachersTable"));
const CoursesTable = lazy(() => import("./pages/admin/CoursesTable"));
const TeacherCourses = lazy(() => import("./pages/teacher/TeacherCourses"));
const CourseStudents = lazy(() => import("./pages/teacher/CourseStudents"));
const UpdateCourse = lazy(() => import("./pages/admin/UpdateCourse"));
const UpdateTeacher = lazy(() => import("./pages/admin/UpdateTeacher"));
const UpdateStudent = lazy(() => import("./pages/admin/UpdateStudent"));
const TeacherDetailPage = lazy(() => import("./pages/admin/TeacherDetailPage"));
const StudentDetailPage = lazy(() => import("./pages/admin/StudentDetailPage"));
const CourseDetailPage = lazy(() => import("./pages/admin/CourseDetailPage"));
const DashboardRedirect = lazy(() =>
  import("./pages/common/DashboardRedirect")
);

function App() {
  const [theme, colorMode] = useMode();

  return (
    <AuthProvider>
      <BrowserRouter>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />

            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>

                {/* Student routes */}
                <Route element={<ProtectedRoute allowedTypes={["student"]} />}>
                  <Route path="/courses" element={<StudentCourses />} />
                </Route>

                {/* Teacher routes */}
                <Route element={<ProtectedRoute allowedTypes={["teacher"]} />}>
                  <Route path="/teacher/courses" element={<TeacherCourses />} />
                  <Route
                    path="/teacher/course/:courseId"
                    element={<CourseStudents />}
                  />
                </Route>

                {/* Admin routes */}
                <Route element={<ProtectedRoute allowedTypes={["admin"]} />}>
                  <Route path="/students" element={<StudentsTable />} />
                  <Route path="/student/:id" element={<StudentDetailPage />} />
                  <Route path="/teachers" element={<TeachersTable />} />
                  <Route path="/teacher/:id" element={<TeacherDetailPage />} />
                  <Route path="/course-list" element={<CoursesTable />} />
                  <Route path="/course/:id" element={<CourseDetailPage />} />
                  <Route
                    path="/update-student/:id"
                    element={<UpdateStudent />}
                  />
                  <Route
                    path="/update-teacher/:id"
                    element={<UpdateTeacher />}
                  />
                  <Route
                    path="/courses/update/:id"
                    element={<UpdateCourse />}
                  />
                </Route>

                {/* Shared routes */}
                <Route
                  element={
                    <ProtectedRoute
                      allowedTypes={["admin", "teacher", "student"]}
                    />
                  }
                >
                  <Route path="/profile" element={<ProfileUpdate />} />
                  <Route path="/" element={<DashboardRedirect />} />
                </Route>
              </Routes>
            </Suspense>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
