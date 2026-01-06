import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  useMediaQuery, // Added for breakpoint detection
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const StudentsCoursestable = ({
  colors,
  loading,
  totalCredHrs,
  courses,
  columns,
}) => {
  const isMobile = useMediaQuery("(max-width:1200px)");

  const getCredColor = (hrs) => {
    if (hrs >= 15) return colors.redAccent[400];
    if (hrs >= 12) return colors.blueAccent[400];
    return colors.greenAccent[400];
  };

  // Prepare rows (reusing your logic)
  const rows = courses.map((c, idx) => ({ ...c, id: idx + 1 }));

  return (
    <Card
      sx={{
        backgroundColor: colors.primary[400],
        p: 1,
        border: 2,
        borderColor: colors.primary[500],
        borderRadius: "15px",
        boxShadow: `0.8em 0.8em 2em ${colors.primary[200]}`,
      }}
    >
      <CardContent>
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
          Enrolled Courses
        </Typography>

        {totalCredHrs && (
          <Typography
            variant="h6"
            sx={{
              color: getCredColor(totalCredHrs),
              fontWeight: 600,
              mb: 2,
            }}
          >
            Current credit hours: {totalCredHrs} / 15
          </Typography>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={32} />
          </Box>
        ) : isMobile ? (
          /* Responsive Grid Card Layout for Mobile (<= 1000px) */
          <Box display="grid" gridTemplateColumns="1fr" gap={2}>
            {rows.length === 0 ? (
              <Typography
                align="center"
                sx={{ color: colors.grey[100], py: 2 }}
              >
                No courses found.
              </Typography>
            ) : (
              rows.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    backgroundColor: colors.primary[500],
                    p: 2,
                    borderRadius: "8px",
                    border: `1px solid ${colors.grey[700]}`,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1.5,
                  }}
                >
                  {columns.map((col) => (
                    <Box
                      key={col.field}
                      sx={{ display: "flex", flexDirection: "column" }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.greenAccent[500],
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                      >
                        {col.headerName}
                      </Typography>
                      <Typography
                        sx={{ color: colors.grey[100], fontSize: "0.9rem" }}
                      >
                        {/* Handling custom renderCell if exists, 
                           otherwise showing the raw value 
                        */}
                        {col.renderCell
                          ? col.renderCell({ row })
                          : row[col.field]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ))
            )}
          </Box>
        ) : (
          /* Original DataGrid for Desktop (> 1000px) */
          <Box
            height="55vh"
            sx={{
              "& .MuiDataGrid-root": { border: "none" },
              "& .MuiDataGrid-cell": { borderBottom: "none" },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: colors.blueAccent[700],
                borderBottom: "none",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: colors.blueAccent[700],
              },
              borderRadius: "10px",
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              sx={{ borderRadius: "10px" }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsCoursestable;
