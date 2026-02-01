import { Card, CardContent, Typography, Box, Chip, Button } from "@mui/material";
import { SmartToy, ThumbUp, ThumbDown } from "@mui/icons-material";

interface RLRecommendationProps {
  action: "approve" | "reject" | "review";
  confidence: number;
  expectedReward: number;
  reasoning: string;
  onAccept?: () => void;
  onReject?: () => void;
}

export function RLRecommendation({
  action,
  confidence,
  expectedReward,
  reasoning,
  onAccept,
  onReject,
}: RLRecommendationProps) {
  const getActionColor = () => {
    if (action === "approve") return "success";
    if (action === "reject") return "error";
    return "warning";
  };

  const getActionIcon = () => {
    if (action === "approve") return <ThumbUp />;
    if (action === "reject") return <ThumbDown />;
    return <SmartToy />;
  };

  return (
    <Card
      elevation={3}
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <SmartToy />
          <Typography variant="h6" fontWeight={600}>
            RL Agent Recommendation
          </Typography>
        </Box>

        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <Chip
            label={`${action.toUpperCase()}`}
            color={getActionColor()}
            icon={getActionIcon()}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
            }}
          />
          <Chip
            label={`${(confidence * 100).toFixed(0)}% Confidence`}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
            }}
          />
          <Chip
            label={`Expected Reward: ${expectedReward > 0 ? "+" : ""}${expectedReward.toFixed(1)}`}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ opacity: 0.95 }} paragraph>
          {reasoning}
        </Typography>

        {(onAccept || onReject) && (
          <Box display="flex" gap={2} mt={2}>
            {onAccept && (
              <Button
                variant="contained"
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.9)", color: "#667eea" }}
                onClick={onAccept}
              >
                Follow Recommendation
              </Button>
            )}
            {onReject && (
              <Button
                variant="outlined"
                size="small"
                sx={{ borderColor: "white", color: "white" }}
                onClick={onReject}
              >
                Override
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
