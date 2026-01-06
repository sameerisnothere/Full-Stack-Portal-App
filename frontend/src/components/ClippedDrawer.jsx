import * as React from "react";
import {
  Box,
  Drawer,
  AppBar,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Person from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import Face4Icon from "@mui/icons-material/Face4";
import Face6Icon from "@mui/icons-material/Face6";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";

const expandedWidth = 240;
const collapsedWidth = 80;

/**
 * Sidebar component with collapsible drawer, dynamic menu, and profile menu.
 *
 * Features:
 * - Collapsible drawer with dynamic width.
 * - AppBar showing portal title based on user type.
 * - Dynamic menu items based on user role (student, teacher, admin).
 * - Profile dropdown with logout functionality.
 * - Main content area rendered beside the drawer.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to render in the main section.
 *
 * @returns {JSX.Element} Sidebar layout with navigation and main content.
 */
export default function Sidebar({ children }) {
  const { user, logout } = useAuth(); // Auth context for user info and logout
  const theme = useTheme(); // MUI theme
  const colors = tokens(theme.palette.mode); // Custom theme tokens

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  React.useEffect(() => {
    if (isSmallScreen) {
      setIsCollapsed(true);
    }
  }, [isSmallScreen]);

  const getUserIcon = (gender) => {
    if (gender === "male") return <Face4Icon />;
    if (gender === "female") return <Face6Icon />;
    return <AccountCircleIcon />; // fallback
  };

  /**
   * Dynamic portal title based on user type.
   */
  const portalTitle = React.useMemo(() => {
    if (!user) return "Portal";
    switch (user.type) {
      case "student":
        return "Student Portal";
      case "teacher":
        return "Teacher Portal";
      case "admin":
        return "Admin Portal";
      default:
        return "Portal";
    }
  }, [user]);

  /**
   * Dynamic menu items based on user type.
   */
  const menuItems = React.useMemo(() => {
    const base = [{ text: "Dashboard", icon: <HomeIcon />, path: "/" }];
    if (!user) return base;

    switch (user.type) {
      case "student":
        return [
          ...base,
          { text: "Courses", icon: <SchoolIcon />, path: "/courses" },
          { text: "Profile", icon: <Person />, path: "/profile" },
        ];
      case "teacher":
        return [
          ...base,
          {
            text: "Your Courses",
            icon: <AssignmentIcon />,
            path: "/teacher/courses",
          },
          { text: "Profile", icon: <Person />, path: "/profile" },
        ];
      case "admin":
        return [
          ...base,
          { text: "Students", icon: <PeopleIcon />, path: "/students" },
          { text: "Teachers", icon: <SchoolIcon />, path: "/teachers" },
          { text: "Courses", icon: <LibraryBooksIcon />, path: "/course-list" },
          { text: "Profile", icon: <Person />, path: "/profile" },
        ];
      default:
        return base;
    }
  }, [user]);

  // Profile dropdown menu state
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  /**
   * Handles user logout and closes profile menu.
   */
  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* APP BAR */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: colors.primary[500],
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: "none",
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Toggle button + Portal title */}
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={toggleSidebar}
              disabled={isSmallScreen}
              sx={{ color: colors.grey[100] }}
            >
              {isCollapsed ? <ChevronLeftOutlinedIcon /> : <MenuOutlinedIcon />}
            </IconButton>

            {!isCollapsed && (
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: ".2rem",
                  background: "linear-gradient(90deg, #868dfb, #4cceac)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textDecoration: "none",
                }}
              >
                {portalTitle}
              </Typography>
            )}
          </Box>

          {/* Profile button + dropdown menu */}
          {user && (
            <Box>
              <Button
                color="inherit"
                onClick={handleMenu}
                startIcon={getUserIcon(user?.gender)}
                sx={{ textTransform: "none", color: colors.grey[100] }}
              >
                {!isCollapsed && user.name}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                PaperProps={{
                  sx: {
                    backgroundColor: colors.primary[500],
                    color: colors.grey[100],
                    borderRadius: 2,
                    mt: 1,
                    "& .MuiMenuItem-root": {
                      "&:hover": {
                        backgroundColor: colors.redAccent[800],
                      },
                    },
                  },
                }}
              >
                {/* Profile details */}
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1">{user.name}</Typography>
                  <Typography variant="body2" color={colors.grey[200]}>
                    {user.email}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: "capitalize",
                      color:
                        user.type === "student"
                          ? colors.greenAccent[200]
                          : user.type === "admin"
                          ? colors.redAccent[200]
                          : colors.blueAccent[200],
                    }}
                  >
                    Type: {user.type}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: colors.grey[300] }} />

                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    mx: 2,
                    mt: 1,
                    backgroundColor: colors.redAccent[600],
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: colors.redAccent[400], // lighter shade on hover
                    },
                  }}
                  onClick={handleLogout}
                >
                  <LogoutOutlinedIcon sx={{ mr: 1 }} />
                  logout
                </Button>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Drawer
        variant="permanent"
        sx={{
          width: isCollapsed ? collapsedWidth : expandedWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isCollapsed ? collapsedWidth : expandedWidth,
            backgroundColor: colors.primary[400],
            color: colors.grey[100],
            boxSizing: "border-box",
            border: "none",
            transition: "width 0.3s ease",
            overflowX: "hidden",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          {/* User info panel */}
          {!isCollapsed && (
            <Paper
              elevation={12}
              sx={{
                p: 2,
                my: 1,
                mx: 3,
                backgroundColor: colors.primary[400],
                borderRadius: "10px",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, color: colors.grey[100] }}>
                {user.name}
              </Typography>
              <Typography variant="h7" sx={{ mb: 1, color: colors.grey[200] }}>
                {user.email}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  color:
                    user.type === "student"
                      ? colors.greenAccent[300]
                      : user.type === "admin"
                      ? colors.redAccent[300]
                      : colors.blueAccent[300],
                }}
              >
                {user.type}
              </Typography>
            </Paper>
          )}
          {/* Menu items */}
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <Tooltip
                  title={isCollapsed ? item.text : ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      color: colors.grey[100],
                      "&:hover": {
                        color: colors.greenAccent[400],
                        backgroundColor: colors.primary[500],
                      },
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      px: isCollapsed ? 2 : 3,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: colors.grey[100],
                        minWidth: isCollapsed ? "auto" : "40px",
                        mr: isCollapsed ? 0 : 1,
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary={item.text} />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* MAIN CONTENT AREA */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: colors.grey[100],
          minHeight: "100vh",
          transition: "margin 0.3s ease",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
