import ApprovalsQueuePage from "../local/ApprovalsQueuePage";

/**
 * Route: `/bank/national?tab=approvals` — client + local-bank loan queue.
 */
export default function NationalApprovalsPage({ getDecisionHref } = {}) {
  return (
    <ApprovalsQueuePage
      apiBase="/api/national-bank/approvals"
      decisionBasePath="/bank/national"
      getDecisionHref={getDecisionHref}
      title="National loan approvals"
      lede="Approve or reject client retail requests and Local Bank liquidity asks funded by this National bank."
      emptyDescription="No pending client or Local Bank loan requests for this National bank."
      showKindFilter
    />
  );
}
