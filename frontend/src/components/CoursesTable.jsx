import {
  Paper,
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  IconButton,
  Tooltip,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { Edit, Delete, Search, Visibility } from "@mui/icons-material";

const CoursesTable = ({
  colors,
  searchTerm,
  setSearchTerm,
  filteredCourses,
  page,
  rowsPerPage,
  loading,
  navigate,
  handleDeleteClick,
  handleChangePage,
  handleChangeRowsPerPage,
}) => {
  // Trigger responsive view at 1000px
  const isMobile = useMediaQuery("(max-width:1000px)");

  // Helper for consistent cell styling in mobile card view
  const cellStyle = (label, isAction = false) => ({
    display: isMobile ? "flex" : "table-cell",
    flexDirection: "column",
    alignItems: isMobile ? "flex-start" : "inherit", // Add this line
    borderBottom: isMobile ? "none" : "inherit",
    padding: isMobile ? "10px 15px" : "16px",
    gridColumn: isMobile && isAction ? "span 2" : "auto",
    "&::before": {
      content: isMobile ? `"${label}"` : "none",
      fontWeight: "bold",
      fontSize: "0.75rem",
      color: colors.redAccent[500], // Using your redAccent for headers in mobile
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
              backgroundColor: colors.redAccent[500],
              mt: 1,
              borderRadius: "2px",
            },
          }}
        >
          All Courses
        </Typography>
        <TextField
          size="small"
          placeholder="Search by course name or teacher"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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

      <TableContainer sx={{ borderRadius: "10px 10px 0 0" }}>
        <Table sx={{ display: isMobile ? "block" : "table" }}>
          <TableHead
            sx={{
              backgroundColor: colors.blueAccent[700],
              display: isMobile ? "none" : "table-header-group",
            }}
          >
            <TableRow>
              {[
                "ID",
                "Course Name",
                "Credit Hours",
                "Teacher",
                "Deleted?",
                "Actions",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{ color: colors.grey[100], fontWeight: "bold" }}
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
              gap: isMobile ? "20px" : "0",
            }}
          >
            {filteredCourses.length === 0 ? (
              <TableRow sx={{ display: isMobile ? "block" : "table-row" }}>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ display: isMobile ? "block" : "table-cell" }}
                >
                  No matching courses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((course) => (
                  <TableRow
                    key={course.id}
                    hover
                    sx={{
                      display: isMobile ? "grid" : "table-row",
                      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "none",
                      backgroundColor: isMobile
                        ? colors.primary[500]
                        : "inherit",
                      border: isMobile
                        ? `1px solid ${colors.grey[700]}`
                        : "none",
                      borderRadius: isMobile ? "8px" : "0",
                      mb: isMobile ? 1 : 0,
                      "&:hover": { backgroundColor: colors.primary[300] },
                    }}
                  >
                    <TableCell sx={cellStyle("ID")}>{course.id}</TableCell>
                    <TableCell sx={cellStyle("Course Name")}>
                      {course.name}
                    </TableCell>
                    <TableCell sx={cellStyle("Credit Hours")}>
                      {course.credit_hours}
                    </TableCell>
                    <TableCell sx={cellStyle("Teacher")}>
                      {course.teacherName}
                    </TableCell>
                    <TableCell sx={cellStyle("Deleted?")}>
                      <Chip
                        size="small"
                        label={
                          course.isDeleted === 1 || course.isDeleted === true
                            ? "Deleted"
                            : "Not Deleted"
                        }
                        color={
                          course.isDeleted === 1 || course.isDeleted === true
                            ? "error"
                            : "success"
                        }
                      />
                    </TableCell>
                    <TableCell sx={cellStyle("Actions", true)}>
                      <Box display="flex">
                        <Tooltip title="View Course">
                          <IconButton
                            color="info"
                            onClick={() => navigate(`/course/${course.id}`)}
                            disabled={loading}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update">
                          <IconButton
                            color="secondary"
                            onClick={() =>
                              navigate(`/courses/update/${course.id}`)
                            }
                            disabled={loading}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(course)}
                            disabled={loading}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredCourses.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          backgroundColor: colors.primary[400],
          color: colors.grey[100],
          borderRadius: "0 0 10px 10px",
        }}
      />
    </Paper>
  );
};

export default CoursesTable;
