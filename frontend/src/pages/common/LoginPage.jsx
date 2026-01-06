import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Paper,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { tokens } from "../../theme";
import { Formik, Form } from "formik";
import loginValidationSchema from "../../validation/loginValidation";


/**
 * Allwos users to login
 *
 * @component
 * @returns {JSX.Element} Login Form
 */
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Throttling State (3 attempts max)
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;
  const LOCK_DURATION = 5 * 60 * 1000; // 5 min lock
  const [lockTime, setLockTime] = useState(null);

  const handleSubmit = async (values) => {
    if (lockTime && Date.now() - lockTime < LOCK_DURATION) {
      setError("Too many failed attempts. Try again later.");
      return;
    }

    try {
      setLoading(true);
      await login(values.email, values.password);
      setAttempts(0);
      navigate("/");
    } catch (err) {
      console.error(err);
      setAttempts((prev) => prev + 1);
      if (attempts + 1 >= MAX_ATTEMPTS) {
        setLockTime(Date.now());
        setError("Account temporarily locked due to too many failed attempts.");
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.primary[400],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            backgroundColor: colors.grey[100],
            borderRadius: "15px",
            boxShadow: `0px 4px 12px ${colors.grey[400]}`,
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            color={colors.blueAccent[800]}
            sx={{ fontWeight: "bold" }}
          >
            Login
          </Typography>

          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, handleChange, handleBlur, values }) => (
              <Form>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  variant="filled"
                  InputProps={{
                    style: {
                      color: colors.grey[900],
                      backgroundColor: colors.grey[200],
                      borderRadius: 6,
                    },
                  }}
                  InputLabelProps={{
                    style: { color: colors.grey[700] },
                  }}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  variant="filled"
                  InputProps={{
                    style: {
                      color: colors.grey[900],
                      backgroundColor: colors.grey[200],
                      borderRadius: 6,
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    style: { color: colors.grey[700] },
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    marginTop: 2,
                    fontWeight: "bold",
                    py: 1.2,
                    backgroundColor: colors.blueAccent[700],
                    "&:hover": {
                      backgroundColor: colors.blueAccent[800],
                    },
                  }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress /> : "Login"}
                </Button>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </Box>
  );
}
