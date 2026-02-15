import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { Download, Share } from "@mui/icons-material";

interface QRGeneratorProps {
  value: string;
  title: string;
  subtitle?: string;
}

export function QRGenerator({ value, title, subtitle }: QRGeneratorProps) {
  const svgRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${title.replace(/\s+/g, "-")}.png`;
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: subtitle ?? value,
          url: value.startsWith("http") ? value : undefined,
        });
      } catch (err) {
        console.log("Share cancelled or failed:", err);
      }
    }
  };

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={500}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {subtitle}
          </Typography>
        )}

        <Box display="flex" justifyContent="center" my={3} ref={svgRef}>
          <QRCodeSVG value={value} size={256} level="H" includeMargin />
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            wordBreak: "break-all",
            bgcolor: "action.hover",
            p: 1,
            borderRadius: 1,
            mb: 2,
          }}
        >
          {value}
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadQR}
            fullWidth
          >
            Download
          </Button>
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={shareQR}
              fullWidth
            >
              Share
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
