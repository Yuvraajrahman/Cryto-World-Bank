// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IDownwardRateSource} from "./interfaces/IDownwardRateSource.sol";

/**
 * @title UpwardDepositFacility
 * @notice Voluntary upward surplus repatriation between adjacent tiers (thesis §3.9.2).
 */
contract UpwardDepositFacility is AccessControl, ReentrancyGuard {
  bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");

  uint256 public constant MAX_UPWARD_BPS = 3000; // 30% of depositor assets
  uint256 public constant DAILY_WITHDRAW_BPS = 2000; // 20% per day

  /// @notice delta (bps) the thesis requires the upward-deposit yield to stay
  ///         strictly below the parent's downward lending rate by:
  ///         r_up < r_down(U) - delta.
  uint256 public constant RATE_DELTA_BPS = 100; // 1%

  /// @notice Admin-configurable base yield paid to depositors, annualized bps.
  uint256 public depositRateBps = 150; // 1.5% base

  /// @notice Optional NationalBank/LocalBank contract representing the
  ///         parent's downward lending rate (implements IDownwardRateSource).
  address public downwardRateSource;

  event DepositRateUpdated(uint256 oldBps, uint256 newBps);
  event DownwardRateSourceSet(address indexed source);

  struct Deposit {
    uint256 id;
    address depositor;
    address parent;
    uint256 principal;
    uint256 withdrawn;
    uint256 depositedAt;
    uint256 lastWithdrawDay;
    uint256 withdrawnToday;
  }

  uint256 public nextDepositId = 1;
  mapping(uint256 => Deposit) public deposits;
  mapping(address => uint256[]) public depositsByDepositor;
  mapping(address => uint256) public totalUpwardByDepositor;

  event UpwardDepositMade(address indexed from, address indexed to, uint256 amount, uint256 depositId);
  event UpwardWithdrawn(address indexed depositor, address indexed parent, uint256 amount, uint256 depositId);

  constructor(address admin) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
  }

  /// @notice Lets the parent tier (or governance) top up this facility so it
  ///         can actually pay out principal + accrued yield on withdrawal —
  ///         depositUpward() forwards principal straight to the parent, so
  ///         without this the contract would hold no funds to repay from.
  receive() external payable {}

  function registerDepositor(address depositor) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(DEPOSITOR_ROLE, depositor);
  }

  /// @notice Wires this facility to the parent tier's downward-lending rate
  ///         source (a NationalBank or LocalBank instance) so deposit yield
  ///         can enforce r_up < r_down(U) - delta.
  function setDownwardRateSource(address source) external onlyRole(DEFAULT_ADMIN_ROLE) {
    downwardRateSource = source;
    emit DownwardRateSourceSet(source);
  }

  /// @notice Admin-configurable target yield. The rate actually paid is
  ///         min(depositRateBps, downwardRateBps() - delta - 1) — see
  ///         effectiveDepositRateBps().
  function setDepositRate(uint256 newBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
    require(newBps <= 2000, "rate too high"); // safety cap 20%
    uint256 prev = depositRateBps;
    depositRateBps = newBps;
    emit DepositRateUpdated(prev, newBps);
  }

  /// @notice The yield actually paid on upward deposits, capped so it stays
  ///         strictly below the parent's downward lending rate: thesis
  ///         constraint r_up < r_down(U) - delta (RATE_DELTA_BPS). Falls back
  ///         to the admin-set depositRateBps when no source is wired.
  function effectiveDepositRateBps() public view returns (uint256) {
    if (downwardRateSource == address(0)) return depositRateBps;
    uint256 downward = IDownwardRateSource(downwardRateSource).downwardRateBps();
    if (downward <= RATE_DELTA_BPS + 1) return 0;
    uint256 cap = downward - RATE_DELTA_BPS - 1; // strictly less than (r_down - delta)
    return depositRateBps < cap ? depositRateBps : cap;
  }

  function depositUpward(address parentInstitution) external payable onlyRole(DEPOSITOR_ROLE) nonReentrant {
    require(parentInstitution != address(0), "zero parent");
    require(msg.value > 0, "zero value");

    uint256 maxExposure = (address(msg.sender).balance + msg.value) * MAX_UPWARD_BPS / 10000;
    require(totalUpwardByDepositor[msg.sender] + msg.value <= maxExposure, "exposure cap");

    uint256 id = nextDepositId++;
    deposits[id] = Deposit({
      id: id,
      depositor: msg.sender,
      parent: parentInstitution,
      principal: msg.value,
      withdrawn: 0,
      depositedAt: block.timestamp,
      lastWithdrawDay: block.timestamp / 1 days,
      withdrawnToday: 0
    });
    depositsByDepositor[msg.sender].push(id);
    totalUpwardByDepositor[msg.sender] += msg.value;

    (bool ok, ) = payable(parentInstitution).call{value: msg.value}("");
    require(ok, "forward failed");

    emit UpwardDepositMade(msg.sender, parentInstitution, msg.value, id);
  }

  function withdrawUpward(uint256 depositId, uint256 amount) external nonReentrant {
    Deposit storage d = deposits[depositId];
    require(d.depositor == msg.sender, "not depositor");
    require(amount > 0, "zero amount");
    require(d.principal >= d.withdrawn + amount, "exceeds principal");

    uint256 day = block.timestamp / 1 days;
    if (d.lastWithdrawDay != day) {
      d.lastWithdrawDay = day;
      d.withdrawnToday = 0;
    }
    uint256 dailyCap = d.principal * DAILY_WITHDRAW_BPS / 10000;
    require(d.withdrawnToday + amount <= dailyCap, "daily cap");

    // Simple interest on the withdrawn slice — the yield side of
    // r_up < r_down(U) - delta. Paid from this contract's own balance (see
    // receive() above); the parent must keep the facility funded to honor it.
    uint256 daysHeld = (block.timestamp - d.depositedAt) / 1 days;
    uint256 interest = (amount * effectiveDepositRateBps() * daysHeld) / (10000 * 365);
    uint256 payout = amount + interest;

    require(address(this).balance >= payout, "facility illiquid");

    d.withdrawn += amount;
    d.withdrawnToday += amount;
    totalUpwardByDepositor[msg.sender] -= amount;

    (bool ok, ) = payable(msg.sender).call{value: payout}("");
    require(ok, "withdraw failed");

    emit UpwardWithdrawn(msg.sender, d.parent, payout, depositId);
  }

  function getDepositHistory(address institution) external view returns (uint256[] memory) {
    return depositsByDepositor[institution];
  }
}
