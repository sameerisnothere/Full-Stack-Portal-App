import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  useTheme,
  Paper,
  Typography,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Formik } from "formik";
import selfUpdateSchema from "../../validation/selfUpdate";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";

const ProfileUpdate = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, token, setUser } = useAuth();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch user profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const res = await api.get(
          `/read/api/get-data?tableName=${user.type}&id=${user.id}`,
          { headers }
        );

        const data = res.data.data[0];
        setCurrentUser(data || null);
        setInitialValues({
          name: data.name || "",
          email: data.email || "",
          cnic: data.cnic || "",
          phone: data.phone || "",
          gender: data.gender || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error("Profile fetch error:", error);
        setMessage({
          type: "error",
          text: "Failed to load profile data",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user, token]);

  // Handle form submit
  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setMessage(null);
      const headers = {
        "x-user": JSON.stringify(user),
        Authorization: `Bearer ${token}`,
      };

      const payload = {
        type: user.type,
        data: {
          name: values.name,
          phone: values.phone,
        },
      };

      if (values.currentPassword && values.newPassword) {
        payload.data.newPassword = values.newPassword;
        payload.data.currentPassword = values.currentPassword;
      }

      await api.put(`/update/api/update-one/${user.id}`, payload, { headers });

      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const res = await api.get(
          `/read/api/get-data?tableName=${user.type}&id=${user.id}`,
          { headers }
        );

        const data = res.data.data[0];
        setCurrentUser(data || null);
        setInitialValues({
          name: data.name || "",
          email: data.email || "",
          cnic: data.cnic || "",
          phone: data.phone || "",
          gender: data.gender || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        const updatedUser = {
          ...user,
          name: data.name,
          phone: data.phone,
        };

        setUser(updatedUser);
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Profile fetch error:", error);
        setMessage({
          type: "error",
          text: "Failed to load profile data",
        });
      } finally {
        setLoading(false);
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      resetForm({
        values: {
          ...values,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        },
      });
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
      setSubmitting(false);
    }
  };

  if (!currentUser)
    return <Box sx={{ color: colors.grey[100], p: 3 }}>User not found.</Box>;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="70vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ m: { xs: 1, sm: 2 } }}>
      <BreadcrumbsNav
        items={[{ label: "Home", to: "/" }, { label: "Profile" }]}
      />
      <Header title="PROFILE" subtitle="Update your details" />

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Paper
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: colors.primary[400],
          border: 2,
          borderColor: colors.primary[500],
          borderRadius: "15px",
          boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: colors.grey[100],
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            position: "relative",
            "&::after": {
              content: '""',
              display: "block",
              width: "40px",
              height: "3px",
              backgroundColor: colors.blueAccent[500],
              mt: 1,
              borderRadius: "2px",
            },
          }}
        >
          Your Information
        </Typography>

        <Grid container spacing={2}>
          {[
            { label: "Name", value: currentUser.name },
            { label: "Email", value: currentUser.email },
            { label: "CNIC", value: currentUser.cnic },
            { label: "Phone", value: currentUser.phone },
            { label: "Gender", value: currentUser.gender },
          ].map((field) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}
              key={field.label}
            >
              <Typography variant="subtitle2" sx={{ color: colors.grey[300] }}>
                {field.label}
              </Typography>
              <Typography variant="body1" sx={{ color: colors.grey[100] }}>
                {field.value || "-"}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        enableReinitialize
        validationSchema={selfUpdateSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <Paper
              sx={{
                p: 3,
                mb: 4,
                backgroundColor: colors.primary[400],
                borderRadius: "15px",
                boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
                border: 2,
                borderColor: colors.primary[500],
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  color: colors.grey[100],
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    display: "block",
                    width: "40px",
                    height: "3px",
                    backgroundColor: colors.blueAccent[500],
                    mt: 1,
                    borderRadius: "2px",
                  },
                }}
              >
                Update Profile
              </Typography>

              {/* GRID V5 LAYOUT */}
              <Grid container spacing={2}>
                {/* Name */}
                <Grid size={{ xs: 12, sm: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Full Name"
                    name="name"
                    value={values.name}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    InputProps={{ sx: { color: colors.grey[100] } }}
                    InputLabelProps={{ sx: { color: colors.grey[300] } }}
                  />
                </Grid>

                {/* Email */}
                <Grid size={{ xs: 12, sm: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Email"
                    value={values.email}
                    name="email"
                    InputProps={{
                      readOnly: true,
                      sx: { color: colors.grey[400] },
                    }}
                    InputLabelProps={{ sx: { color: colors.grey[500] } }}
                  />
                </Grid>

                {/* CNIC */}
                <Grid size={{ xs: 12, sm: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="CNIC"
                    value={values.cnic}
                    name="cnic"
                    InputProps={{
                      readOnly: true,
                      sx: { color: colors.grey[400] },
                    }}
                    InputLabelProps={{ sx: { color: colors.grey[500] } }}
                  />
                </Grid>

                {/* Phone */}
                <Grid size={{ xs: 12, sm: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Phone"
                    name="phone"
                    value={values.phone}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                    InputProps={{ sx: { color: colors.grey[100] } }}
                    InputLabelProps={{ sx: { color: colors.grey[300] } }}
                  />
                </Grid>

                {/* Gender */}
                <Grid size={{ xs: 12, sm: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Gender"
                    value={values.gender}
                    name="gender"
                    InputProps={{
                      readOnly: true,
                      sx: { color: colors.grey[400] },
                    }}
                    InputLabelProps={{ sx: { color: colors.grey[500] } }}
                  />
                </Grid>

                {/* Current Password */}
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    type={showCurrent ? "text" : "password"}
                    label="Current Password"
                    name="currentPassword"
                    value={values.currentPassword}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={touched.currentPassword && !!errors.currentPassword}
                    helperText={
                      touched.currentPassword && errors.currentPassword
                    }
                    InputProps={{
                      sx: { color: colors.grey[100] },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrent(!showCurrent)}
                          >
                            {showCurrent ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ sx: { color: colors.grey[300] } }}
                  />
                </Grid>

                {/* New Password */}
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    type={showNew ? "text" : "password"}
                    label="New Password"
                    name="newPassword"
                    value={values.newPassword}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={touched.newPassword && !!errors.newPassword}
                    helperText={touched.newPassword && errors.newPassword}
                    InputProps={{
                      sx: { color: colors.grey[100] },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNew(!showNew)}>
                            {showNew ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ sx: { color: colors.grey[300] } }}
                  />
                </Grid>

                {/* Confirm Password */}
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    type={showConfirm ? "text" : "password"}
                    label="Confirm Password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={touched.confirmPassword && !!errors.confirmPassword}
                    helperText={
                      touched.confirmPassword && errors.confirmPassword
                    }
                    InputProps={{
                      sx: { color: colors.grey[100] },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirm(!showConfirm)}
                          >
                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ sx: { color: colors.grey[300] } }}
                  />
                </Grid>
              </Grid>
              <Box display="flex" justifyContent="flex-start" mt={2}>
                {loading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="70vh"
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update Profile"}
                  </Button>
                )}
              </Box>
            </Paper>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default ProfileUpdate;
