import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ClippedDrawer from "./ClippedDrawer";

/**
 * ProtectedRoute component to restrict access to routes based on user authentication and role.
 *
 * Wraps child routes with a layout (ClippedDrawer) and ensures that only allowed user types can access.
 *
 * @param {Object} props
 * @param {string[]} [props.allowedTypes] - Array of user types allowed to access this route (e.g., ['admin', 'teacher']).
 *
 * @returns {JSX.Element} Either:
 *  - A loading indicator while auth state is loading,
 *  - A redirect to /login if unauthenticated,
 *  - A redirect to / if user is unauthorized,
 *  - Or the child routes wrapped in ClippedDrawer layout if access is allowed.
 */
export default function ProtectedRoute({ allowedTypes }) {
  const { user, loading } = useAuth(); // Get auth state from context

  // Show loading while auth state is being determined
  if (loading) return <div>Loading...</div>;

  // Redirect to login if user is not authenticated
  if (!user) return <Navigate to="/login" replace />;

  // Redirect to home page if user's type is not allowed
  if (allowedTypes && !allowedTypes.includes(user.type)) {
    return <Navigate to="/" replace />; // unauthorized
  }

  // Authorized: render child routes within the ClippedDrawer layout
  return (
    <ClippedDrawer>
      <Outlet />
    </ClippedDrawer>
  );
}
