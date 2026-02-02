import { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from "@mui/material";
import {
  Security,
  Psychology,
  SmartToy,
  Speed,
} from "@mui/icons-material";
import { useRole } from "../hooks/useRole";
import { RiskScoreCard } from "../components/ML/RiskScoreCard";
import { AnomalyAlert } from "../components/ML/AnomalyAlert";

const mockAlerts = [
  {
    id: 1,
    type: "wallet" as const,
    severity: "high" as const,
    message: "Unusual Wallet Activity Detected",
    details: "Wallet 0x742d...5f0b showed 47 transactions in 1 hour (normal: 5/day)",
    timestamp: new Date(Date.now() - 30 * 60000),
  },
  {
    id: 2,
    type: "transaction" as const,
    severity: "medium" as const,
    message: "Abnormal Transaction Pattern",
    details: "Multiple small deposits followed by large withdrawal",
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
  },
  {
    id: 3,
    type: "pattern" as const,
    severity: "low" as const,
    message: "Potential Multi-Account Detection",
    details: "3 wallets showing similar transaction patterns",
    timestamp: new Date(Date.now() - 5 * 60 * 60000),
  },
];

const mockMetrics = [
  { label: "Loans Analyzed", value: "342", change: "+12%" },
  { label: "Frauds Prevented", value: "28", change: "+5%" },
  { label: "Anomalies Detected", value: "15", change: "-8%" },
  { label: "Attacks Blocked", value: "3", change: "0%" },
];

const mockRecentDetections = [
  { time: "2 min ago", type: "Fraud", confidence: 0.87, action: "Blocked" },
  { time: "15 min ago", type: "Anomaly", confidence: 0.72, action: "Flagged" },
  { time: "1 hour ago", type: "Fraud", confidence: 0.91, action: "Blocked" },
  { time: "3 hours ago", type: "Attack", confidence: 0.65, action: "Monitored" },
];

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>;
}

export function RiskDashboard() {
  const { isBankOrAdmin } = useRole();
  const [tabValue, setTabValue] = useState(0);

  if (!isBankOrAdmin) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom fontWeight={500}>
          Risk & Security Dashboard
        </Typography>
        <Alert severity="warning">
          Bank only. Risk detection and security features are visible to the bank, not to users.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Security fontSize="large" color="primary" />
        <Typography variant="h4" fontWeight={500}>
          AI/ML Risk & Security Dashboard
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Real-time security monitoring powered by machine learning
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <RiskScoreCard score={0.23} type="fraud" label="Fraud Detection Risk" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <RiskScoreCard score={0.35} type="anomaly" label="Anomaly Level" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <RiskScoreCard score={0.12} type="attack" label="Attack Probability" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <SmartToy color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  RL Policy Status
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={600} color="success.main">
                ACTIVE
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Optimizing approvals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mockMetrics.map((metric, idx) => (
          <Grid item xs={6} md={3} key={idx}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {metric.label}
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {metric.value}
                </Typography>
                <Chip
                  label={metric.change}
                  size="small"
                  color={metric.change.startsWith("+") ? "success" : metric.change.startsWith("-") ? "error" : "default"}
                  sx={{ mt: 0.5 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Alerts" icon={<Security />} iconPosition="start" />
          <Tab label="Detections" icon={<Psychology />} iconPosition="start" />
          <Tab label="Analytics" icon={<Speed />} iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom fontWeight={500}>
          Recent Security Alerts
        </Typography>
        {mockAlerts.map((alert) => (
          <AnomalyAlert key={alert.id} {...alert} />
        ))}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom fontWeight={500}>
          Recent ML Detections
        </Typography>
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockRecentDetections.map((det, idx) => (
                <TableRow key={idx}>
                  <TableCell>{det.time}</TableCell>
                  <TableCell>
                    <Chip label={det.type} size="small" />
                  </TableCell>
                  <TableCell>{(det.confidence * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    <Chip
                      label={det.action}
                      size="small"
                      color={det.action === "Blocked" ? "error" : det.action === "Flagged" ? "warning" : "default"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom fontWeight={500}>
          Performance Analytics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Model Performance (Last 7 Days)
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Fraud Detection Accuracy</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      94.2%
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Anomaly ROC-AUC</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      0.89
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">False Positive Rate</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      4.3%
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">RL Cumulative Reward</Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      +127.5
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Security Impact
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Frauds Prevented</Typography>
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      28 loans
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Funds Protected</Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      142.5 MATIC
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Attacks Blocked</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      3 attempts
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Detection Latency</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      &lt; 250ms
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
}
