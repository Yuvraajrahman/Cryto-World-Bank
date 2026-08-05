import LoanDecisionPage from "../local/LoanDecisionPage";

/**
 * Route: `/bank/national/approvals/:loanId`
 */
export default function NationalLoanDecisionPage() {
  return (
    <LoanDecisionPage
      apiBase="/api/national-bank/approvals"
      queuePath="/bank/national/approvals"
    />
  );
}
