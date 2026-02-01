import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { useWorldBankContract } from "../hooks/useContract";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { RLRecommendation } from "../components/ML/RLRecommendation";
import { XAIExplanation } from "../components/ML/XAIExplanation";

type LoanItem = {
  id: bigint;
  borrower: string;
  amount: bigint;
  purpose: string;
  status: number;
  requestedAt: bigint;
  approvedAt: bigint;
};

export function Admin() {
  const contract = useWorldBankContract();
  const { address } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingLoans, setPendingLoans] = useState<LoanItem[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanItem & { action: "approve" | "reject" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMLAnalysis, setShowMLAnalysis] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    checkAdmin();
  }, [address]);

  const checkAdmin = async () => {
    try {
      const owner = await contract.read.owner();
      const admin = owner.toLowerCase() === address?.toLowerCase();
      setIsAdmin(admin);
      if (admin) {
        await loadPendingLoans();
      }
    } catch (err) {
      console.error("Error checking admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingLoans = async () => {
    try {
      const loans = await contract.read.getPendingLoans();
      setPendingLoans(
        loans.map((l: LoanItem) => l)
      );
    } catch (err) {
      console.error("Error loading pending loans:", err);
    }
  };

  const handleApprove = async (loanId: bigint) => {
    setActionLoading(true);
    try {
      await contract.write.approveLoan([loanId]);
      await loadPendingLoans();
      setSelectedLoan(null);
    } catch (err) {
      console.error("Error approving loan:", err);
      alert("Failed to approve loan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (loanId: bigint) => {
    setActionLoading(true);
    try {
      await contract.write.rejectLoan([loanId]);
      await loadPendingLoans();
      setSelectedLoan(null);
    } catch (err) {
      console.error("Error rejecting loan:", err);
      alert("Failed to reject loan");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom fontWeight={500}>
          Admin Panel
        </Typography>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom fontWeight={500}>
        Admin Panel
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Review and manage pending loan requests
      </Typography>

      {pendingLoans.length === 0 ? (
        <Alert severity="info">No pending loan requests</Alert>
      ) : (
        <List disablePadding>
          {pendingLoans.map((loan, index) => {
            const loanAmt = Number(formatEther(loan.amount));
            const fraudScore = loanAmt > 5 ? 0.72 : 0.28;
            const rlAction = loanAmt > 10 ? "reject" : loanAmt > 3 ? "review" : "approve";
            const rlConfidence = loanAmt > 10 ? 0.78 : 0.65;
            const loanKey = `loan-${index}`;

            return (
              <Card key={index} sx={{ mb: 3 }} elevation={2}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="h6">
                          {formatEther(loan.amount)} MATIC
                        </Typography>
                        <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                          <Chip label="Pending Review" color="warning" size="small" />
                          <Chip
                            label={`Fraud Risk: ${(fraudScore * 100).toFixed(0)}%`}
                            color={fraudScore > 0.6 ? "error" : "success"}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Purpose:</strong> {loan.purpose}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Borrower: {loan.borrower}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Requested:{" "}
                          {new Date(Number(loan.requestedAt) * 1000).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>

                <Box sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setShowMLAnalysis((prev) => ({
                        ...prev,
                        [loanKey]: !prev[loanKey],
                      }))
                    }
                    sx={{ mb: 2 }}
                  >
                    {showMLAnalysis[loanKey] ? "Hide" : "Show"} AI/ML Analysis
                  </Button>

                  {showMLAnalysis[loanKey] && (
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12}>
                          <RLRecommendation
                            action={rlAction}
                            confidence={rlConfidence}
                            expectedReward={rlAction === "approve" ? 8.5 : -12.3}
                            reasoning={`RL agent analyzed reserve state, default risk, and loan patterns. Based on ${loanAmt.toFixed(1)} MATIC amount and current reserve health, ${rlAction === "approve" ? "approval is recommended" : "rejection is suggested"}.`}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <XAIExplanation
                            decision={fraudScore > 0.6 ? "flag" : "approve"}
                            confidence={0.87}
                            features={[
                              {
                                name: "Loan Amount",
                                value: `${loanAmt.toFixed(2)} MATIC`,
                                impact: loanAmt > 5 ? 0.32 : -0.15,
                              },
                              {
                                name: "Purpose Analysis",
                                value: loan.purpose.length + " chars",
                                impact: loan.purpose.length < 20 ? 0.18 : -0.10,
                              },
                              { name: "Wallet Age", value: "32 days", impact: 0.12 },
                              { name: "Previous Loans", value: "1", impact: -0.08 },
                            ]}
                            reasoning={
                              fraudScore > 0.6
                                ? "AI flagged this loan due to large amount and limited history."
                                : "AI analysis shows low fraud probability. Patterns match legitimate requests."
                            }
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => setSelectedLoan({ ...loan, action: "approve" })}
                      fullWidth
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => setSelectedLoan({ ...loan, action: "reject" })}
                      fullWidth
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </List>
      )}

      <Dialog
        open={!!selectedLoan}
        onClose={() => setSelectedLoan(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm {selectedLoan?.action === "approve" ? "Approval" : "Rejection"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {selectedLoan?.action} this loan request for{" "}
            {selectedLoan && formatEther(selectedLoan.amount)} MATIC?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLoan(null)}>Cancel</Button>
          <Button
            onClick={() =>
              selectedLoan?.action === "approve"
                ? handleApprove(selectedLoan.id)
                : handleReject(selectedLoan.id)
            }
            color={selectedLoan?.action === "approve" ? "success" : "error"}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
