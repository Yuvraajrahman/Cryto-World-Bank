import LoanDecisionPage from "../local/LoanDecisionPage";

/**
 * Route: `/bank/national?tab=approvals/:loanId`
 */
export default function NationalLoanDecisionPage() {
  return (
    <LoanDecisionPage
      apiBase="/api/national-bank/approvals"
      queuePath="/bank/national?tab=approvals"
    />
  );
}
