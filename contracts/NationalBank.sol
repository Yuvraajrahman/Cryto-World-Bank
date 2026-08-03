// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IWorldBankReserve} from "./interfaces/IWorldBankReserve.sol";

/**
 * @title NationalBank (Tier 2)
 * @notice Borrows MockUSDC from the World Bank reserve and re-allocates to Local Banks.
 */
contract NationalBank is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant LOCAL_BANK_ROLE = keccak256("LOCAL_BANK_ROLE");

    address public immutable worldBank;
    IERC20 public usdc;
    string public name;
    string public jurisdiction;

    uint256 public lendingAprBps = 500;
    uint256 public minReserveRatioBps = 1500;

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

    struct CapitalRequest {
        address bank;
        uint256 amount;
        bool open;
    }

    uint256 public nextCapitalRequestId = 1;
    mapping(uint256 => CapitalRequest) public capitalRequests;

    uint256 public totalAllocated;
    uint256 public totalRepaid;

    event UsdcTokenSet(address indexed token);
    event LocalBankRegistered(address indexed bank, string name, string region);
    event LocalBankRevoked(address indexed bank);
    event CapitalAllocated(address indexed bank, uint256 amount);
    event CapitalRequested(address indexed bank, uint256 amount, uint256 indexed requestId);
    event RepaymentRecorded(address indexed bank, uint256 principal, uint256 interest);
    event LendingAprUpdated(uint256 oldBps, uint256 newBps);
    event MinReserveRatioUpdated(uint256 oldBps, uint256 newBps);

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

    /// @dev Accepts legacy ETH upward-deposit forwards from UpwardDepositFacility.
    receive() external payable {}

    function setUsdc(address token) external onlyRole(GOVERNOR_ROLE) {
        require(token != address(0), "zero token");
        usdc = IERC20(token);
        emit UsdcTokenSet(token);
    }

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

    function allocate(address bank, uint256 amount)
        public
        onlyRole(GOVERNOR_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(address(usdc) != address(0), "usdc not set");
        require(localBanks[bank].registered, "not a local bank");
        require(amount > 0, "zero amount");

        uint256 balance = usdc.balanceOf(address(this));
        require(balance >= amount, "insufficient funds");

        uint256 projectedAllocated = totalAllocated + amount;
        uint256 projectedBalance = balance - amount;
        uint256 requiredReserve = (projectedAllocated * minReserveRatioBps) / 10_000;
        require(projectedBalance >= requiredReserve, "breaches reserve ratio");

        LocalBankAccount storage acc = localBanks[bank];
        acc.allocated += amount;
        acc.outstanding += amount;
        totalAllocated = projectedAllocated;

        usdc.safeTransfer(bank, amount);
        emit CapitalAllocated(bank, amount);
    }

    function allocateCapital(address bank, uint256 amount) external {
        allocate(bank, amount);
    }

    function requestCapital(uint256 amount) external onlyRole(LOCAL_BANK_ROLE) returns (uint256 requestId) {
        require(amount > 0, "zero amount");
        require(localBanks[msg.sender].registered, "not registered");
        requestId = nextCapitalRequestId++;
        capitalRequests[requestId] = CapitalRequest({ bank: msg.sender, amount: amount, open: true });
        emit CapitalRequested(msg.sender, amount, requestId);
    }

    function requestUpstreamCapital(uint256 amount) external onlyRole(GOVERNOR_ROLE) returns (uint256 requestId) {
        require(amount > 0, "zero amount");
        requestId = IWorldBankReserve(worldBank).requestCapital(amount);
        emit CapitalRequested(worldBank, amount, requestId);
    }

    function fulfillCapitalRequest(uint256 requestId) external onlyRole(GOVERNOR_ROLE) {
        CapitalRequest storage r = capitalRequests[requestId];
        require(r.open, "closed");
        r.open = false;
        allocate(r.bank, r.amount);
    }

    function recordRepayment(uint256 principal, uint256 totalPaid)
        external
        onlyRole(LOCAL_BANK_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(address(usdc) != address(0), "usdc not set");
        LocalBankAccount storage acc = localBanks[msg.sender];
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

    function downwardRateBps() external view returns (uint256) {
        return lendingAprBps;
    }

    function setMinReserveRatio(uint256 newBps) external onlyRole(GOVERNOR_ROLE) {
        require(newBps <= 5000, "ratio too high");
        uint256 prev = minReserveRatioBps;
        minReserveRatioBps = newBps;
        emit MinReserveRatioUpdated(prev, newBps);
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
        uint256 bal = address(usdc) == address(0) ? 0 : usdc.balanceOf(address(this));
        return (bal, totalAllocated, totalRepaid, _localBankList.length);
    }
}
