import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
} from "@mui/material";
import { QrCode2, QrCodeScanner } from "@mui/icons-material";
import { useAccount } from "wagmi";
import { QRGenerator } from "../components/QR/QRGenerator";
import { QRScanner } from "../components/QR/QRScanner";
import { CONTRACT_ADDRESS } from "../config/contracts";

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function QRPage() {
  const { address, isConnected } = useAccount();
  const [tabValue, setTabValue] = useState(0);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);

  const handleScan = (data: string) => {
    setScannedValue(data);
    setScannerOpen(false);
  };

  const walletQRValue = address
    ? `ethereum:${address}`
    : "";

  const loanShareBase =
    typeof window !== "undefined"
      ? `${window.location.origin}/loan`
      : "";

  if (!isConnected) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom fontWeight={500}>
          QR Codes
        </Typography>
        <Alert severity="warning">
          Connect your wallet to generate or scan QR codes for addresses and
          transactions.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom fontWeight={500}>
        QR Codes
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Share your wallet or scan QR codes for quick transactions
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Generate" icon={<QrCode2 />} iconPosition="start" />
          <Tab label="Scan" icon={<QrCodeScanner />} iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <QRGenerator
              value={walletQRValue}
              title="Wallet address"
              subtitle="Others can scan this to send you MATIC or connect."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <QRGenerator
              value={loanShareBase}
              title="Loan page"
              subtitle="Share the loan request page link."
            />
          </Grid>
          {CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && (
            <Grid item xs={12}>
              <QRGenerator
                value={`ethereum:${CONTRACT_ADDRESS}`}
                title="Reserve contract"
                subtitle="Contract address for deposits and interactions."
              />
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card elevation={1}>
          <CardContent>
            <Typography variant="body1" paragraph>
              Scan a QR code to get a wallet address, contract address, or link.
            </Typography>
            <Button
              variant="contained"
              startIcon={<QrCodeScanner />}
              onClick={() => setScannerOpen(true)}
              fullWidth
              size="large"
            >
              Open scanner
            </Button>
          </CardContent>
        </Card>

        {scannedValue && (
          <Alert
            severity="success"
            sx={{ mt: 3 }}
            onClose={() => setScannedValue(null)}
          >
            <Typography variant="body2" component="div">
              <strong>Scanned:</strong>
              <Box
                component="span"
                sx={{
                  display: "block",
                  wordBreak: "break-all",
                  mt: 0.5,
                }}
              >
                {scannedValue}
              </Box>
            </Typography>
          </Alert>
        )}
      </TabPanel>

      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </Container>
  );
}
