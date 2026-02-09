import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { api } from '../services/api';

export type UserType = 'borrower' | 'bank_user' | null;

export interface UserData {
  type: UserType;
  data: any;
}

export function useUser() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api.getUser(address)
      .then((response) => {
        if (!cancelled) {
          setUser({
            type: response.type as UserType,
            data: response.data,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          // User not found is not an error - they just need to register
          if (err.message.includes('not found')) {
            setUser(null);
          } else {
            setError(err.message);
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  return { user, loading, error, refetch: () => {
    if (address && isConnected) {
      setLoading(true);
      api.getUser(address)
        .then((response) => {
          setUser({
            type: response.type as UserType,
            data: response.data,
          });
        })
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    }
  } };
}

