import { createTheme, alpha } from "@mui/material/styles";

/**
 * Material Design 3 theme - Android 16 aesthetics
 * Minimalistic, clean, research-grade look
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6750A4",
      light: "#EADDFF",
      dark: "#21005D",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#625B71",
      light: "#E8DEF8",
      dark: "#1D192B",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#B3261E",
      light: "#F9DEDC",
      dark: "#410E0B",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#2E7D32",
      light: "#E8F5E9",
      dark: "#1B5E20",
    },
    warning: {
      main: "#ED6C02",
      light: "#FFF3E0",
      dark: "#E65100",
    },
    background: {
      default: "#FFFBFE",
      paper: "#FFFBFE",
    },
    text: {
      primary: "#1C1B1F",
      secondary: "#49454F",
      disabled: "#79747E",
    },
    divider: alpha("#79747E", 0.2),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2rem",
      lineHeight: 1.25,
      fontWeight: 400,
      letterSpacing: "0",
    },
    h2: {
      fontSize: "1.75rem",
      lineHeight: 1.29,
      fontWeight: 400,
    },
    h3: {
      fontSize: "1.5rem",
      lineHeight: 1.33,
      fontWeight: 400,
    },
    h4: {
      fontSize: "1.375rem",
      lineHeight: 1.27,
      fontWeight: 500,
    },
    h5: {
      fontSize: "1.25rem",
      lineHeight: 1.4,
      fontWeight: 500,
    },
    h6: {
      fontSize: "1.125rem",
      lineHeight: 1.33,
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
      fontWeight: 400,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.43,
      fontWeight: 400,
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.33,
      fontWeight: 400,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px rgba(0, 0, 0, 0.15)",
    "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px rgba(0, 0, 0, 0.15)",
    "0px 4px 8px rgba(0, 0, 0, 0.14)",
    "0px 6px 10px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
    "0px 8px 12px rgba(0, 0, 0, 0.14)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 20,
          padding: "10px 24px",
          minHeight: 48,
        },
        contained: {
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFBFE",
          borderTop: "1px solid rgba(0,0,0,0.08)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#6750A4",
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.3)",
        },
      },
    },
  },
});
