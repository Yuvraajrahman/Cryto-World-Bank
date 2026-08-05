import ApprovalsQueuePage from "../local/ApprovalsQueuePage";

/**
 * Route: `/bank/national/approvals` — client + local-bank loan queue.
 */
export default function NationalApprovalsPage() {
  return (
    <ApprovalsQueuePage
      apiBase="/api/national-bank/approvals"
      decisionBasePath="/bank/national/approvals"
      title="National loan approvals"
      lede="Approve or reject client retail requests and Local Bank liquidity asks funded by this National bank."
      emptyDescription="No pending client or Local Bank loan requests for this National bank."
      showKindFilter
    />
  );
}
