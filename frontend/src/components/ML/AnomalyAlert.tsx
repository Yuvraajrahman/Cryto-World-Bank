import { Alert, AlertTitle, Box, Chip, Typography } from "@mui/material";
import { Warning, Security, Speed } from "@mui/icons-material";

interface AnomalyAlertProps {
  type: "wallet" | "transaction" | "pattern";
  severity: "low" | "medium" | "high";
  message: string;
  details?: string;
  timestamp?: Date;
}

export function AnomalyAlert({ type, severity, message, details, timestamp }: AnomalyAlertProps) {
  const getSeverityColor = () => {
    if (severity === "high") return "error";
    if (severity === "medium") return "warning";
    return "info";
  };

  const getIcon = () => {
    if (type === "wallet") return <Warning />;
    if (type === "transaction") return <Speed />;
    return <Security />;
  };

  return (
    <Alert
      severity={getSeverityColor()}
      icon={getIcon()}
      sx={{ mb: 2 }}
    >
      <AlertTitle>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <Typography variant="subtitle2" fontWeight={600}>
            {message}
          </Typography>
          <Chip
            label={severity.toUpperCase()}
            size="small"
            color={getSeverityColor()}
          />
        </Box>
      </AlertTitle>
      
      {details && (
        <Typography variant="body2" paragraph>
          {details}
        </Typography>
      )}
      
      {timestamp && (
        <Typography variant="caption" color="text.secondary">
          Detected: {timestamp.toLocaleString()}
        </Typography>
      )}
    </Alert>
  );
}
