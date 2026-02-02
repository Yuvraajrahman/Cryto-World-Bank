import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import {
  Dashboard,
  Add,
  RequestQuote,
  AccountBalance,
  QrCode2,
  Security,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "../../hooks/useRole";

const baseNavItems = [
  { label: "Dashboard", value: "/", icon: <Dashboard /> },
  { label: "Deposit", value: "/deposit", icon: <Add /> },
  { label: "Loan", value: "/loan", icon: <RequestQuote /> },
  { label: "QR", value: "/qr", icon: <QrCode2 /> },
];

const bankOnlyNavItems = [
  { label: "Risk AI", value: "/risk", icon: <Security /> },
  { label: "Bank", value: "/admin", icon: <AccountBalance /> },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isBankOrAdmin } = useRole();
  const navItems = [
    ...baseNavItems,
    ...(isBankOrAdmin ? bankOnlyNavItems : [{ label: "Bank", value: "/admin", icon: <AccountBalance /> }]),
  ];
  const value = navItems.find((item) => item.value === location.pathname)?.value ?? "/";

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
      }}
      elevation={0}
      square
    >
      <MuiBottomNavigation
        value={value}
        onChange={(_, newValue) => navigate(newValue)}
        showLabels
        sx={{
          minHeight: 56,
          "& .MuiBottomNavigationAction-root": {
            minWidth: 56,
            minHeight: 48,
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </MuiBottomNavigation>
    </Paper>
  );
}
