import {
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Button,
} from "@mui/material";

const CourseForm = ({
  colors,
  formik,
  creditOptions,
  fetchingTeachers,
  teachers,
  loading,
  buttonTitle,
  formTitle,
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
            backgroundColor: colors.redAccent[500],
            mt: 1,
            borderRadius: "2px",
          },
        }}
      >
        {formTitle}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
            <TextField
              variant="filled"
              label="Course Name"
              name="courseName"
              value={formik.values.courseName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={
                formik.touched.courseName && Boolean(formik.errors.courseName)
              }
              helperText={formik.touched.courseName && formik.errors.courseName}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 3, lg: 3, xl: 3 }}>
            <TextField
              variant="filled"
              select
              label="Credit Hours"
              name="creditHours"
              value={formik.values.creditHours}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={
                formik.touched.creditHours && Boolean(formik.errors.creditHours)
              }
              helperText={
                formik.touched.creditHours && formik.errors.creditHours
              }
            >
              {creditOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
            {fetchingTeachers ? (
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress size={28} />
              </Box>
            ) : (
              <TextField
                variant="filled"
                select
                label="Teacher"
                name="teacherId"
                value={formik.values.teacherId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                error={
                  formik.touched.teacherId && Boolean(formik.errors.teacherId)
                }
                helperText={formik.touched.teacherId && formik.errors.teacherId}
              >
                {teachers.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {buttonTitle}
        </Button>
      </form>
    </Paper>
  );
};

export default CourseForm;
