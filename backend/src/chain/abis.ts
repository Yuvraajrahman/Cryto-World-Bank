// Minimal ABIs for indexer and on-chain readers.

export const WORLD_EVENTS_ABI = [
  "event DepositReceived(address indexed from, uint256 amount)",
  "event CapitalAllocated(address indexed bank, uint256 amount)",
  "event CapitalRequested(address indexed bank, uint256 amount, uint256 indexed requestId)",
  "event RepaymentRecorded(address indexed bank, uint256 principal, uint256 interest)",
  "function nextCapitalRequestId() view returns (uint256)",
  "function capitalRequests(uint256) view returns (address bank, uint256 amount, bool open)",
] as const;

export const NATIONAL_EVENTS_ABI = [
  "event CapitalAllocated(address indexed bank, uint256 amount)",
  "event CapitalRequested(address indexed bank, uint256 amount, uint256 indexed requestId)",
  "event RepaymentRecorded(address indexed bank, uint256 principal, uint256 interest)",
  "function nextCapitalRequestId() view returns (uint256)",
  "function capitalRequests(uint256) view returns (address bank, uint256 amount, bool open)",
] as const;

export const LOCAL_EVENTS_ABI = [
  "event LoanRequested(uint256 indexed id, address indexed borrower, uint256 principal, bytes32 docHash, string purpose)",
  "event LoanApproved(uint256 indexed id, address indexed approver, uint256 totalOwed, uint8 installments)",
  "event LoanRejected(uint256 indexed id, address indexed approver, string reason)",
  "event LoanDisbursed(uint256 indexed id, address indexed borrower, uint256 amount)",
  "event InstallmentPaid(uint256 indexed id, address indexed borrower, uint8 installmentIndex, uint256 amount)",
  "event LoanRepaid(uint256 indexed id, address indexed borrower)",
  "event ClientRegistered(address indexed client)",
  "event AccountFrozen(address indexed client)",
  "event AccountUnfrozen(address indexed client)",
  "function frozenAccounts(address) view returns (bool)",
  "function loans(uint256) view returns (uint256,address,uint256,uint256,uint32,uint256,uint256,uint256,uint256,uint8,uint8,uint8,bytes32,string,uint256)",
  "function allLoanIds() view returns (uint256[])",
  "function borrowerLoans(address) view returns (uint256[])",
] as const;

export const LOAN_CONTROLLER_EVENTS_ABI = [
  "event LoanRequested(uint256 indexed id, address indexed borrower, uint256 principal, bytes32 docHash, string purpose)",
  "event LoanApproved(uint256 indexed id, address indexed approver, uint256 totalOwed, uint8 installments)",
  "event LoanRejected(uint256 indexed id, address indexed approver, string reason)",
  "event LoanDisbursed(uint256 indexed id, address indexed borrower, uint256 amount)",
  "event InstallmentPaid(uint256 indexed id, address indexed borrower, uint8 installmentIndex, uint256 amount)",
  "event LoanRepaid(uint256 indexed id, address indexed borrower)",
  "event LoanDefaulted(uint256 indexed id, address indexed borrower)",
] as const;

export const PASSPORT_EVENTS_ABI = [
  "event PassportIssued(address indexed wallet, uint16 creditScore, uint8 tier)",
  "event ScoreUpdated(address indexed wallet, uint16 oldScore, uint16 newScore, uint8 tier)",
] as const;

export const UPWARD_EVENTS_ABI = [
  "event UpwardDepositMade(address indexed from, address indexed to, uint256 amount, uint256 depositId)",
] as const;

export const SAVINGS_EVENTS_ABI = [
  "event Deposited(address indexed user, uint256 assets, uint256 shares)",
  "event Withdrawn(address indexed user, uint256 assets, uint256 shares)",
] as const;

export const GROUP_EVENTS_ABI = [
  "event GroupCreated(uint256 indexed groupId, address indexed organizer, address indexed localBank)",
  "event MemberAdded(uint256 indexed groupId, address indexed member)",
  "event ConsentRecorded(uint256 indexed groupId, address indexed member)",
  "event GroupActivated(uint256 indexed groupId)",
] as const;

export const IBLP_EVENTS_ABI = [
  "event IBLPBorrowed(uint256 indexed id, address indexed lender, address indexed borrower, uint256 principal, uint32 tenorDays)",
  "event IBLPRepaid(uint256 indexed id, address indexed borrower, uint256 amount)",
] as const;
