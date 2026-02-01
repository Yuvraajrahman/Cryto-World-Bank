import { Card, CardContent, Typography, Box, LinearProgress, Chip } from "@mui/material";
import { Warning, CheckCircle, Error } from "@mui/icons-material";

interface RiskScoreCardProps {
  score: number;
  type: "fraud" | "anomaly" | "attack";
  label: string;
}

export function RiskScoreCard({ score, type, label }: RiskScoreCardProps) {
  const getColor = () => {
    if (score > 0.7) return "error";
    if (score > 0.4) return "warning";
    return "success";
  };

  const getIcon = () => {
    if (score > 0.7) return <Error color="error" />;
    if (score > 0.4) return <Warning color="warning" />;
    return <CheckCircle color="success" />;
  };

  const getRiskLevel = () => {
    if (score > 0.7) return "HIGH";
    if (score > 0.4) return "MEDIUM";
    return "LOW";
  };

  return (
    <Card elevation={2} sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle2" color="text.secondary">
            {label}
          </Typography>
          {getIcon()}
        </Box>
        
        <Typography variant="h3" fontWeight={600} mb={1}>
          {(score * 100).toFixed(1)}%
        </Typography>
        
        <LinearProgress
          variant="determinate"
          value={score * 100}
          color={getColor()}
          sx={{ height: 8, borderRadius: 1, mb: 1 }}
        />
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Risk Level
          </Typography>
          <Chip
            label={getRiskLevel()}
            color={getColor()}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
