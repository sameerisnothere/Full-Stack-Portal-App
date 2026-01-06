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
  Button,
  useMediaQuery, // Added for the 1000px breakpoint
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const TeachersCoursesTable = ({
  colors,
  search,
  setSearch,
  filteredCourses,
  isTeacher,
}) => {
  const navigate = useNavigate();

  // Custom breakpoint for responsiveness
  const isMobile = useMediaQuery("(max-width:1000px)");

  /**
   * Helper function to maintain consistent cell styling between
   * table view and responsive grid view.
   */
  const cellStyle = (label, isAction = false) => ({
    display: isMobile ? "flex" : "table-cell",
    flexDirection: "column",
    alignItems: isMobile ? "flex-start" : "inherit",
    justifyContent: isMobile ? "center" : "inherit",
    borderBottom: isMobile ? "none" : "inherit",
    padding: isMobile ? "10px 15px" : "16px",
    gridColumn: isMobile && isAction ? "span 2" : "auto", // Actions take full width in card
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
        p: { xs: 2, md: 3 },
        mt: 3,
        border: 2,
        borderColor: colors.primary[500],
        borderRadius: "15px",
        boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
      }}
    >
      {/* Header and Search Section */}
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
          Courses
        </Typography>

        <TextField
          size="small"
          placeholder="Search courses..."
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

      <TableContainer sx={{ borderRadius: "10px 10px 0 0" }}>
        <Table sx={{ display: isMobile ? "block" : "table" }}>
          {/* Hide Table Header on Mobile */}
          <TableHead
            sx={{
              backgroundColor: colors.blueAccent[700],
              display: isMobile ? "none" : "table-header-group",
            }}
          >
            <TableRow>
              <TableCell sx={{ color: colors.grey[100], fontWeight: "bold" }}>
                Course ID
              </TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: "bold" }}>
                Course Name
              </TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: "bold" }}>
                Credit Hours
              </TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: "bold" }}>
                No. of Students
              </TableCell>
              {isTeacher && (
                <TableCell sx={{ color: colors.grey[100], fontWeight: "bold" }}>
                  Actions
                </TableCell>
              )}
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
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No matching courses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <TableRow
                  key={course.id}
                  hover
                  sx={{
                    display: isMobile ? "grid" : "table-row",
                    gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "none",
                    backgroundColor: isMobile ? colors.primary[500] : "inherit",
                    border: isMobile ? `1px solid ${colors.grey[700]}` : "none",
                    borderRadius: isMobile ? "8px" : "0",
                    p: isMobile ? 1 : 0,
                    overflow: "hidden",
                  }}
                >
                  <TableCell sx={cellStyle("Course ID")}>{course.id}</TableCell>
                  <TableCell sx={cellStyle("Course Name")}>
                    {course.name}
                  </TableCell>
                  <TableCell sx={cellStyle("Credit Hours")}>
                    {course.credit_hours}
                  </TableCell>
                  <TableCell sx={cellStyle("No. of Students")}>
                    {course.isDeleted ? "Deleted" : course.studentCount}
                  </TableCell>

                  {isTeacher && (
                    <TableCell sx={cellStyle("Actions", true)}>
                      <Button
                        variant="contained"
                        fullWidth={isMobile}
                        sx={{
                          backgroundColor: colors.greenAccent[700],
                          "&:hover": {
                            backgroundColor: colors.greenAccent[600],
                          },
                          mt: isMobile ? 1 : 0,
                        }}
                        onClick={() =>
                          navigate(`/teacher/course/${course.id}`, {
                            state: { courseName: course.name },
                          })
                        }
                      >
                        View Students
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TeachersCoursesTable;
