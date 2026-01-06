import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

/**
 * Header component displaying a title and subtitle with custom colors.
 *
 * @param {Object} props
 * @param {string} props.title - Main header text.
 * @param {string} props.subtitle - Subheader text displayed below the title.
 *
 * @returns {JSX.Element} A styled header section with title and subtitle.
 */
const Header = ({ title, subtitle }) => {
  const theme = useTheme(); // Get current MUI theme
  const colors = tokens(theme.palette.mode); // Custom color tokens based on theme

  return (
    <Box mb="30px">
      {/* Main title */}
      <Typography
        variant="h2"
        color={colors.grey[900]}
        fontWeight="bold"
        sx={{ mb: "5px" }}
      >
        {title}
      </Typography>

      {/* Subtitle */}
      <Typography variant="h5" color={colors.greenAccent[800]}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
