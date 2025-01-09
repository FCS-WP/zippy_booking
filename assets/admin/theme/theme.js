import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Customize the primary color
      contrastText: "#ffffff", // Text color for primary buttons
    },
    secondary: {
      main: "#ff4081", // Customize the secondary color
    },
    background: {
      default: "#f5f5f5", // Background color for the app
      paper: "#ffffff", // Background for paper components
    },
    text: {
      primary: "#333333", // Primary text color
      secondary: "#666666", // Secondary text color
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: "16px", 
        },
      },
    },
  },
});

export default theme;
