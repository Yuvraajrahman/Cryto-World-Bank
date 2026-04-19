// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title LocalBank (Tier 3)
 * @notice Receives capital from a National Bank and runs the retail loan
 *         lifecycle: application, review, approval/rejection, disbursement,
 *         and installment repayment for the end borrower (Tier 4).
 *
 * @dev Installment generation is automatic for loans above a configurable
 *      threshold (default 100 ETH). Interest is quoted as an APR in basis
 *      points; the total owed is computed on the loan term at approval time.
 */
contract LocalBank is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    address public immutable nationalBank;
    string public name;
    string public region;

    /// @notice APR quoted to borrowers, in basis points. Default 8.00%.
    uint256 public borrowAprBps = 800;

    /// @notice Loan size (wei) above which installment schedule is auto-generated.
    uint256 public installmentThreshold = 100 ether;

    /// @notice Default number of installments for large loans.
    uint8 public defaultInstallments = 12;

    enum LoanStatus { Pending, Approved, Rejected, Active, Repaid, Defaulted }

    struct Loan {
        uint256 id;
        address borrower;
        uint256 principal;
        uint256 aprBps;
        uint32 termMonths;
        uint256 totalOwed;   // principal + interest
        uint256 totalPaid;
        uint256 createdAt;
        uint256 approvedAt;
        uint8 installmentCount;
        uint8 installmentsPaid;
        LoanStatus status;
        string purpose;
    }

    uint256 public nextLoanId = 1;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public loansByBorrower;
    uint256[] private _allLoanIds;

    event LoanRequested(uint256 indexed id, address indexed borrower, uint256 principal, string purpose);
    event LoanApproved(uint256 indexed id, address indexed approver, uint256 totalOwed, uint8 installments);
    event LoanRejected(uint256 indexed id, address indexed approver, string reason);
    event LoanDisbursed(uint256 indexed id, address indexed borrower, uint256 amount);
    event InstallmentPaid(uint256 indexed id, address indexed borrower, uint8 installmentIndex, uint256 amount);
    event LoanRepaid(uint256 indexed id, address indexed borrower);
    event ApproverAdded(address indexed approver);
    event ApproverRemoved(address indexed approver);
    event BorrowAprUpdated(uint256 oldBps, uint256 newBps);

    constructor(
        address governor,
        address nationalBankAddress,
        string memory bankName,
        string memory bankRegion
    ) {
        require(nationalBankAddress != address(0), "zero national bank");
        nationalBank = nationalBankAddress;
        name = bankName;
        region = bankRegion;

        _grantRole(DEFAULT_ADMIN_ROLE, governor);
        _grantRole(GOVERNOR_ROLE, governor);
        _grantRole(APPROVER_ROLE, governor);
    }

    receive() external payable {}

    // -------- Approver management --------

    function addApprover(address approver) external onlyRole(GOVERNOR_ROLE) {
        _grantRole(APPROVER_ROLE, approver);
        emit ApproverAdded(approver);
    }

    function removeApprover(address approver) external onlyRole(GOVERNOR_ROLE) {
        _revokeRole(APPROVER_ROLE, approver);
        emit ApproverRemoved(approver);
    }

    // -------- Loan lifecycle --------

    function requestLoan(uint256 principal, uint32 termMonths, string calldata purpose)
        external
        whenNotPaused
        returns (uint256 id)
    {
        require(principal > 0, "zero principal");
        require(termMonths > 0 && termMonths <= 60, "invalid term");

        id = nextLoanId++;
        loans[id] = Loan({
            id: id,
            borrower: msg.sender,
            principal: principal,
            aprBps: borrowAprBps,
            termMonths: termMonths,
            totalOwed: 0,
            totalPaid: 0,
            createdAt: block.timestamp,
            approvedAt: 0,
            installmentCount: 0,
            installmentsPaid: 0,
            status: LoanStatus.Pending,
            purpose: purpose
        });
        loansByBorrower[msg.sender].push(id);
        _allLoanIds.push(id);

        emit LoanRequested(id, msg.sender, principal, purpose);
    }

    function approveLoan(uint256 id)
        external
        onlyRole(APPROVER_ROLE)
        whenNotPaused
        nonReentrant
    {
        Loan storage l = loans[id];
        require(l.status == LoanStatus.Pending, "not pending");
        require(address(this).balance >= l.principal, "insufficient funds");

        uint256 interest = (l.principal * l.aprBps * l.termMonths) / (10000 * 12);
        l.totalOwed = l.principal + interest;
        l.approvedAt = block.timestamp;
        l.installmentCount = l.principal >= installmentThreshold ? defaultInstallments : 1;
        l.status = LoanStatus.Active;

        (bool ok, ) = payable(l.borrower).call{value: l.principal}("");
        require(ok, "disburse failed");

        emit LoanApproved(id, msg.sender, l.totalOwed, l.installmentCount);
        emit LoanDisbursed(id, l.borrower, l.principal);
    }

    function rejectLoan(uint256 id, string calldata reason)
        external
        onlyRole(APPROVER_ROLE)
    {
        Loan storage l = loans[id];
        require(l.status == LoanStatus.Pending, "not pending");
        l.status = LoanStatus.Rejected;
        emit LoanRejected(id, msg.sender, reason);
    }

    function payInstallment(uint256 id)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        Loan storage l = loans[id];
        require(l.status == LoanStatus.Active, "not active");
        require(msg.sender == l.borrower, "not borrower");
        require(l.installmentsPaid < l.installmentCount, "already repaid");

        uint256 expected = _installmentAmount(l);
        require(msg.value >= expected, "amount too low");

        l.installmentsPaid += 1;
        l.totalPaid += msg.value;

        emit InstallmentPaid(id, msg.sender, l.installmentsPaid, msg.value);

        if (l.installmentsPaid >= l.installmentCount) {
            l.status = LoanStatus.Repaid;
            emit LoanRepaid(id, l.borrower);
        }
    }

    function _installmentAmount(Loan memory l) internal pure returns (uint256) {
        if (l.installmentCount == 0) return 0;
        return l.totalOwed / l.installmentCount;
    }

    // -------- Views --------

    function installmentAmount(uint256 id) external view returns (uint256) {
        return _installmentAmount(loans[id]);
    }

    function borrowerLoans(address borrower) external view returns (uint256[] memory) {
        return loansByBorrower[borrower];
    }

    function allLoanIds() external view returns (uint256[] memory) {
        return _allLoanIds;
    }

    function bankStats()
        external
        view
        returns (uint256 balance, uint256 loanCount, uint256 pending, uint256 active, uint256 repaid)
    {
        uint256 p;
        uint256 a;
        uint256 r;
        for (uint256 i = 0; i < _allLoanIds.length; i++) {
            LoanStatus s = loans[_allLoanIds[i]].status;
            if (s == LoanStatus.Pending) p++;
            else if (s == LoanStatus.Active) a++;
            else if (s == LoanStatus.Repaid) r++;
        }
        return (address(this).balance, _allLoanIds.length, p, a, r);
    }

    // -------- Governance --------

    function setBorrowApr(uint256 newBps) external onlyRole(GOVERNOR_ROLE) {
        require(newBps <= 5000, "apr too high");
        uint256 prev = borrowAprBps;
        borrowAprBps = newBps;
        emit BorrowAprUpdated(prev, newBps);
    }

    function setInstallmentPolicy(uint256 threshold, uint8 installments)
        external
        onlyRole(GOVERNOR_ROLE)
    {
        require(installments > 0 && installments <= 60, "bad installments");
        installmentThreshold = threshold;
        defaultInstallments = installments;
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
