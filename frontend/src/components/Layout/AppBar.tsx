import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { AccountBalanceWallet } from "@mui/icons-material";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function AppBar() {
  return (
    <MuiAppBar position="sticky" elevation={0}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
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
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ConnectButton />
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
