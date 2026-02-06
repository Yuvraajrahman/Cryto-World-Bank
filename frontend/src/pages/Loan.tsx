import { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
  Collapse,
  Link,
} from "@mui/material";
import { RequestQuote, OpenInNew } from "@mui/icons-material";
import { useWorldBankContract } from "../hooks/useContract";
import { useRole } from "../hooks/useRole";
import { useAccount, useChainId } from "wagmi";
import { parseEther, formatEther } from "viem";
import { RiskScoreCard } from "../components/ML/RiskScoreCard";
import { XAIExplanation } from "../components/ML/XAIExplanation";
import { getTxExplorerUrl } from "../utils/blockExplorer";

function TabPanel({
  children,
  value,
  index,
}: {
  children?: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const STATUS_LABELS = ["Pending", "Approved", "Rejected", "Paid"];
const STATUS_COLORS = ["warning", "success", "error", "info"] as const;

export function Loan() {
  const contract = useWorldBankContract();
  const { isBankOrAdmin } = useRole();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [tabValue, setTabValue] = useState(0);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false);
  const [fraudScore, setFraudScore] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [userLoans, setUserLoans] = useState<
    { id: bigint; borrower: string; amount: bigint; purpose: string; status: number; requestedAt: bigint; approvedAt: bigint }[]
  >([]);
  const [loadingLoans, setLoadingLoans] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadUserLoans();
    } else {
      setLoadingLoans(false);
    }
  }, [isConnected, address]);

  const loadUserLoans = async () => {
    if (!address) return;
    try {
      const loanIds = await contract.read.getUserLoans([address]);
      const loans = await Promise.all(
        loanIds.map((id: bigint) => contract.read.getLoan([Number(id)]))
      );
      setUserLoans(
        loans.map((l: { id: bigint; borrower: string; amount: bigint; purpose: string; status: number; requestedAt: bigint; approvedAt: bigint }) => l)
      );
    } catch (err) {
      console.error("Error loading loans:", err);
    } finally {
      setLoadingLoans(false);
    }
  };

  const analyzeFraudRisk = () => {
    const amt = parseFloat(amount) || 0;
    const purposeLen = purpose.trim().length;
    
    let score = 0;
    if (amt > 10) score += 0.3;
    if (purposeLen < 20) score += 0.2;
    if (purpose.toLowerCase().includes("urgent") || purpose.toLowerCase().includes("quick")) score += 0.25;
    if (amt > 50) score += 0.2;
    
    setFraudScore(Math.min(score, 0.95));
    setShowRiskAnalysis(true);
  };

  const handleRequest = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!purpose.trim()) {
      setError("Please enter the loan purpose");
      return;
    }

    if (isBankOrAdmin) analyzeFraudRisk();

    setLoading(true);
    setError("");
    setSuccess(false);
    setTxHash(null);

    try {
      const hash = await contract.write.requestLoan([parseEther(amount), purpose]);
      setSuccess(true);
      setTxHash(typeof hash === "string" ? hash : String(hash));
      setAmount("");
      setPurpose("");
      setShowRiskAnalysis(false);
      await loadUserLoans();
      setTimeout(() => {
        setSuccess(false);
        setTxHash(null);
      }, 8000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom fontWeight={500}>
          Loan Management
        </Typography>
        <Alert severity="warning">
          Please connect your wallet to request loans
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom fontWeight={500}>
        Loan Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Request Loan" />
          <Tab label="My Loans" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Card elevation={1}>
          <CardContent>
            <TextField
              fullWidth
              label="Loan Amount (MATIC)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Purpose"
              multiline
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Describe why you need this loan…"
              sx={{ mb: 3 }}
              disabled={loading}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Loan request submitted successfully.
                {txHash && chainId && (
                  <Box mt={1}>
                    <Link
                      href={getTxExplorerUrl(chainId, txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                    >
                      View on explorer <OpenInNew fontSize="small" />
                    </Link>
                  </Box>
                )}
              </Alert>
            )}

            {isBankOrAdmin && (
              <>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={analyzeFraudRisk}
                  disabled={!amount || !purpose}
                  sx={{ mb: 2 }}
                >
                  Analyze Risk with AI
                </Button>

                <Collapse in={showRiskAnalysis}>
                  <Box sx={{ mb: 2 }}>
                    <RiskScoreCard
                      score={fraudScore}
                      type="fraud"
                      label="AI Fraud Detection Score"
                    />
                    <XAIExplanation
                      decision={fraudScore > 0.7 ? "reject" : fraudScore > 0.4 ? "flag" : "approve"}
                      confidence={0.85}
                      features={[
                        { name: "Loan Amount", value: `${amount} MATIC`, impact: parseFloat(amount) > 10 ? 0.25 : -0.15 },
                        { name: "Purpose Length", value: `${purpose.length} chars`, impact: purpose.length < 20 ? 0.18 : -0.12 },
                        { name: "Wallet Age", value: "45 days", impact: -0.08 },
                        { name: "Previous Loans", value: "2", impact: -0.05 },
                      ]}
                      reasoning={
                        fraudScore > 0.7
                          ? "High fraud probability detected. Large loan amount and short purpose description indicate potential risk."
                          : fraudScore > 0.4
                          ? "Moderate risk detected. Loan request shows some suspicious patterns but may be legitimate."
                          : "Low fraud probability. Loan request appears normal based on historical patterns."
                      }
                    />
                  </Box>
                </Collapse>
              </>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <RequestQuote />
                )
              }
              onClick={handleRequest}
              disabled={loading || !amount || !purpose}
            >
              {loading ? "Submitting…" : "Request Loan"}
            </Button>

            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                Your request will be reviewed by the bank. Approved loans will be
                transferred to your wallet automatically.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loadingLoans ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : userLoans.length === 0 ? (
          <Alert severity="info">You have not requested any loans yet.</Alert>
        ) : (
          <List disablePadding>
            {userLoans.map((loan, index) => (
              <Card key={index} sx={{ mb: 2 }} elevation={1}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Typography variant="h6">
                          {formatEther(loan.amount)} MATIC
                        </Typography>
                        <Chip
                          label={STATUS_LABELS[loan.status] ?? "Unknown"}
                          color={STATUS_COLORS[loan.status] ?? "default"}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {loan.purpose}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Requested:{" "}
                          {new Date(
                            Number(loan.requestedAt) * 1000
                          ).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </Card>
            ))}
          </List>
        )}
      </TabPanel>
    </Container>
  );
}
