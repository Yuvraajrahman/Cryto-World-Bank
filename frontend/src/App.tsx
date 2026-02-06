import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import { AppBar } from "./components/Layout/AppBar";
import { BottomNavigation } from "./components/Layout/BottomNavigation";
import { Dashboard } from "./pages/Dashboard";
import { Deposit } from "./pages/Deposit";
import { Loan } from "./pages/Loan";
import { Admin } from "./pages/Admin";
import { QRPage } from "./pages/QRPage";
import { RiskDashboard } from "./pages/RiskDashboard";

const BitcoinLogoBg = () => (
  <Box
    component="div"
    sx={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: { xs: 320, sm: 480, md: 560 },
      height: { xs: 320, sm: 480, md: 560 },
      opacity: 0.04,
      color: "text.secondary",
      pointerEvents: "none",
      zIndex: 0,
    }}
  >
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "100%", height: "100%" }}>
      <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.346-.087-.704-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.234c.532.136.63.486.615.766l-.614 2.454c.037.01.084-.024.13-.05l-.132.526-1.354.335.54 2.165c.257.063.508.124.752.18l-.545 2.19 1.32.33.54-2.165c.36.077.71.148 1.052.213l-.54 2.145 1.315.33.545-2.17c2.24.422 3.92.257 4.63-1.774.57-1.72-.03-2.71-1.2-3.36.854-.193 1.5-.76 1.68-1.93zm-3.01 4.22c-.404 1.64-3.157.754-4.05.532l.72-2.9c.896.22 3.757.67 3.33 2.368zm.41-4.24c-.37 1.49-2.662.734-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084z" />
    </svg>
  </Box>
);

function App() {
  return (
    <BrowserRouter>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          pb: { xs: 7, sm: 0 },
          zIndex: 1,
        }}
      >
        <BitcoinLogoBg />
        <AppBar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            maxWidth: "100%",
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/loan" element={<Loan />} />
            <Route path="/qr" element={<QRPage />} />
            <Route path="/risk" element={<RiskDashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Box>
        <BottomNavigation />
      </Box>
    </BrowserRouter>
  );
}

export default App;
