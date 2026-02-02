import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from "@mui/material";
import {
  AccountBalance,
  RequestQuote,
  CheckCircle,
  PendingActions,
  Security,
  Shield,
} from "@mui/icons-material";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useWorldBankContract } from "../hooks/useContract";
import { useRole } from "../hooks/useRole";
import { CONTRACT_ADDRESS } from "../config/contracts";
import { useNavigate } from "react-router-dom";

function StatsCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card elevation={1}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box mr={2} color="primary.main">
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h5" component="div" gutterBottom fontWeight={500}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { isConnected } = useAccount();
  const { isBankOrAdmin } = useRole();
  const contract = useWorldBankContract();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalReserve: "0",
    totalLoans: "0",
    pendingLoans: "0",
    approvedLoans: "0",
  });

  useEffect(() => {
    if (!isConnected) {
      setLoading(false);
      return;
    }
    loadStats();
  }, [isConnected]);

  const loadStats = async () => {
    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setError("Contract not deployed. Set VITE_CONTRACT_ADDRESS and deploy first.");
      setLoading(false);
      return;
    }
    try {
      setError("");
      const result = await contract.read.getStats();
      setStats({
        totalReserve: formatEther(result[0]),
        totalLoans: result[1].toString(),
        pendingLoans: result[2].toString(),
        approvedLoans: result[3].toString(),
      });
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("Failed to load reserve data. Check network and contract.");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom fontWeight={500}>
          Decentralized Crypto Reserve & Lending Bank
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          A World Bank–inspired blockchain prototype. Connect your wallet to view
          the reserve dashboard and participate.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Connect your wallet using the button in the top bar to get started.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
        <Typography variant="h4" fontWeight={500}>
          Reserve Dashboard
        </Typography>
        <Button variant="outlined" size="small" onClick={loadStats}>
          Refresh
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        {isBankOrAdmin
          ? "Transparent, on-chain global reserve system powered by AI/ML security"
          : "Transparent, on-chain global reserve. Deposit and request loans."}
      </Typography>

      {isBankOrAdmin && (
        <Alert
          severity="success"
          icon={<Shield />}
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/risk")}>
              View Details
            </Button>
          }
        >
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="body2" fontWeight={500}>
              AI Security Active
            </Typography>
            <Chip label="3 Threats Blocked Today" size="small" color="success" />
            <Chip label="94% Detection Rate" size="small" variant="outlined" />
          </Box>
        </Alert>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Reserve"
            value={`${parseFloat(stats.totalReserve).toFixed(4)} MATIC`}
            icon={<AccountBalance fontSize="large" />}
            subtitle="Available for lending"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Loans"
            value={stats.totalLoans}
            icon={<RequestQuote fontSize="large" />}
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending"
            value={stats.pendingLoans}
            icon={<PendingActions fontSize="large" />}
            subtitle="Awaiting approval"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Approved"
            value={stats.approvedLoans}
            icon={<CheckCircle fontSize="large" />}
            subtitle="Funds released"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {isBankOrAdmin && (
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }} elevation={1}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Security color="primary" />
                  <Typography variant="h6" fontWeight={500}>
                    AI/ML Security Layer
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Advanced machine learning models protect the platform with real-time
                  fraud detection, anomaly monitoring, and explainable AI decisions.
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip label="Fraud Detection" size="small" color="primary" variant="outlined" />
                  <Chip label="Anomaly Detection" size="small" color="primary" variant="outlined" />
                  <Chip label="Attack Prevention" size="small" color="primary" variant="outlined" />
                  <Chip label="RL Optimization" size="small" color="primary" variant="outlined" />
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => navigate("/risk")}
                >
                  View Security Dashboard
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={isBankOrAdmin ? 6 : 12}>
          <Card sx={{ height: "100%" }} elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={500}>
                About This System
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isBankOrAdmin
                  ? "This decentralized reserve operates entirely on the blockchain with AI-powered security. All transactions are transparent, all loan decisions use explainable AI, and the system continuously learns to optimize approvals while protecting against fraud and attacks."
                  : "This decentralized reserve operates entirely on the blockchain. You can deposit to the reserve and request loans. All transactions are transparent and on-chain."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
