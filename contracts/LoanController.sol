// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ICreditPassport} from "./interfaces/ICreditPassport.sol";

/**
 * @title LoanController
 * @notice Retail loan state machine owned by a LocalBank instance. All
 *         principal flows use MockUSDC (6 decimals).
 */
contract LoanController is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");
    bytes32 public constant LOCAL_BANK_ROLE = keccak256("LOCAL_BANK_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    address public immutable localBank;
    IERC20 public immutable usdc;
    address public creditPassport;

    uint256 public baseRateBps = 300;
    uint256 public slope1Bps = 500;
    uint256 public slope2Bps = 7500;
    uint256 public kinkBps = 8000;
    uint256 public totalOutstandingPrincipal;
    uint256 public maxLtvBps = 5000;

    mapping(uint256 => uint256) public loanCollateralUsdc;

    /// @notice 100 mUSDC (6 decimals) — loans at/above this split into installments.
    uint256 public installmentThreshold = 100 * 1e6;
    uint8 public defaultInstallments = 12;
    uint32 public installmentPeriodDays = 30;

    enum LoanStatus { Pending, Approved, Rejected, Active, Repaid, Defaulted }

    struct Loan {
        uint256 id;
        address borrower;
        uint256 principal;
        uint256 aprBps;
        uint32 termMonths;
        uint256 totalOwed;
        uint256 totalPaid;
        uint256 createdAt;
        uint256 approvedAt;
        uint8 installmentCount;
        uint8 installmentsPaid;
        LoanStatus status;
        bytes32 docHash;
        string purpose;
        uint256 nextDueAt;
    }

    uint256 public nextLoanId = 1;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public loansByBorrower;
    uint256[] private _allLoanIds;

    mapping(uint256 => bytes32) public riskCommitments;
    mapping(uint256 => uint16) public revealedRiskBps;
    mapping(uint256 => bool) public riskScoreRevealed;

    event LoanRequested(uint256 indexed id, address indexed borrower, uint256 principal, bytes32 docHash, string purpose);
    event LoanApproved(uint256 indexed id, address indexed approver, uint256 totalOwed, uint8 installments);
    event LoanRejected(uint256 indexed id, address indexed approver, string reason);
    event LoanDisbursed(uint256 indexed id, address indexed borrower, uint256 amount);
    event InstallmentPaid(uint256 indexed id, address indexed borrower, uint8 installmentIndex, uint256 amount);
    event LoanRepaid(uint256 indexed id, address indexed borrower);
    event LoanDefaulted(uint256 indexed id, address indexed borrower);
    event ApproverAdded(address indexed approver);
    event ApproverRemoved(address indexed approver);
    event BorrowAprUpdated(uint256 oldBps, uint256 newBps);
    event RateModelUpdated(uint256 baseRateBps, uint256 slope1Bps, uint256 slope2Bps, uint256 kinkBps);
    event CreditPassportSet(address indexed passport);
    event RiskScoreCommitted(uint256 indexed loanId, bytes32 commitHash, address indexed oracle);
    event RiskScoreRevealed(uint256 indexed loanId, uint16 scoreBps, address indexed oracle);

    constructor(address localBankAddress, address governor, address usdcAddress) {
        require(localBankAddress != address(0), "zero local bank");
        require(usdcAddress != address(0), "zero usdc");
        localBank = localBankAddress;
        usdc = IERC20(usdcAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, localBankAddress);
        _grantRole(LOCAL_BANK_ROLE, localBankAddress);
        _grantRole(APPROVER_ROLE, governor);
        _grantRole(ORACLE_ROLE, governor);
    }

    function commitRiskScore(uint256 id, bytes32 commitHash) external onlyRole(ORACLE_ROLE) {
        Loan storage l = loans[id];
        require(l.id != 0, "unknown loan");
        require(l.status == LoanStatus.Pending, "not pending");
        require(commitHash != bytes32(0), "zero commit");
        riskCommitments[id] = commitHash;
        riskScoreRevealed[id] = false;
        revealedRiskBps[id] = 0;
        emit RiskScoreCommitted(id, commitHash, msg.sender);
    }

    function revealRiskScore(uint256 id, uint16 scoreBps, bytes32 salt) external onlyRole(ORACLE_ROLE) {
        Loan storage l = loans[id];
        require(l.id != 0, "unknown loan");
        require(l.status == LoanStatus.Pending, "not pending");
        bytes32 commit = riskCommitments[id];
        require(commit != bytes32(0), "no commit");
        require(!riskScoreRevealed[id], "already revealed");
        require(keccak256(abi.encodePacked(scoreBps, salt)) == commit, "commit mismatch");
        require(scoreBps <= 10000, "bps overflow");
        riskScoreRevealed[id] = true;
        revealedRiskBps[id] = scoreBps;
        emit RiskScoreRevealed(id, scoreBps, msg.sender);
    }

    function isRiskScoreRevealed(uint256 id) external view returns (bool) {
        return riskScoreRevealed[id];
    }

    function setCreditPassport(address passport) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(passport != address(0), "zero passport");
        creditPassport = passport;
        emit CreditPassportSet(passport);
    }

    function addApprover(address approver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(APPROVER_ROLE, approver);
        emit ApproverAdded(approver);
    }

    function removeApprover(address approver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(APPROVER_ROLE, approver);
        emit ApproverRemoved(approver);
    }

    function requestLoanFor(
        address borrower,
        uint256 principal,
        uint32 termMonths,
        bytes32 docHash,
        string calldata purpose,
        uint256 collateralUsdc
    ) external onlyRole(LOCAL_BANK_ROLE) whenNotPaused returns (uint256 id) {
        require(borrower != address(0), "zero borrower");
        require(principal > 0, "zero principal");
        require(termMonths > 0 && termMonths <= 60, "invalid term");

        if (collateralUsdc > 0) {
            require(principal * 10_000 <= collateralUsdc * maxLtvBps, "exceeds ltv");
        }

        if (creditPassport != address(0)) {
            require(ICreditPassport(creditPassport).canBorrow(borrower, principal), "limit exceeded");
        }

        id = nextLoanId++;
        loans[id] = Loan({
            id: id,
            borrower: borrower,
            principal: principal,
            aprBps: borrowAprBps(),
            termMonths: termMonths,
            totalOwed: 0,
            totalPaid: 0,
            createdAt: block.timestamp,
            approvedAt: 0,
            installmentCount: 0,
            installmentsPaid: 0,
            status: LoanStatus.Pending,
            docHash: docHash,
            purpose: purpose,
            nextDueAt: 0
        });
        if (collateralUsdc > 0) {
            loanCollateralUsdc[id] = collateralUsdc;
        }
        loansByBorrower[borrower].push(id);
        _allLoanIds.push(id);

        emit LoanRequested(id, borrower, principal, docHash, purpose);
    }

    function approveLoanFor(address approver, uint256 id)
        external
        onlyRole(LOCAL_BANK_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(hasRole(APPROVER_ROLE, approver), "not approver");
        Loan storage l = loans[id];
        require(l.status == LoanStatus.Pending, "not pending");
        require(riskScoreRevealed[id], "risk not revealed");
        require(usdc.balanceOf(address(this)) >= l.principal, "insufficient funds");

        if (creditPassport != address(0)) {
            require(ICreditPassport(creditPassport).canBorrow(l.borrower, l.principal), "limit exceeded");
            ICreditPassport(creditPassport).onLoanOpened(l.borrower);
        }

        uint256 interest = (l.principal * l.aprBps * l.termMonths) / (10000 * 12);
        l.totalOwed = l.principal + interest;
        l.approvedAt = block.timestamp;
        l.installmentCount = l.principal >= installmentThreshold ? defaultInstallments : 1;
        l.status = LoanStatus.Active;
        l.nextDueAt = block.timestamp + installmentPeriodDays * 1 days;
        totalOutstandingPrincipal += l.principal;

        usdc.safeTransfer(l.borrower, l.principal);

        emit LoanApproved(id, approver, l.totalOwed, l.installmentCount);
        emit LoanDisbursed(id, l.borrower, l.principal);
    }

    function rejectLoanFor(address approver, uint256 id, string calldata reason)
        external
        onlyRole(LOCAL_BANK_ROLE)
    {
        require(hasRole(APPROVER_ROLE, approver), "not approver");
        Loan storage l = loans[id];
        require(l.status == LoanStatus.Pending, "not pending");
        l.status = LoanStatus.Rejected;
        emit LoanRejected(id, approver, reason);
    }

    function payInstallmentFor(address payer, uint256 id, uint256 amount)
        external
        onlyRole(LOCAL_BANK_ROLE)
        whenNotPaused
        nonReentrant
    {
        Loan storage l = loans[id];
        require(l.status == LoanStatus.Active, "not active");
        require(payer == l.borrower, "not borrower");
        require(l.installmentsPaid < l.installmentCount, "already repaid");

        uint256 expected = _installmentAmount(l);
        require(amount >= expected, "amount too low");

        usdc.safeTransferFrom(payer, address(this), amount);

        l.installmentsPaid += 1;
        l.totalPaid += amount;

        emit InstallmentPaid(id, payer, l.installmentsPaid, amount);

        if (l.installmentsPaid >= l.installmentCount) {
            l.status = LoanStatus.Repaid;
            _reduceOutstanding(l.principal);
            if (creditPassport != address(0)) {
                ICreditPassport(creditPassport).onLoanRepaid(l.borrower);
            }
            emit LoanRepaid(id, l.borrower);
        } else {
            l.nextDueAt = block.timestamp + installmentPeriodDays * 1 days;
        }
    }

    function markDefaulted(uint256 id) external onlyRole(LOCAL_BANK_ROLE) {
        Loan storage l = loans[id];
        require(l.status == LoanStatus.Active, "not active");
        require(block.timestamp > l.nextDueAt, "not overdue");
        l.status = LoanStatus.Defaulted;
        _reduceOutstanding(l.principal);
        if (creditPassport != address(0)) {
            ICreditPassport(creditPassport).onLoanDefaulted(l.borrower);
        }
        emit LoanDefaulted(id, l.borrower);
    }

    function _reduceOutstanding(uint256 principal) internal {
        totalOutstandingPrincipal = totalOutstandingPrincipal > principal
            ? totalOutstandingPrincipal - principal
            : 0;
    }

    function approveLoan(uint256 id)
        external
        onlyRole(APPROVER_ROLE)
        whenNotPaused
        nonReentrant
    {
        Loan storage l = loans[id];
        require(l.status == LoanStatus.Pending, "not pending");
        require(riskScoreRevealed[id], "risk not revealed");
        require(usdc.balanceOf(address(this)) >= l.principal, "insufficient funds");

        if (creditPassport != address(0)) {
            require(ICreditPassport(creditPassport).canBorrow(l.borrower, l.principal), "limit exceeded");
            ICreditPassport(creditPassport).onLoanOpened(l.borrower);
        }

        uint256 interest = (l.principal * l.aprBps * l.termMonths) / (10000 * 12);
        l.totalOwed = l.principal + interest;
        l.approvedAt = block.timestamp;
        l.installmentCount = l.principal >= installmentThreshold ? defaultInstallments : 1;
        l.status = LoanStatus.Active;
        l.nextDueAt = block.timestamp + installmentPeriodDays * 1 days;
        totalOutstandingPrincipal += l.principal;

        usdc.safeTransfer(l.borrower, l.principal);

        emit LoanApproved(id, msg.sender, l.totalOwed, l.installmentCount);
        emit LoanDisbursed(id, l.borrower, l.principal);
    }

    function rejectLoan(uint256 id, string calldata reason) external onlyRole(APPROVER_ROLE) {
        Loan storage l = loans[id];
        require(l.status == LoanStatus.Pending, "not pending");
        l.status = LoanStatus.Rejected;
        emit LoanRejected(id, msg.sender, reason);
    }

    function payInstallment(uint256 id, uint256 amount) external whenNotPaused nonReentrant {
        Loan storage l = loans[id];
        require(l.status == LoanStatus.Active, "not active");
        require(msg.sender == l.borrower, "not borrower");
        require(l.installmentsPaid < l.installmentCount, "already repaid");

        uint256 expected = _installmentAmount(l);
        require(amount >= expected, "amount too low");

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        l.installmentsPaid += 1;
        l.totalPaid += amount;

        emit InstallmentPaid(id, msg.sender, l.installmentsPaid, amount);

        if (l.installmentsPaid >= l.installmentCount) {
            l.status = LoanStatus.Repaid;
            _reduceOutstanding(l.principal);
            if (creditPassport != address(0)) {
                ICreditPassport(creditPassport).onLoanRepaid(l.borrower);
            }
            emit LoanRepaid(id, l.borrower);
        } else {
            l.nextDueAt = block.timestamp + installmentPeriodDays * 1 days;
        }
    }

    function _installmentAmount(Loan memory l) internal pure returns (uint256) {
        if (l.installmentCount == 0) return 0;
        return l.totalOwed / l.installmentCount;
    }

    function getLoan(uint256 id) external view returns (Loan memory) {
        return loans[id];
    }

    function installmentAmount(uint256 id) external view returns (uint256) {
        return _installmentAmount(loans[id]);
    }

    function borrowerLoans(address borrower) external view returns (uint256[] memory) {
        return loansByBorrower[borrower];
    }

    function allLoanIds() external view returns (uint256[] memory) {
        return _allLoanIds;
    }

    function pendingLoanIds() external view returns (uint256[] memory) {
        uint256 count;
        for (uint256 i = 0; i < _allLoanIds.length; i++) {
            if (loans[_allLoanIds[i]].status == LoanStatus.Pending) count++;
        }
        uint256[] memory ids = new uint256[](count);
        uint256 j;
        for (uint256 i = 0; i < _allLoanIds.length; i++) {
            if (loans[_allLoanIds[i]].status == LoanStatus.Pending) {
                ids[j++] = _allLoanIds[i];
            }
        }
        return ids;
    }

    function poolBalance() public view returns (uint256) {
        return usdc.balanceOf(address(this));
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
        return (poolBalance(), _allLoanIds.length, p, a, r);
    }

    function utilizationBps() public view returns (uint256) {
        uint256 capacity = totalOutstandingPrincipal + poolBalance();
        if (capacity == 0) return 0;
        return (totalOutstandingPrincipal * 10_000) / capacity;
    }

    function borrowAprBps() public view returns (uint256) {
        uint256 u = utilizationBps();
        if (u <= kinkBps) {
            return baseRateBps + (slope1Bps * u) / kinkBps;
        }
        uint256 excess = u - kinkBps;
        uint256 maxExcess = 10_000 - kinkBps;
        return baseRateBps + slope1Bps + (slope2Bps * excess) / maxExcess;
    }

    function setBorrowApr(uint256 newBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newBps <= 5000, "apr too high");
        uint256 prev = baseRateBps;
        baseRateBps = newBps;
        emit BorrowAprUpdated(prev, newBps);
    }

    function setRateModel(
        uint256 newBaseRateBps,
        uint256 newSlope1Bps,
        uint256 newSlope2Bps,
        uint256 newKinkBps
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newBaseRateBps <= 5000, "base too high");
        require(newKinkBps > 0 && newKinkBps < 10_000, "bad kink");
        require(newBaseRateBps + newSlope1Bps + newSlope2Bps <= 10_000, "max rate too high");
        baseRateBps = newBaseRateBps;
        slope1Bps = newSlope1Bps;
        slope2Bps = newSlope2Bps;
        kinkBps = newKinkBps;
        emit RateModelUpdated(newBaseRateBps, newSlope1Bps, newSlope2Bps, newKinkBps);
    }

    function setMaxLtvBps(uint256 newMaxLtvBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMaxLtvBps > 0 && newMaxLtvBps <= 10_000, "bad ltv");
        maxLtvBps = newMaxLtvBps;
    }

    function setInstallmentPolicy(uint256 threshold, uint8 installments)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(installments > 0 && installments <= 60, "bad installments");
        installmentThreshold = threshold;
        defaultInstallments = installments;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
