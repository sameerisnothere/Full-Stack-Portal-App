import {
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  useMediaQuery, // Added for breakpoint detection
} from "@mui/material";
import { Search } from "@mui/icons-material";

const CourseStudentsTable = ({
  colors,
  search,
  setSearch,
  course,
  filteredStudents,
}) => {
  // Trigger responsive layout at 1000px
  const isMobile = useMediaQuery("(max-width:1000px)");

  // Helper to maintain original cell styles while adding mobile grid labels
  const cellStyle = (label) => ({
    display: isMobile ? "flex" : "table-cell",
    flexDirection: "column",
    borderBottom: isMobile ? "none" : "inherit",
    padding: isMobile ? "10px 15px" : "16px",
    "&::before": {
      content: isMobile ? `"${label}"` : "none",
      fontWeight: "bold",
      fontSize: "0.75rem",
      color: colors.greenAccent[500],
      textTransform: "uppercase",
      marginBottom: "4px",
    },
  });

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        backgroundColor: colors.primary[400],
        p: 3,
        mt: 3,
        border: 2,
        borderColor: colors.primary[500],
        borderRadius: "15px",
        boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
      }}
    >
      {/* Search Header */}
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "flex-start" : "center"}
        mb={2}
        gap={2}
      >
        <Typography
          variant="h5"
          sx={{
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
          Enrolled Students
        </Typography>

        <TextField
          size="small"
          placeholder="Search by name, email, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: colors.primary[500],
            borderRadius: "8px",
            width: isMobile ? "100%" : "300px",
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer sx={{ borderRadius: "10px" }}>
        <Table sx={{ display: isMobile ? "block" : "table" }}>
          <TableHead
            sx={{
              backgroundColor: colors.blueAccent[700],
              display: isMobile ? "none" : "table-header-group",
            }}
          >
            <TableRow>
              {["Name", "Email", "Gender", "Status"].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    color: colors.grey[100],
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody
            sx={{
              display: isMobile ? "grid" : "table-row-group",
              gridTemplateColumns: isMobile ? "1fr" : "none",
              gap: isMobile ? "15px" : "0",
            }}
          >
            {course && course.isDeleted ? (
              <TableRow sx={{ display: isMobile ? "block" : "table-row" }}>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{
                    color: colors.redAccent[500],
                    display: isMobile ? "block" : "table-cell",
                  }}
                >
                  Course is DELETED
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow sx={{ display: isMobile ? "block" : "table-row" }}>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ display: isMobile ? "block" : "table-cell" }}
                >
                  No matching students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((s) => (
                <TableRow
                  key={s.id}
                  hover
                  sx={{
                    display: isMobile ? "grid" : "table-row",
                    gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "none",
                    backgroundColor: isMobile ? colors.primary[500] : "inherit",
                    border: isMobile ? `1px solid ${colors.grey[700]}` : "none",
                    borderRadius: isMobile ? "8px" : "0",
                    mb: isMobile ? 1 : 0,
                    "&:hover": { backgroundColor: colors.primary[300] },
                  }}
                >
                  <TableCell sx={cellStyle("Name")}>{s.name}</TableCell>
                  <TableCell sx={cellStyle("Email")}>{s.email}</TableCell>
                  <TableCell sx={cellStyle("Gender")}>{s.gender}</TableCell>
                  <TableCell sx={cellStyle("Status")}>{s.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CourseStudentsTable;
