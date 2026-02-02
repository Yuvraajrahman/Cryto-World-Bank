import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
} from "@mui/material";
import { AccountBalanceWallet, AccountBalance, Person } from "@mui/icons-material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDemoMode } from "../../context/DemoModeContext";

export function AppBar() {
  const { demoRole, setDemoRole } = useDemoMode();

  return (
    <MuiAppBar position="sticky" elevation={0}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, flexWrap: "wrap" }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="logo"
          sx={{ mr: 2 }}
        >
          <AccountBalanceWallet />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 500,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Crypto Reserve Bank
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Button
            size="small"
            variant={demoRole === "bank" ? "contained" : "outlined"}
            color="inherit"
            startIcon={<AccountBalance />}
            onClick={() => setDemoRole(demoRole === "bank" ? null : "bank")}
            sx={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            Demo Bank
          </Button>
          <Button
            size="small"
            variant={demoRole === "user" ? "contained" : "outlined"}
            color="inherit"
            startIcon={<Person />}
            onClick={() => setDemoRole(demoRole === "user" ? null : "user")}
            sx={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            Demo User
          </Button>
          <ConnectButton />
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
