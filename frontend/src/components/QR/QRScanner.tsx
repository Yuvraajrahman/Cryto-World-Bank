import { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from "@mui/material";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export function QRScanner({ open, onClose, onScan }: QRScannerProps) {
  const [manualInput, setManualInput] = useState("");

  const handleManualSubmit = useCallback(() => {
    const trimmed = manualInput.trim();
    if (trimmed) {
      onScan(trimmed);
      setManualInput("");
      onClose();
    }
  }, [manualInput, onScan, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scan or paste QR content</DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          On mobile, use your camera app to scan a QR code, then paste the
          result here. Or paste any wallet address or link.
        </Typography>

        <TextField
          fullWidth
          size="medium"
          label="Paste QR content or address"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
          multiline
          rows={3}
          placeholder="ethereum:0x... or https://..."
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleManualSubmit}
          disabled={!manualInput.trim()}
        >
          Use this value
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
