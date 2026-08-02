import { useCallback, useState } from 'react';

/**
 * Placeholder wallet-connection hook. Every authenticated page in the plan
 * depends on wallet + session state (see "Shared / Global Elements" in
 * frontend-development-plan.md), so this interface is meant to stay stable
 * as pages are added — only the internals should change.
 *
 * WEB3 TODO: replace the internals with your real connector, e.g. wagmi:
 *
 *   import { useAccount, useConnect, useDisconnect } from 'wagmi';
 *
 * ...but keep the return shape (`status`, `address`, `connect`, `disconnect`)
 * identical, so Navbar.jsx and every future page that reads wallet state
 * don't need to change when the real connector goes in.
 */
export function useWalletConnection() {
  const [status, setStatus] = useState('disconnected'); // disconnected | connecting | connected | error
  const [address, setAddress] = useState(null);

  const connect = useCallback(async () => {
    setStatus('connecting');
    try {
      // --- mock connect — replace with real wallet connector ---
      await new Promise((resolve) => setTimeout(resolve, 600));
      setAddress('0x1234...ABCD');
      setStatus('connected');
      return { ok: true };
    } catch (err) {
      setStatus('error');
      return { ok: false, error: err };
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setStatus('disconnected');
  }, []);

  return { status, address, connect, disconnect };
}
