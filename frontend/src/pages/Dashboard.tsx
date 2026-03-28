import { useEffect, useState, useCallback, useRef } from "react";
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
  LinearProgress,
} from "@mui/material";
import {
  AccountBalance,
  RequestQuote,
  CheckCircle,
  PendingActions,
  Security,
  Shield,
  Person,
  SwapHoriz,
  ShowChart,
  Storage,
  VerifiedUser,
} from "@mui/icons-material";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useWorldBankContract } from "../hooks/useContract";
import { useUviCoinBalance, useUviCoinFaucet, useHasClaimedFaucet } from "../hooks/useUviCoin";
import { useRole } from "../hooks/useRole";
import { useUser } from "../hooks/useUser";
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

const SERVICES = [
  { title: "Crypto Trading", icon: SwapHoriz, desc: "Trade digital assets with low fees and instant settlement." },
  { title: "Crypto Staking", icon: ShowChart, desc: "Earn rewards by staking your crypto and supporting the network." },
  { title: "Crypto Lending", icon: RequestQuote, desc: "Borrow against your holdings or earn interest by lending." },
  { title: "Crypto Mining", icon: Storage, desc: "Secure the blockchain and earn mining rewards." },
  { title: "Crypto Custody", icon: Security, desc: "Institutional-grade secure storage for your digital assets." },
  { title: "Crypto Insurance", icon: VerifiedUser, desc: "Protect your portfolio with comprehensive coverage." },
];

function ServiceCard({ title, icon: Icon, desc }: { title: string; icon: React.ElementType; desc: string }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 2,
          borderColor: "primary.light",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.5,
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {desc}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ServicesSection() {
  return (
    <Box
      sx={{
        mt: 4,
        mb: 2,
        py: 4,
        px: 2,
        borderRadius: 3,
        background: "linear-gradient(160deg, #141414 0%, #1a1a1a 40%, #0f0f0f 100%)",
        border: "1px solid rgba(212, 175, 55, 0.2)",
      }}
    >
      <Typography variant="h5" fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
        Our Services
      </Typography>
      <Grid container spacing={2}>
        {SERVICES.map((s) => (
          <Grid item xs={12} sm={6} md={4} key={s.title}>
            <ServiceCard title={s.title} icon={s.icon} desc={s.desc} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export function Dashboard() {
  // Get the connected wallet address and connection status
  const { address, isConnected } = useAccount();
  const { isBankOrAdmin } = useRole();
  const { user, loading: userLoading } = useUser();
  const contract = useWorldBankContract();
  const contractRef = useRef(contract);
  const { data: uviBalance } = useUviCoinBalance(address);
  const { claimFaucet, isPending: faucetPending, isSuccess: faucetSuccess, isDeployed: uviDeployed } = useUviCoinFaucet();
  const { data: hasClaimed } = useHasClaimedFaucet(address);
  contractRef.current = contract;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalReserve: "0",
    totalLoans: "0",
    pendingLoans: "0",
    approvedLoans: "0",
    userDeposits: "0",
  });

  const loadStats = useCallback(async () => {
    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setError("Contract not deployed. Set VITE_CONTRACT_ADDRESS and deploy first.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setError("");
      const c = contractRef.current as unknown as { read: { getStats: () => Promise<readonly bigint[]>; getUserDeposits: (args: [string]) => Promise<bigint> } };
      const statsResult = await c.read.getStats();
      let userDeposits = "0";
      if (address) {
        try {
          const dep = await c.read.getUserDeposits([address]);
          userDeposits = formatEther(dep);
        } catch {
          userDeposits = "0";
        }
      }
      setStats({
        totalReserve: formatEther(statsResult[0]),
        totalLoans: statsResult[1].toString(),
        pendingLoans: statsResult[2].toString(),
        approvedLoans: statsResult[3].toString(),
        userDeposits,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("Failed to load reserve data. Check network and contract.");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!isConnected) {
      setLoading(false);
      return;
    }
    loadStats();
  }, [isConnected, address, loadStats]);

  if (!isConnected) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Decentralized Crypto Reserve and Lending Bank
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            A World Bank–inspired blockchain prototype
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Transparent, on-chain reserve where users deposit funds and request loans.
            All transactions are verifiable on the blockchain.
          </Typography>
          <Alert severity="info" sx={{ mt: 3, textAlign: "left" }}>
            Connect your wallet using the button in the top bar to view the reserve
            dashboard, make deposits, and request loans.
          </Alert>
          <ServicesSection />
        </Box>
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

      {user && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Account Type:</strong> {user.type === 'borrower' ? 'Borrower' : 'Bank User'}
            {user.data?.name && ` - ${user.data.name}`}
          </Typography>
        </Alert>
      )}

      {!user && !userLoading && isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            You are not registered. Please register as a borrower or bank user to use the platform.
          </Typography>
        </Alert>
      )}

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

      {parseInt(stats.totalLoans, 10) > 0 && (
        <Card elevation={1} sx={{ mt: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Loan activity (approved / total)
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {(
                  (parseInt(stats.approvedLoans, 10) / parseInt(stats.totalLoans, 10)) *
                  100
                ).toFixed(0)}
                %
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={
                parseInt(stats.totalLoans, 10) > 0
                  ? (parseInt(stats.approvedLoans, 10) / parseInt(stats.totalLoans, 10)) * 100
                  : 0
              }
              sx={{ height: 8, borderRadius: 1 }}
            />
          </CardContent>
        </Card>
      )}

      {parseFloat(stats.userDeposits) > 0 && (
        <Card elevation={1} sx={{ mt: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              <Person color="primary" />
              <Typography variant="body2" color="text.secondary">
                Your deposits to reserve
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
              {parseFloat(stats.userDeposits).toFixed(4)} MATIC
            </Typography>
          </CardContent>
        </Card>
      )}

      {uviDeployed && (
        <Card elevation={1} sx={{ mt: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Your UviCoin (UVI) balance
                </Typography>
                <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
                  {uviBalance !== undefined ? `${Number(formatEther(uviBalance)).toFixed(2)} UVI` : "—"}
                </Typography>
              </Box>
              {hasClaimed === false && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={claimFaucet}
                  disabled={faucetPending}
                >
                  {faucetPending ? "Claiming…" : "Claim 1000 UVI"}
                </Button>
              )}
              {faucetSuccess && (
                <Chip label="Claimed!" size="small" color="success" />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Box display="flex" gap={2} flexWrap="wrap" sx={{ mb: 3 }}>
        <Button variant="contained" onClick={() => navigate("/deposit")}>
          Deposit
        </Button>
        <Button variant="outlined" onClick={() => navigate("/loan")}>
          Request Loan
        </Button>
        <Button variant="outlined" onClick={() => navigate("/qr")}>
          QR Codes
        </Button>
      </Box>

      <ServicesSection />

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
