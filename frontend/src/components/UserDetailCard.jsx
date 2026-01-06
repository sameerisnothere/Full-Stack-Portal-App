import { Paper, Typography, Grid } from "@mui/material";

const UserDetailCard = ({ user, colors }) => {
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
        Information
      </Typography>

      <Grid container spacing={2}>
        {[
          { label: "Name", value: user.name },
          { label: "Email", value: user.email },
          { label: "CNIC", value: user.cnic },
          { label: "Phone", value: user.phone },
          { label: "Gender", value: user.gender },
          { label: "Status", value: user.status },
          { label: "Deleted", value: user.isDeleted ? "Yes" : "No" },
        ].map((field) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }} key={field.label}>
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
  );
};

export default UserDetailCard;
