import { tokens } from "../theme";
import {
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  IconButton,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { Edit, Delete, Pause, Visibility, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const UserTable = ({
  filteredUsers,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  userType,
  handleUpdate,
  handleStatusChange,
  handleDeleteClick,
  searchQuery,
  setSearchQuery,
  fetching,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // Custom breakpoint at 1000px
  const isMobile = useMediaQuery("(max-width:1200px)");

  const headers = [
    "ID",
    "Name",
    "Email",
    "CNIC",
    "Phone",
    "Gender",
    "Status",
    "Deleted?",
    "Actions",
  ];

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
      {/* Search Bar */}
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
          All {userType}s
        </Typography>
        <TextField
          size="small"
          placeholder="Search by name, email, CNIC, or phone"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

      {fetching ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer sx={{ borderRadius: "10px 10px 0 0" }}>
            <Table sx={{ display: isMobile ? "block" : "table" }}>
              <TableHead
                sx={{ display: isMobile ? "none" : "table-header-group" }}
              >
                <TableRow sx={{ backgroundColor: colors.blueAccent[700] }}>
                  {headers.map((head) => (
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
                  gap: isMobile ? "15px" : "0",
                }}
              >
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No {userType}s found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{
                          display: isMobile ? "grid" : "table-row",
                          gridTemplateColumns: isMobile
                            ? "repeat(2, 1fr)"
                            : "none",
                          backgroundColor: isMobile
                            ? colors.primary[500]
                            : "inherit",
                          border: isMobile
                            ? `1px solid ${colors.grey[700]}`
                            : "none",
                          borderRadius: isMobile ? "8px" : "0",
                          p: isMobile ? 2 : 0,
                          "&:hover": { backgroundColor: colors.primary[300] },
                        }}
                      >
                        <TableCell sx={cellStyle(isMobile, "ID")}>
                          {user.id}
                        </TableCell>
                        <TableCell sx={cellStyle(isMobile, "Name")}>
                          {user.name}
                        </TableCell>
                        <TableCell sx={cellStyle(isMobile, "Email")}>
                          {user.email}
                        </TableCell>
                        <TableCell sx={cellStyle(isMobile, "CNIC")}>
                          {user.cnic}
                        </TableCell>
                        <TableCell sx={cellStyle(isMobile, "Phone")}>
                          {user.phone || "-"}
                        </TableCell>
                        <TableCell sx={cellStyle(isMobile, "Gender")}>
                          {user.gender || "-"}
                        </TableCell>
                        <TableCell sx={cellStyle(isMobile, "Status")}>
                          <Chip
                            size="small"
                            label={
                              user.status == "active" ? "Active" : "Inactive"
                            }
                            color={
                              user.status == "active" ? "success" : "warning"
                            }
                          />
                        </TableCell>
                        <TableCell sx={cellStyle(isMobile, "Deleted?")}>
                          <Chip
                            size="small"
                            label={
                              user.isDeleted === 1 || user.isDeleted === true
                                ? "Deleted"
                                : "Not Deleted"
                            }
                            color={
                              user.isDeleted === 1 || user.isDeleted === true
                                ? "error"
                                : "success"
                            }
                          />
                        </TableCell>
                        <TableCell sx={cellStyle(isMobile, "Actions", true)}>
                          <Box display="flex" mt={isMobile ? 1 : 0}>
                            <Tooltip title="View">
                              <IconButton
                                color="info"
                                onClick={() =>
                                  navigate(`/${userType}/${user.id}`)
                                }
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Update">
                              <IconButton
                                color="secondary"
                                onClick={() => handleUpdate(user)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            {(user.isDeleted === 0 ||
                              user.isDeleted === false) && (
                              <Tooltip title="Toggle Status">
                                <IconButton
                                  color="warning"
                                  onClick={() => handleStatusChange(user)}
                                >
                                  <Pause />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(user.isDeleted === 0 ||
                              user.isDeleted === false) && (
                              <Tooltip title="Delete">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            )}
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
            count={filteredUsers.length}
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
        </>
      )}
    </Paper>
  );
};

/**
 * Custom styling function for TableCells to handle Mobile view via Grid
 */
const cellStyle = (isMobile, label, fullWidth = false) => ({
  display: isMobile ? "flex" : "table-cell",
  flexDirection: "column",
  alignItems: isMobile ? "flex-start" : "inherit", // Add this line
  borderBottom: isMobile ? "none" : "inherit",
  padding: isMobile ? "8px" : "16px",
  gridColumn: isMobile && fullWidth ? "span 2" : "auto",
  "&::before": {
    content: isMobile ? `"${label}"` : "none",
    fontWeight: "bold",
    fontSize: "0.75rem",
    color: "#4cceac", // Using your green accent color
    textTransform: "uppercase",
    marginBottom: "4px",
  },
});

export default UserTable;
