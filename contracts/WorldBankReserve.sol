// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title WorldBankReserve (Tier 1)
 * @notice Custodian of the global crypto reserve in MockUSDC (6 decimals).
 *         Holds deposits and lends capital to registered National Banks.
 */
contract WorldBankReserve is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant NATIONAL_BANK_ROLE = keccak256("NATIONAL_BANK_ROLE");

    IERC20 public usdc;

    uint256 public lendingAprBps = 300;
    uint256 public minReserveRatioBps = 1500;

    struct NationalBankAccount {
        bool registered;
        string name;
        string jurisdiction;
        uint256 allocated;
        uint256 outstanding;
        uint256 repaid;
    }

    mapping(address => NationalBankAccount) public nationalBanks;
    address[] private _nationalBankList;

    struct CapitalRequest {
        address bank;
        uint256 amount;
        bool open;
    }

    uint256 public nextCapitalRequestId = 1;
    mapping(uint256 => CapitalRequest) public capitalRequests;

    uint256 public totalDeposits;
    uint256 public totalAllocated;
    uint256 public totalRepaid;

    event UsdcTokenSet(address indexed token);
    event DepositReceived(address indexed from, uint256 amount);
    event NationalBankRegistered(address indexed bank, string name, string jurisdiction);
    event NationalBankRevoked(address indexed bank);
    event CapitalAllocated(address indexed bank, uint256 amount);
    event CapitalRequested(address indexed bank, uint256 amount, uint256 indexed requestId);
    event RepaymentRecorded(address indexed bank, uint256 principal, uint256 interest);
    event LendingAprUpdated(uint256 oldBps, uint256 newBps);
    event MinReserveRatioUpdated(uint256 oldBps, uint256 newBps);
    event EmergencyWithdrawal(address indexed to, uint256 amount);

    constructor(address governor) {
        _grantRole(DEFAULT_ADMIN_ROLE, governor);
        _grantRole(GOVERNOR_ROLE, governor);
    }

    function setUsdc(address token) external onlyRole(GOVERNOR_ROLE) {
        require(token != address(0), "zero token");
        usdc = IERC20(token);
        emit UsdcTokenSet(token);
    }

    function deposit(uint256 amount) external whenNotPaused nonReentrant {
        require(address(usdc) != address(0), "usdc not set");
        require(amount > 0, "zero deposit");
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        totalDeposits += amount;
        emit DepositReceived(msg.sender, amount);
    }

    function registerNationalBank(
        address bank,
        string calldata name,
        string calldata jurisdiction
    ) external onlyRole(GOVERNOR_ROLE) {
        require(bank != address(0), "zero address");
        require(!nationalBanks[bank].registered, "already registered");

        nationalBanks[bank] = NationalBankAccount({
            registered: true,
            name: name,
            jurisdiction: jurisdiction,
            allocated: 0,
            outstanding: 0,
            repaid: 0
        });
        _nationalBankList.push(bank);
        _grantRole(NATIONAL_BANK_ROLE, bank);

        emit NationalBankRegistered(bank, name, jurisdiction);
    }

    function revokeNationalBank(address bank) external onlyRole(GOVERNOR_ROLE) {
        require(nationalBanks[bank].registered, "not registered");
        require(nationalBanks[bank].outstanding == 0, "outstanding loan");
        nationalBanks[bank].registered = false;
        _revokeRole(NATIONAL_BANK_ROLE, bank);
        emit NationalBankRevoked(bank);
    }

    function listNationalBanks() external view returns (address[] memory) {
        return _nationalBankList;
    }

    function allocate(address bank, uint256 amount)
        public
        onlyRole(GOVERNOR_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(address(usdc) != address(0), "usdc not set");
        require(nationalBanks[bank].registered, "not a national bank");
        require(amount > 0, "zero amount");

        uint256 balance = usdc.balanceOf(address(this));
        require(balance >= amount, "reserve insufficient");

        uint256 projectedAllocated = totalAllocated + amount;
        uint256 projectedBalance = balance - amount;
        uint256 requiredReserve = (projectedAllocated * minReserveRatioBps) / 10_000;
        require(projectedBalance >= requiredReserve, "breaches reserve ratio");

        NationalBankAccount storage acc = nationalBanks[bank];
        acc.allocated += amount;
        acc.outstanding += amount;
        totalAllocated = projectedAllocated;

        usdc.safeTransfer(bank, amount);
        emit CapitalAllocated(bank, amount);
    }

    function allocateCapital(address bank, uint256 amount) external {
        allocate(bank, amount);
    }

    function requestCapital(uint256 amount) external onlyRole(NATIONAL_BANK_ROLE) returns (uint256 requestId) {
        require(amount > 0, "zero amount");
        require(nationalBanks[msg.sender].registered, "not registered");
        requestId = nextCapitalRequestId++;
        capitalRequests[requestId] = CapitalRequest({ bank: msg.sender, amount: amount, open: true });
        emit CapitalRequested(msg.sender, amount, requestId);
    }

    function fulfillCapitalRequest(uint256 requestId) external onlyRole(GOVERNOR_ROLE) {
        CapitalRequest storage r = capitalRequests[requestId];
        require(r.open, "closed");
        r.open = false;
        allocate(r.bank, r.amount);
    }

    function recordRepayment(uint256 principal, uint256 totalPaid)
        external
        onlyRole(NATIONAL_BANK_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(address(usdc) != address(0), "usdc not set");
        NationalBankAccount storage acc = nationalBanks[msg.sender];
        require(acc.outstanding >= principal, "principal too high");
        require(totalPaid >= principal, "insufficient payment");

        usdc.safeTransferFrom(msg.sender, address(this), totalPaid);

        acc.outstanding -= principal;
        acc.repaid += principal;
        totalRepaid += principal;

        uint256 interest = totalPaid - principal;
        emit RepaymentRecorded(msg.sender, principal, interest);
    }

    function setLendingApr(uint256 newBps) external onlyRole(GOVERNOR_ROLE) {
        require(newBps <= 5000, "apr too high");
        uint256 prev = lendingAprBps;
        lendingAprBps = newBps;
        emit LendingAprUpdated(prev, newBps);
    }

    function setMinReserveRatio(uint256 newBps) external onlyRole(GOVERNOR_ROLE) {
        require(newBps <= 5000, "ratio too high");
        uint256 prev = minReserveRatioBps;
        minReserveRatioBps = newBps;
        emit MinReserveRatioUpdated(prev, newBps);
    }

    function downwardRateBps() external view returns (uint256) {
        return lendingAprBps;
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }

    function emergencyWithdraw(address to, uint256 amount)
        external
        onlyRole(GOVERNOR_ROLE)
        whenPaused
        nonReentrant
    {
        require(address(usdc) != address(0), "usdc not set");
        require(amount <= usdc.balanceOf(address(this)), "exceeds balance");
        usdc.safeTransfer(to, amount);
        emit EmergencyWithdrawal(to, amount);
    }

    function reserveBalance() public view returns (uint256) {
        if (address(usdc) == address(0)) return 0;
        return usdc.balanceOf(address(this));
    }

    function systemStats()
        external
        view
        returns (
            uint256 balance,
            uint256 deposits,
            uint256 allocated,
            uint256 repaid,
            uint256 bankCount
        )
    {
        return (
            reserveBalance(),
            totalDeposits,
            totalAllocated,
            totalRepaid,
            _nationalBankList.length
        );
    }
}
