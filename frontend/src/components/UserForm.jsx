import {
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const UserForm = ({
  colors,
  formik,
  formTitle,
  showPassword,
  setShowPassword,
  showConfirm,
  setShowConfirm,
  loading,
  buttonTitle,
  loadingMessage,
}) => {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 4,
        border: 2,
        borderColor: colors.primary[500],
        backgroundColor: colors.primary[400],
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
            backgroundColor: colors.greenAccent[500],
            mt: 1,
            borderRadius: "2px",
          },
        }}
      >
        {formTitle}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {[
            { name: "name", label: "Name" },
            { name: "email", label: "Email", type: "email" },
            { name: "cnic", label: "CNIC" },
            { name: "phone", label: "Phone" },
          ].map((field) => (
            <Grid
              size={{ xs: 12, sm: 12, md: 4, lg: 6, xl: 6 }}
              key={field.name}
            >
              <TextField
                variant="filled"
                fullWidth
                label={field.label}
                name={field.name}
                type={field.type || "text"}
                value={formik.values[field.name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched[field.name] &&
                  Boolean(formik.errors[field.name])
                }
                helperText={
                  formik.touched[field.name] && formik.errors[field.name]
                }
                sx={{ borderColor: colors.redAccent[500] }}
              />
            </Grid>
          ))}

          <Grid size={{ xs: 12, sm: 12, md: 2, lg: 2, xl: 2 }}>
            <TextField
              variant="filled"
              select
              label="Status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 2, lg: 2, xl: 2 }}>
            <TextField
              variant="filled"
              select
              label="Gender"
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
            <TextField
              variant="filled"
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
            <TextField
              variant="filled"
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm(!showConfirm)}
                      edge="end"
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? loadingMessage : buttonTitle}
        </Button>
      </form>
    </Paper>
  );
};

export default UserForm;
