import { useState } from "react";
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
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { useWorldBankContract } from "../hooks/useContract";

export function Deposit() {
  const contract = useWorldBankContract();
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const hash = await contract.write.depositToReserve({
        value: parseEther(amount),
      });
      if (hash) {
        setSuccess(true);
        setAmount("");
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom fontWeight={500}>
          Deposit to Reserve
        </Typography>
        <Alert severity="warning">
          Please connect your wallet to deposit funds
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom fontWeight={500}>
        Deposit to Reserve
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Contribute to the global reserve fund
      </Typography>

      <Card elevation={1} sx={{ mt: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Amount (MATIC)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
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
              Deposit successful! Transaction confirmed.
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Add />}
            onClick={handleDeposit}
            disabled={loading || !amount}
          >
            {loading ? "Processing…" : "Deposit"}
          </Button>

          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              Your deposit will be added to the global reserve and used for approved
              loans. All transactions are recorded on-chain.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
