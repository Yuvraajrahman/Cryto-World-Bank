// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title WorldBankReserve (Tier 1)
 * @notice Custodian of the global crypto reserve. Holds deposits and lends
 *         capital to registered National Banks at a configurable APR.
 *         Emits events so the off-chain indexer keeps the database in sync.
 *
 * @dev The contract intentionally keeps the lending logic minimal in this
 *      phase: it tracks per-National-Bank principal outstanding and exposes
 *      hooks (`accrueInterest`, `recordRepayment`) that can be extended with
 *      automated interest accrual + installment enforcement in a later sprint.
 */
contract WorldBankReserve is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant NATIONAL_BANK_ROLE = keccak256("NATIONAL_BANK_ROLE");

    /// @notice APR expressed in basis points (e.g. 300 = 3.00%).
    uint256 public lendingAprBps = 300;

    struct NationalBankAccount {
        bool registered;
        string name;
        string jurisdiction;
        uint256 allocated;   // total ever allocated to the bank
        uint256 outstanding; // principal currently owed to the reserve
        uint256 repaid;      // cumulative principal returned
    }

    mapping(address => NationalBankAccount) public nationalBanks;
    address[] private _nationalBankList;

    uint256 public totalDeposits;
    uint256 public totalAllocated;
    uint256 public totalRepaid;

    event DepositReceived(address indexed from, uint256 amount);
    event NationalBankRegistered(address indexed bank, string name, string jurisdiction);
    event NationalBankRevoked(address indexed bank);
    event CapitalAllocated(address indexed bank, uint256 amount);
    event RepaymentRecorded(address indexed bank, uint256 principal, uint256 interest);
    event LendingAprUpdated(uint256 oldBps, uint256 newBps);
    event EmergencyWithdrawal(address indexed to, uint256 amount);

    constructor(address governor) {
        _grantRole(DEFAULT_ADMIN_ROLE, governor);
        _grantRole(GOVERNOR_ROLE, governor);
    }

    // -------- Deposits --------

    receive() external payable {
        _recordDeposit(msg.sender, msg.value);
    }

    function deposit() external payable {
        _recordDeposit(msg.sender, msg.value);
    }

    function _recordDeposit(address from, uint256 amount) internal {
        require(amount > 0, "zero deposit");
        totalDeposits += amount;
        emit DepositReceived(from, amount);
    }

    // -------- National bank registry --------

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

    // -------- Allocation & repayment --------

    function allocate(address bank, uint256 amount)
        external
        onlyRole(GOVERNOR_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(nationalBanks[bank].registered, "not a national bank");
        require(address(this).balance >= amount, "reserve insufficient");
        require(amount > 0, "zero amount");

        NationalBankAccount storage acc = nationalBanks[bank];
        acc.allocated += amount;
        acc.outstanding += amount;
        totalAllocated += amount;

        (bool ok, ) = payable(bank).call{value: amount}("");
        require(ok, "transfer failed");

        emit CapitalAllocated(bank, amount);
    }

    function recordRepayment(uint256 principal)
        external
        payable
        onlyRole(NATIONAL_BANK_ROLE)
        whenNotPaused
        nonReentrant
    {
        NationalBankAccount storage acc = nationalBanks[msg.sender];
        require(acc.outstanding >= principal, "principal too high");
        require(msg.value >= principal, "insufficient value");

        acc.outstanding -= principal;
        acc.repaid += principal;
        totalRepaid += principal;

        uint256 interest = msg.value - principal;
        emit RepaymentRecorded(msg.sender, principal, interest);
    }

    // -------- Governance --------

    function setLendingApr(uint256 newBps) external onlyRole(GOVERNOR_ROLE) {
        require(newBps <= 5000, "apr too high"); // safety cap 50%
        uint256 prev = lendingAprBps;
        lendingAprBps = newBps;
        emit LendingAprUpdated(prev, newBps);
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }

    function emergencyWithdraw(address payable to, uint256 amount)
        external
        onlyRole(GOVERNOR_ROLE)
        whenPaused
        nonReentrant
    {
        require(amount <= address(this).balance, "exceeds balance");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "withdraw failed");
        emit EmergencyWithdrawal(to, amount);
    }

    // -------- Views --------

    function reserveBalance() external view returns (uint256) {
        return address(this).balance;
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
            address(this).balance,
            totalDeposits,
            totalAllocated,
            totalRepaid,
            _nationalBankList.length
        );
    }
}
