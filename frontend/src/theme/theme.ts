import { createTheme, alpha } from "@mui/material/styles";

/**
 * Black & Golden theme
 * Luxurious dark aesthetic with gold accents
 */
export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#D4AF37",
      light: "#F4E4A6",
      dark: "#B8962E",
      contrastText: "#0a0a0a",
    },
    secondary: {
      main: "#C9A227",
      light: "#E8D78A",
      dark: "#8B6914",
      contrastText: "#0a0a0a",
    },
    error: {
      main: "#CF6679",
      light: "#FFCDD2",
      dark: "#B00020",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#4CAF50",
      light: "#C8E6C9",
      dark: "#2E7D32",
    },
    warning: {
      main: "#FFB74D",
      light: "#FFE0B2",
      dark: "#F57C00",
    },
    background: {
      default: "#0a0a0a",
      paper: "#141414",
    },
    text: {
      primary: "#FAFAFA",
      secondary: "rgba(255, 255, 255, 0.7)",
      disabled: "rgba(255, 255, 255, 0.38)",
    },
    divider: alpha("#D4AF37", 0.2),
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
    "0px 1px 2px rgba(0, 0, 0, 0.5), 0px 1px 3px rgba(212, 175, 55, 0.1)",
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
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5), 0px 1px 3px rgba(212, 175, 55, 0.2)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.5), 0px 1px 3px rgba(212, 175, 55, 0.08)",
          border: "1px solid rgba(212, 175, 55, 0.15)",
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
          backgroundColor: "#0a0a0a",
          borderTop: "1px solid rgba(212, 175, 55, 0.2)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0a0a0a",
          borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.5)",
        },
      },
    },
  },
});
