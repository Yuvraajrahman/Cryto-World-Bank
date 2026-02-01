import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import { AppBar } from "./components/Layout/AppBar";
import { BottomNavigation } from "./components/Layout/BottomNavigation";
import { Dashboard } from "./pages/Dashboard";
import { Deposit } from "./pages/Deposit";
import { Loan } from "./pages/Loan";
import { Admin } from "./pages/Admin";
import { QRPage } from "./pages/QRPage";

function App() {
  return (
    <BrowserRouter>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          pb: { xs: 7, sm: 0 },
        }}
      >
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
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Box>
        <BottomNavigation />
      </Box>
    </BrowserRouter>
  );
}

export default App;
