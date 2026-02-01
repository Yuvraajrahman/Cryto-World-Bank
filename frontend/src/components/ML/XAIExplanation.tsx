import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Psychology, TrendingUp, TrendingDown } from "@mui/icons-material";

interface Feature {
  name: string;
  value: string | number;
  impact: number;
}

interface XAIExplanationProps {
  decision: "approve" | "reject" | "flag";
  confidence: number;
  features: Feature[];
  reasoning: string;
}

export function XAIExplanation({ decision, confidence, features, reasoning }: XAIExplanationProps) {
  const getDecisionColor = () => {
    if (decision === "approve") return "success";
    if (decision === "reject") return "error";
    return "warning";
  };

  return (
    <Card elevation={2} sx={{ mt: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Psychology color="primary" />
          <Typography variant="h6" fontWeight={500}>
            AI Decision Explanation
          </Typography>
        </Box>

        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <Chip
            label={decision.toUpperCase()}
            color={getDecisionColor()}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`${(confidence * 100).toFixed(0)}% Confidence`}
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {reasoning}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom fontWeight={500}>
          Top Contributing Factors (SHAP Analysis):
        </Typography>

        <List dense>
          {features.map((feat, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {feat.impact > 0 ? (
                      <TrendingUp color="error" fontSize="small" />
                    ) : (
                      <TrendingDown color="success" fontSize="small" />
                    )}
                    <Typography variant="body2" fontWeight={500}>
                      {feat.name}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    Value: {feat.value} • Impact: {feat.impact > 0 ? "+" : ""}
                    {feat.impact.toFixed(3)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
