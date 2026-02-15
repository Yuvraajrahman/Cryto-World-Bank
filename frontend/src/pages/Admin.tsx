import { useEffect, useState, useCallback } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { CheckCircle, Cancel, AccountBalance, People, PendingActions } from "@mui/icons-material";
import { useWorldBankContract } from "../hooks/useContract";
import { useDemoMode } from "../context/DemoModeContext";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { RLRecommendation } from "../components/ML/RLRecommendation";
import { XAIExplanation } from "../components/ML/XAIExplanation";

const DEMO_TOTAL_RESERVE_ETH = 1_000_000;

type LoanItem = {
  id: bigint;
  borrower: string;
  amount: bigint;
  purpose: string;
  status: number;
  requestedAt: bigint;
  approvedAt: bigint;
};

type DemoLoan = {
  id: number;
  borrower: string;
  amountEth: number;
  purpose: string;
  requestedAt: number;
  status: "pending" | "approved" | "rejected";
};

const MOCK_APPROVED_LOANS: DemoLoan[] = [
  { id: 1, borrower: "0x742d...5f0b", amountEth: 2.5, purpose: "Business expansion", requestedAt: Date.now() / 1000 - 86400 * 7, status: "approved" },
  { id: 2, borrower: "0x8a3c...1d2e", amountEth: 1.2, purpose: "Education", requestedAt: Date.now() / 1000 - 86400 * 3, status: "approved" },
  { id: 3, borrower: "0xb91f...9c4a", amountEth: 5, purpose: "Medical emergency", requestedAt: Date.now() / 1000 - 86400, status: "approved" },
];

const MOCK_PENDING_LOANS: DemoLoan[] = [
  { id: 4, borrower: "0xc4e2...7f3d", amountEth: 3, purpose: "Home repair", requestedAt: Date.now() / 1000 - 3600, status: "pending" },
  { id: 5, borrower: "0xd5f1...2a8b", amountEth: 0.8, purpose: "Short-term working capital", requestedAt: Date.now() / 1000 - 7200, status: "pending" },
];

export function Admin() {
  const contract = useWorldBankContract();
  const { demoRole, setDemoRole } = useDemoMode();
  const { address } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingLoans, setPendingLoans] = useState<LoanItem[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanItem & { action: "approve" | "reject" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMLAnalysis, setShowMLAnalysis] = useState<{ [key: string]: boolean }>({});

  const [demoApprovedLoans, setDemoApprovedLoans] = useState<DemoLoan[]>(MOCK_APPROVED_LOANS);
  const [demoPendingLoans, setDemoPendingLoans] = useState<DemoLoan[]>(MOCK_PENDING_LOANS);
  const [demoSelected, setDemoSelected] = useState<DemoLoan | null>(null);
  const [demoAction, setDemoAction] = useState<"approve" | "reject" | null>(null);

  const demoReserveLeft = DEMO_TOTAL_RESERVE_ETH - demoApprovedLoans.reduce((s, l) => s + l.amountEth, 0);
  const demoTotalDisbursed = demoApprovedLoans.reduce((s, l) => s + l.amountEth, 0);

  const loadPendingLoans = useCallback(async () => {
    try {
      const loans = await contract.read.getPendingLoans();
      setPendingLoans(loans.map((l: LoanItem) => l));
    } catch (err) {
      console.error("Error loading pending loans:", err);
    }
  }, [contract]);

  const checkAdmin = useCallback(async () => {
    try {
      const owner = await contract.read.owner();
      const admin = owner.toLowerCase() === address?.toLowerCase();
      setIsAdmin(admin);
      if (admin) {
        await loadPendingLoans();
      }
    } catch (err) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [address, contract, loadPendingLoans]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

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

  const handleDemoApprove = (loan: DemoLoan) => {
    setDemoPendingLoans((prev) => prev.filter((l) => l.id !== loan.id));
    setDemoApprovedLoans((prev) => [...prev, { ...loan, status: "approved" as const }]);
    setDemoSelected(null);
    setDemoAction(null);
  };

  const handleDemoReject = (loan: DemoLoan) => {
    setDemoPendingLoans((prev) => prev.filter((l) => l.id !== loan.id));
    setDemoSelected(null);
    setDemoAction(null);
  };

  const showDemoContent = demoMode || demoRole === "bank";
  const showPanel = isAdmin || demoMode || demoRole === "bank";

  if (loading && !showDemoContent) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!showPanel) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom fontWeight={500}>
          Bank
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Use <strong>Demo Bank</strong> or <strong>Demo User</strong> in the top bar to switch roles. Or connect as the bank (contract owner) to manage real loans.
        </Alert>
        <Card elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={500}>
            Bank (Demo)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The bank holds a 1M ETH reserve. Users request loans and make deposits. Click <strong>Demo Bank</strong> in the top bar to view the bank panel.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => setDemoMode(true)}
            startIcon={<AccountBalance />}
          >
            Enter as Bank (Demo)
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={500}>
            Bank
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {showDemoContent ? "Demo — 1M ETH reserve, manage loans and risk" : "1M ETH reserve. Review loan requests and approve/reject."}
          </Typography>
        </Box>
        {showDemoContent && (
          <Box display="flex" alignItems="center" gap={2}>
            <Chip label="Bank (Demo)" color="primary" sx={{ fontWeight: 600 }} />
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setDemoMode(false);
                setDemoRole(null);
              }}
            >
              Exit Demo
            </Button>
          </Box>
        )}
      </Box>

      {showDemoContent && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={2} sx={{ p: 2, height: "100%" }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AccountBalance color="primary" />
                <Typography variant="subtitle2" color="text.secondary">Bank Total Reserve</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {DEMO_TOTAL_RESERVE_ETH.toLocaleString()} ETH
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={2} sx={{ p: 2, height: "100%", borderLeft: 4, borderColor: "success.main" }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AccountBalance color="success" />
                <Typography variant="subtitle2" color="text.secondary">Reserve Left</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {demoReserveLeft.toLocaleString()} ETH
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={2} sx={{ p: 2, height: "100%" }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <People color="primary" />
                <Typography variant="subtitle2" color="text.secondary">Total Disbursed</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {demoTotalDisbursed.toFixed(1)} ETH
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {showDemoContent && (
        <Card elevation={2} sx={{ mb: 4 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={500}>
              Who took how much (approved loans)
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>User (Borrower)</strong></TableCell>
                    <TableCell align="right"><strong>Amount (ETH)</strong></TableCell>
                    <TableCell><strong>Purpose</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {demoApprovedLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.borrower}</TableCell>
                      <TableCell align="right">{loan.amountEth.toFixed(2)}</TableCell>
                      <TableCell>{loan.purpose}</TableCell>
                      <TableCell align="center">
                        <Chip label="Approved" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Card>
      )}

      <Typography variant="h6" gutterBottom fontWeight={500} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PendingActions /> Pending loan requests
      </Typography>

      {showDemoContent ? (
        demoPendingLoans.length === 0 ? (
          <Alert severity="info">No pending loan requests in demo.</Alert>
        ) : (
          <List disablePadding>
            {demoPendingLoans.map((loan) => (
              <Card key={loan.id} sx={{ mb: 3 }} elevation={2}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="h6">{loan.amountEth} ETH</Typography>
                        <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                          <Chip label="Pending" color="warning" size="small" />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mt: 1 }}><strong>Purpose:</strong> {loan.purpose}</Typography>
                        <Typography variant="caption" color="text.secondary">Borrower: {loan.borrower}</Typography>
                      </>
                    }
                  />
                </ListItem>
                <Box sx={{ p: 2 }} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => { setDemoSelected(loan); setDemoAction("approve"); }}
                    fullWidth
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => { setDemoSelected(loan); setDemoAction("reject"); }}
                    fullWidth
                  >
                    Reject
                  </Button>
                </Box>
              </Card>
            ))}
          </List>
        )
      ) : pendingLoans.length === 0 ? (
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
            onClick={() => {
              if (!selectedLoan) return;
              if (selectedLoan.action === "approve") {
                handleApprove(selectedLoan.id);
              } else {
                handleReject(selectedLoan.id);
              }
            }}
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

      <Dialog
        open={!!demoSelected && !!demoAction}
        onClose={() => { setDemoSelected(null); setDemoAction(null); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm {demoAction === "approve" ? "Approval" : "Rejection"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {demoAction} this demo loan request for{" "}
            {demoSelected?.amountEth} ETH?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDemoSelected(null); setDemoAction(null); }}>Cancel</Button>
          <Button
            onClick={() => {
              if (demoSelected && demoAction === "approve") handleDemoApprove(demoSelected);
              if (demoSelected && demoAction === "reject") handleDemoReject(demoSelected);
            }}
            color={demoAction === "approve" ? "success" : "error"}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
