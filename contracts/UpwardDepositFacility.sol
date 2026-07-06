// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title UpwardDepositFacility
 * @notice Voluntary upward surplus repatriation between adjacent tiers (thesis §3.9.2).
 */
contract UpwardDepositFacility is AccessControl, ReentrancyGuard {
  bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");

  uint256 public constant MAX_UPWARD_BPS = 3000; // 30% of depositor assets
  uint256 public constant DAILY_WITHDRAW_BPS = 2000; // 20% per day

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

  function registerDepositor(address depositor) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(DEPOSITOR_ROLE, depositor);
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

    require(address(d.parent).balance >= amount, "parent illiquid");

    d.withdrawn += amount;
    d.withdrawnToday += amount;
    totalUpwardByDepositor[msg.sender] -= amount;

    (bool ok, ) = payable(msg.sender).call{value: amount}("");
    require(ok, "withdraw failed");

    emit UpwardWithdrawn(msg.sender, d.parent, amount, depositId);
  }

  function getDepositHistory(address institution) external view returns (uint256[] memory) {
    return depositsByDepositor[institution];
  }
}
