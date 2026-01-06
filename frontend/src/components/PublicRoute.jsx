import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PublicRoute component restricts access to public pages for authenticated users.
 *
 * - Shows a loading indicator while authentication state is being determined.
 * - Redirects authenticated users away from public routes (like /login) to the home page.
 * - Renders child routes for unauthenticated users.
 *
 * @returns {JSX.Element} Either:
 *  - A loading indicator while auth state is loading,
 *  - A redirect to "/" if user is authenticated,
 *  - Or the child routes via <Outlet /> if unauthenticated.
 */
export default function PublicRoute() {
  const { user, loading } = useAuth(); // Get auth state from context

  // Show loading while auth state is being determined
  if (loading) return <div>Loading...</div>;

  // Redirect logged-in users to home page to prevent access to public routes
  if (user) return <Navigate to="/" replace />;

  // Allow unauthenticated users to access public routes
  return <Outlet />;
}
