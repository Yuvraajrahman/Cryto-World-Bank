import { useEffect, useState } from 'react';
import { mockReserveSummary } from '../data/mockReserveSummary';

/**
 * Fetches the public, aggregate reserve summary shown on the landing page
 * (frontend-development-plan.md, page A.1). Per the spec, this must degrade
 * gracefully if the API is down — callers always get a `status` to branch on
 * ('loading' | 'success' | 'error'), never a hard crash.
 *
 * BACKEND TODO: replace the mock block below with a real call, e.g.:
 *
 *   const res = await fetch('/api/public/reserve-summary');
 *   if (!res.ok) throw new Error('reserve summary unavailable');
 *   const data = await res.json();
 *
 * Keep the response shape aligned with mockReserveSummary.js so nothing
 * downstream (TransparencySection.jsx) needs to change.
 */
export function useReserveSummary() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // --- mock fetch — replace with the real endpoint above ---
        await new Promise((resolve) => setTimeout(resolve, 400));
        if (!cancelled) {
          setState({ status: 'success', data: mockReserveSummary, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ status: 'error', data: null, error: err });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
