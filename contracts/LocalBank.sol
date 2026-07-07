// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {LoanController} from "./LoanController.sol";
import {CreditPassport} from "./CreditPassport.sol";
import {INationalBank} from "./interfaces/INationalBank.sol";

/**
 * @title LocalBank (Tier 3)
 * @notice Receives capital from a National Bank, owns a LoanController for retail loans,
 *         and exposes tier metadata plus governance hooks for approvers.
 */
contract LocalBank is AccessControl, Pausable {
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    address public immutable nationalBank;
    LoanController public immutable loanController;
    string public name;
    string public region;

    CreditPassport public creditPassport;
    mapping(address => bool) public frozenAccounts;
    mapping(address => bool) public registeredClients;

    event LoanControllerDeployed(address indexed controller);
    event CreditPassportLinked(address indexed passport);
    event ClientRegistered(address indexed client);
    event AccountFrozen(address indexed client);
    event AccountUnfrozen(address indexed client);
    event ApproverAdded(address indexed approver);
    event ApproverRemoved(address indexed approver);
    event LoanRequested(uint256 indexed id, address indexed borrower, uint256 principal, bytes32 docHash, string purpose);
    event LoanApproved(uint256 indexed id, address indexed approver, uint256 totalOwed, uint8 installments);
    event LoanRejected(uint256 indexed id, address indexed approver, string reason);
    event LoanDisbursed(uint256 indexed id, address indexed borrower, uint256 amount);
    event InstallmentPaid(uint256 indexed id, address indexed borrower, uint8 installmentIndex, uint256 amount);
    event LoanRepaid(uint256 indexed id, address indexed borrower);
    event CapitalRequested(address indexed nationalBank, uint256 amount, uint256 requestId);

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

        LoanController controller = new LoanController(address(this), governor);
        loanController = controller;
        emit LoanControllerDeployed(address(controller));
    }

    receive() external payable {
        _forwardToController();
    }

    function syncCapitalToLoanPool() external payable {
        _forwardToController();
    }

    function _forwardToController() internal {
        if (address(this).balance == 0) return;
        (bool ok, ) = payable(address(loanController)).call{value: address(this).balance}("");
        require(ok, "forward failed");
    }

    function linkCreditPassport(address passport) external onlyRole(GOVERNOR_ROLE) {
        creditPassport = CreditPassport(passport);
        loanController.setCreditPassport(passport);
        emit CreditPassportLinked(passport);
    }

    function registerClient(address client) external onlyRole(GOVERNOR_ROLE) {
        require(client != address(0), "zero client");
        registeredClients[client] = true;
        if (address(creditPassport) != address(0)) {
            if (!creditPassport.hasPassport(client)) {
                creditPassport.issue(client, 300);
            }
        }
        emit ClientRegistered(client);
    }

    function freezeAccount(address client) external onlyRole(GOVERNOR_ROLE) {
        frozenAccounts[client] = true;
        emit AccountFrozen(client);
    }

    function unfreezeAccount(address client) external onlyRole(GOVERNOR_ROLE) {
        frozenAccounts[client] = false;
        emit AccountUnfrozen(client);
    }

    function requestCapital(uint256 amount) external onlyRole(GOVERNOR_ROLE) returns (uint256 requestId) {
        requestId = INationalBank(nationalBank).requestCapital(amount);
        emit CapitalRequested(nationalBank, amount, requestId);
    }

    function addApprover(address approver) external onlyRole(GOVERNOR_ROLE) {
        loanController.addApprover(approver);
        emit ApproverAdded(approver);
    }

    function removeApprover(address approver) external onlyRole(GOVERNOR_ROLE) {
        loanController.removeApprover(approver);
        emit ApproverRemoved(approver);
    }

    function grantRiskOracle(address account) external onlyRole(GOVERNOR_ROLE) {
        require(account != address(0), "zero oracle");
        loanController.grantRole(loanController.ORACLE_ROLE(), account);
        emit ApproverAdded(account); // reuse event for demo wiring
    }

    function borrowAprBps() external view returns (uint256) {
        return loanController.borrowAprBps();
    }

    function installmentThreshold() external view returns (uint256) {
        return loanController.installmentThreshold();
    }

    function defaultInstallments() external view returns (uint8) {
        return loanController.defaultInstallments();
    }

    function requestLoan(uint256 principal, uint32 termMonths, string calldata purpose)
        external
        whenNotPaused
        returns (uint256 id)
    {
        return requestLoanWithDoc(principal, termMonths, purpose, bytes32(0));
    }

    function requestLoanWithDoc(
        uint256 principal,
        uint32 termMonths,
        string calldata purpose,
        bytes32 docHash
    ) public whenNotPaused returns (uint256 id) {
        require(!frozenAccounts[msg.sender], "account frozen");
        id = loanController.requestLoanFor(msg.sender, principal, termMonths, docHash, purpose);
        emit LoanRequested(id, msg.sender, principal, docHash, purpose);
        return id;
    }

    function approveLoan(uint256 id) external whenNotPaused {
        loanController.approveLoanFor(msg.sender, id);
        LoanController.Loan memory l = loanController.getLoan(id);
        emit LoanApproved(id, msg.sender, l.totalOwed, l.installmentCount);
        emit LoanDisbursed(id, l.borrower, l.principal);
    }

    function rejectLoan(uint256 id, string calldata reason) external {
        loanController.rejectLoanFor(msg.sender, id, reason);
        emit LoanRejected(id, msg.sender, reason);
    }

    function payInstallment(uint256 id) external payable whenNotPaused {
        require(!frozenAccounts[msg.sender], "account frozen");
        LoanController.Loan memory before = loanController.getLoan(id);
        uint8 prevPaid = before.installmentsPaid;
        loanController.payInstallmentFor{value: msg.value}(msg.sender, id);
        emit InstallmentPaid(id, msg.sender, prevPaid + 1, msg.value);
        LoanController.Loan memory afterLoan = loanController.getLoan(id);
        if (afterLoan.status == LoanController.LoanStatus.Repaid) {
            emit LoanRepaid(id, msg.sender);
        }
    }

    function markLoanDefaulted(uint256 id) external onlyRole(GOVERNOR_ROLE) {
        loanController.markDefaulted(id);
    }

    function installmentAmount(uint256 id) external view returns (uint256) {
        return loanController.installmentAmount(id);
    }

    function borrowerLoans(address borrower) external view returns (uint256[] memory) {
        return loanController.borrowerLoans(borrower);
    }

    function allLoanIds() external view returns (uint256[] memory) {
        return loanController.allLoanIds();
    }

    function pendingLoanIds() external view returns (uint256[] memory) {
        return loanController.pendingLoanIds();
    }

    function loans(uint256 id)
        external
        view
        returns (
            uint256 id_,
            address borrower,
            uint256 principal,
            uint256 aprBps,
            uint32 termMonths,
            uint256 totalOwed,
            uint256 totalPaid,
            uint256 createdAt,
            uint256 approvedAt,
            uint8 installmentCount,
            uint8 installmentsPaid,
            LoanController.LoanStatus status,
            bytes32 docHash,
            string memory purpose,
            uint256 nextDueAt
        )
    {
        LoanController.Loan memory l = loanController.getLoan(id);
        return (
            l.id,
            l.borrower,
            l.principal,
            l.aprBps,
            l.termMonths,
            l.totalOwed,
            l.totalPaid,
            l.createdAt,
            l.approvedAt,
            l.installmentCount,
            l.installmentsPaid,
            l.status,
            l.docHash,
            l.purpose,
            l.nextDueAt
        );
    }

    function bankStats()
        external
        view
        returns (uint256 balance, uint256 loanCount, uint256 pending, uint256 active, uint256 repaid)
    {
        return loanController.bankStats();
    }

    function setBorrowApr(uint256 newBps) external onlyRole(GOVERNOR_ROLE) {
        loanController.setBorrowApr(newBps);
    }

    function setInstallmentPolicy(uint256 threshold, uint8 installments)
        external
        onlyRole(GOVERNOR_ROLE)
    {
        loanController.setInstallmentPolicy(threshold, installments);
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
        loanController.pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
        loanController.unpause();
    }
}
