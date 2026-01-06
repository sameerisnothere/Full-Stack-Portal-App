import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

/**
 * AuthContext provides authentication state and actions for the application.
 */
const AuthContext = createContext();

/**
 * AuthProvider component to wrap the app and provide authentication context.
 *
 * Features:
 * - Login and logout actions.
 * - Session management with automatic expiry.
 * - Fetching current user info from the backend.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components wrapped by the provider.
 *
 * @returns {JSX.Element} Auth context provider.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(); // Current logged-in user
  const [token, setToken] = useState(() => sessionStorage.getItem("token")); // Auth token
  const [loading, setLoading] = useState(false); // Loading state for user fetch

  // Store login timestamp to track session expiry
  const [loginTime, setLoginTime] = useState(() => {
    const savedTime = sessionStorage.getItem("loginTime");
    return savedTime ? parseInt(savedTime, 10) : null;
  });

  const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  /**
   * Logs in the user.
   *
   * @param {string} email - User email.
   * @param {string} password - User password.
   */
  const login = async (email, password) => {
    const payload = { email, password };

    // Normal login request
    const response = await api.post("/auth/api/login", { payload });
    const { token, user } = response.data;

    const currentTime = Date.now();

    // Set state and persist to sessionStorage
    setUser(user);
    setToken(token);
    setLoginTime(currentTime);

    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("loginTime", currentTime.toString());
  };

  /**
   * Logs out the user.
   * Clears state and sessionStorage.
   */
  const logout = async () => {
    try {
      await api.post("/auth/api/logout");
      setUser(null);
      setToken(null);
      setLoginTime(null);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("loginTime");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /**
   * Fetches the current user from the backend if token exists.
   */
  const fetchUser = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await api.get("/auth/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect to automatically log out the user when session expires.
   */
  useEffect(() => {
    if (loginTime && Date.now() - loginTime >= SESSION_DURATION) {
      console.warn("Session expired, logging out...");
      logout();
    }

    const interval = setInterval(() => {
      if (loginTime && Date.now() - loginTime >= SESSION_DURATION) {
        console.warn("Session expired, logging out...");
        logout();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [loginTime]);

  /**
   * Effect to fetch user if token exists but user state is not loaded.
   */
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, fetchUser, loading, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access AuthContext.
 *
 * @returns {Object} { user, token, login, logout, fetchUser, loading, setUser }
 */
export const useAuth = () => useContext(AuthContext);
