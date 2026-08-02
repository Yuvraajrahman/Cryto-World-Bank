import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

/**
 * Stable wallet-connection facade for public chrome (Navbar, Sticky CTA).
 * Keeps the design-system return shape while using RainbowKit + wagmi.
 *
 * status: disconnected | connecting | connected | error
 */
export function useWalletConnection() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isConnected) setError(false);
  }, [isConnected]);

  const status = useMemo(() => {
    if (error) return "error";
    if (isConnected && address) return "connected";
    if (isConnecting || isReconnecting) return "connecting";
    return "disconnected";
  }, [address, error, isConnected, isConnecting, isReconnecting]);

  const connect = useCallback(async () => {
    if (isConnected && address) return { ok: true };
    if (!openConnectModal) {
      setError(true);
      return { ok: false, error: new Error("Connect modal unavailable") };
    }
    try {
      openConnectModal();
      return { ok: true };
    } catch (err) {
      setError(true);
      return { ok: false, error: err };
    }
  }, [address, isConnected, openConnectModal]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setError(false);
  }, [disconnect]);

  return { status, address: address ?? null, connect, disconnect: disconnectWallet };
}
