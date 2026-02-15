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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useUser } from "../hooks/useUser";

export function Register() {
  const { address, isConnected } = useAccount();
  const { user, refetch } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    userType: "borrower",
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    bankType: "local",
    nationalBankId: "",
    localBankId: "",
    role: "approver",
  });

  const [banks, setBanks] = useState({
    national: [] as any[],
    local: [] as any[],
  });

  useEffect(() => {
    // Load banks
    api.getNationalBanks().then((national) => setBanks((prev) => ({ ...prev, national }))).catch(console.error);
    api.getLocalBanks().then((local) => setBanks((prev) => ({ ...prev, local }))).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (formData.userType === "borrower") {
        await api.registerBorrower({
          walletAddress: address,
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          country: formData.country,
          city: formData.city || undefined,
        });
      } else {
        await api.registerBankUser({
          walletAddress: address,
          bankType: formData.bankType as "national" | "local",
          nationalBankId: formData.nationalBankId ? parseInt(formData.nationalBankId) : undefined,
          localBankId: formData.localBankId ? parseInt(formData.localBankId) : undefined,
          name: formData.name,
          email: formData.email || undefined,
          role: formData.role as "approver" | "viewer",
        });
      }
      
      setSuccess(true);
      refetch();
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Container maxWidth="sm">
        <Card>
          <CardContent>
            <Alert severity="info">
              Please connect your MetaMask wallet to register.
            </Alert>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (user) {
    return (
      <Container maxWidth="sm">
        <Card>
          <CardContent>
            <Alert severity="success">
              You are already registered as a {user.type === "borrower" ? "borrower" : "bank user"}.
            </Alert>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Register Account
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Register as a borrower to request loans, or as a bank user to manage loans.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Registration successful! Redirecting...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl component="fieldset" sx={{ mb: 3, width: "100%" }}>
              <FormLabel component="legend">Account Type</FormLabel>
              <RadioGroup
                row
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
              >
                <FormControlLabel value="borrower" control={<Radio />} label="Borrower" />
                <FormControlLabel value="bank" control={<Radio />} label="Bank User" />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              sx={{ mb: 2 }}
            />

            {formData.userType === "borrower" ? (
              <>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Country"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </>
            ) : (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Bank Type</InputLabel>
                  <Select
                    value={formData.bankType}
                    label="Bank Type"
                    onChange={(e) => {
                      setFormData({ ...formData, bankType: e.target.value, nationalBankId: "", localBankId: "" });
                      if (e.target.value === "national") {
                        api.getNationalBanks().then((banks) => setBanks((prev) => ({ ...prev, national: banks }))).catch(console.error);
                      } else {
                        api.getLocalBanks().then((banks) => setBanks((prev) => ({ ...prev, local: banks }))).catch(console.error);
                      }
                    }}
                  >
                    <MenuItem value="national">National Bank</MenuItem>
                    <MenuItem value="local">Local Bank</MenuItem>
                  </Select>
                </FormControl>

                {formData.bankType === "national" && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>National Bank</InputLabel>
                    <Select
                      value={formData.nationalBankId}
                      label="National Bank"
                      onChange={(e) => setFormData({ ...formData, nationalBankId: e.target.value })}
                    >
                      {banks.national.map((bank) => (
                        <MenuItem key={bank.national_bank_id} value={bank.national_bank_id}>
                          {bank.name} ({bank.country})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {formData.bankType === "local" && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Local Bank</InputLabel>
                    <Select
                      value={formData.localBankId}
                      label="Local Bank"
                      onChange={(e) => setFormData({ ...formData, localBankId: e.target.value })}
                    >
                      {banks.local.map((bank) => (
                        <MenuItem key={bank.local_bank_id} value={bank.local_bank_id}>
                          {bank.name} ({bank.city})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <MenuItem value="approver">Approver</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

