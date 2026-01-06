import {
  Breadcrumbs,
  Typography,
  Link as MUILink,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../theme";

/**
 * Manual Breadcrumbs component for navigation.
 *
 * Renders a Material-UI Breadcrumbs component with custom colors.
 * Last item is rendered as plain text, previous items as clickable links.
 *
 * @param {Object} props
 * @param {Array<{ label: string, to: string }>} props.items - List of breadcrumb items.
 *        Each item has:
 *          - `label`: Text to display
 *          - `to`: Route path (used only for non-last items)
 *
 * @returns {JSX.Element} Breadcrumbs component
 */
export default function BreadcrumbsManual({ items }) {
  const theme = useTheme(); // Get current MUI theme
  const colors = tokens(theme.palette.mode); // Custom color tokens based on theme

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator="/" // Separator character between breadcrumbs
      sx={{ mb: 2, color: colors.greenAccent[900] }} // Margin bottom + color
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1; // Check if this is the last breadcrumb

        // Last breadcrumb: plain text
        return isLast ? (
          <Typography key={index} color={colors.greenAccent[700]}>
            {item.label}
          </Typography>
        ) : (
          // Other breadcrumbs: clickable links
          <MUILink
            key={index}
            component={Link} // Use react-router Link
            to={item.to}
            underline="hover"
            color={colors.greenAccent[700]}
          >
            {item.label}
          </MUILink>
        );
      })}
    </Breadcrumbs>
  );
}
