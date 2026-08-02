/**
 * Placeholder data shaped like the real public reserve-summary response
 * (see frontend-development-plan.md, page A.1: "High-level, non-sensitive
 * stats pulled from the public Reserve Summary").
 *
 * Keep this shape in sync with whatever GET /api/public/reserve-summary
 * actually returns, so swapping the mock for a real fetch in
 * useReserveSummary.js requires no changes downstream.
 */
export const mockReserveSummary = {
  capitalUnderManagement: { value: 48_200_000, display: '$48.2M' },
  activeLoans: { value: 1204, display: '1,204' },
  participatingBanks: { value: 37, display: '37' },
  network: { name: 'Sepolia Testnet', chainId: 11155111 },
  audits: [
    { name: 'Slither', status: 'passed' },
    { name: 'Mythril', status: 'passed' },
  ],
  contractsVerified: true,
  lastUpdated: '2026-08-02T00:00:00Z',
};
