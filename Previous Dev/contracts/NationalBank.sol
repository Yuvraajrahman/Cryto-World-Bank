// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NationalBank (Tier 2)
 * @notice Borrows from the World Bank reserve and re-allocates capital to
 *         registered Local Banks in its jurisdiction. Interest rate to Local
 *         Banks is higher than the rate it pays upstream, producing the
 *         natural term structure described in the thesis (3% / 5% / 8%).
 */
contract NationalBank is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant LOCAL_BANK_ROLE = keccak256("LOCAL_BANK_ROLE");

    address public immutable worldBank;
    string public name;
    string public jurisdiction;

    /// @notice APR paid by Local Banks, in basis points. Default 5.00%.
    uint256 public lendingAprBps = 500;

    struct LocalBankAccount {
        bool registered;
        string name;
        string region;
        uint256 allocated;
        uint256 outstanding;
        uint256 repaid;
    }

    mapping(address => LocalBankAccount) public localBanks;
    address[] private _localBankList;

    uint256 public totalAllocated;
    uint256 public totalRepaid;

    event LocalBankRegistered(address indexed bank, string name, string region);
    event LocalBankRevoked(address indexed bank);
    event CapitalAllocated(address indexed bank, uint256 amount);
    event RepaymentRecorded(address indexed bank, uint256 principal, uint256 interest);
    event LendingAprUpdated(uint256 oldBps, uint256 newBps);

    constructor(
        address governor,
        address worldBankAddress,
        string memory bankName,
        string memory bankJurisdiction
    ) {
        require(worldBankAddress != address(0), "zero world bank");
        worldBank = worldBankAddress;
        name = bankName;
        jurisdiction = bankJurisdiction;

        _grantRole(DEFAULT_ADMIN_ROLE, governor);
        _grantRole(GOVERNOR_ROLE, governor);
    }

    receive() external payable {}

    // -------- Local bank registry --------

    function registerLocalBank(
        address bank,
        string calldata bankName,
        string calldata region
    ) external onlyRole(GOVERNOR_ROLE) {
        require(bank != address(0), "zero address");
        require(!localBanks[bank].registered, "already registered");

        localBanks[bank] = LocalBankAccount({
            registered: true,
            name: bankName,
            region: region,
            allocated: 0,
            outstanding: 0,
            repaid: 0
        });
        _localBankList.push(bank);
        _grantRole(LOCAL_BANK_ROLE, bank);

        emit LocalBankRegistered(bank, bankName, region);
    }

    function revokeLocalBank(address bank) external onlyRole(GOVERNOR_ROLE) {
        require(localBanks[bank].registered, "not registered");
        require(localBanks[bank].outstanding == 0, "outstanding loan");
        localBanks[bank].registered = false;
        _revokeRole(LOCAL_BANK_ROLE, bank);
        emit LocalBankRevoked(bank);
    }

    function listLocalBanks() external view returns (address[] memory) {
        return _localBankList;
    }

    // -------- Allocation & repayment --------

    function allocate(address bank, uint256 amount)
        external
        onlyRole(GOVERNOR_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(localBanks[bank].registered, "not a local bank");
        require(address(this).balance >= amount, "insufficient funds");
        require(amount > 0, "zero amount");

        LocalBankAccount storage acc = localBanks[bank];
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
        onlyRole(LOCAL_BANK_ROLE)
        whenNotPaused
        nonReentrant
    {
        LocalBankAccount storage acc = localBanks[msg.sender];
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
        require(newBps <= 5000, "apr too high");
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

    function bankStats()
        external
        view
        returns (
            uint256 balance,
            uint256 allocated,
            uint256 repaid,
            uint256 localBankCount
        )
    {
        return (
            address(this).balance,
            totalAllocated,
            totalRepaid,
            _localBankList.length
        );
    }
}
