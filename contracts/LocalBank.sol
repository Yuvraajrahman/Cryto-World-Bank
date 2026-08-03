// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {LoanController} from "./LoanController.sol";
import {CreditPassport} from "./CreditPassport.sol";
import {INationalBank} from "./interfaces/INationalBank.sol";

/**
 * @title LocalBank (Tier 3)
 * @notice Receives MockUSDC from a National Bank, owns a LoanController for
 *         retail loans, and exposes tier metadata plus governance hooks.
 */
contract LocalBank is AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    address public immutable nationalBank;
    IERC20 public immutable usdc;
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
        address usdcAddress,
        string memory bankName,
        string memory bankRegion
    ) {
        require(nationalBankAddress != address(0), "zero national bank");
        require(usdcAddress != address(0), "zero usdc");
        nationalBank = nationalBankAddress;
        usdc = IERC20(usdcAddress);
        name = bankName;
        region = bankRegion;

        _grantRole(DEFAULT_ADMIN_ROLE, governor);
        _grantRole(GOVERNOR_ROLE, governor);

        LoanController controller = new LoanController(address(this), governor, usdcAddress);
        loanController = controller;
        emit LoanControllerDeployed(address(controller));
    }

    /// @notice Forwards all MockUSDC held by this bank into the loan pool.
    function syncCapitalToLoanPool() external {
        _forwardToController();
    }

    function _forwardToController() internal {
        uint256 bal = usdc.balanceOf(address(this));
        if (bal == 0) return;
        usdc.safeTransfer(address(loanController), bal);
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
        emit ApproverAdded(account);
    }

    function borrowAprBps() external view returns (uint256) {
        return loanController.borrowAprBps();
    }

    function downwardRateBps() external view returns (uint256) {
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
        return requestLoanWithDoc(principal, termMonths, purpose, bytes32(0), 0);
    }

    function requestLoanWithDoc(
        uint256 principal,
        uint32 termMonths,
        string calldata purpose,
        bytes32 docHash,
        uint256 collateralUsdc
    ) public whenNotPaused returns (uint256 id) {
        require(!frozenAccounts[msg.sender], "account frozen");
        id = loanController.requestLoanFor(
            msg.sender,
            principal,
            termMonths,
            docHash,
            purpose,
            collateralUsdc
        );
        emit LoanRequested(id, msg.sender, principal, docHash, purpose);
        return id;
    }

    function requestCollateralLoan(
        uint256 principal,
        uint32 termMonths,
        string calldata purpose,
        uint256 collateralUsdc
    ) external whenNotPaused returns (uint256 id) {
        require(collateralUsdc > 0, "collateral required");
        return requestLoanWithDoc(principal, termMonths, purpose, bytes32(0), collateralUsdc);
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

    function payInstallment(uint256 id, uint256 amount) external whenNotPaused {
        require(!frozenAccounts[msg.sender], "account frozen");
        LoanController.Loan memory before = loanController.getLoan(id);
        uint8 prevPaid = before.installmentsPaid;
        loanController.payInstallmentFor(msg.sender, id, amount);
        emit InstallmentPaid(id, msg.sender, prevPaid + 1, amount);
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

    function setRateModel(
        uint256 baseRateBps,
        uint256 slope1Bps,
        uint256 slope2Bps,
        uint256 kinkBps
    ) external onlyRole(GOVERNOR_ROLE) {
        loanController.setRateModel(baseRateBps, slope1Bps, slope2Bps, kinkBps);
    }

    function setMaxLtvBps(uint256 newMaxLtvBps) external onlyRole(GOVERNOR_ROLE) {
        loanController.setMaxLtvBps(newMaxLtvBps);
    }

    function utilizationBps() external view returns (uint256) {
        return loanController.utilizationBps();
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
